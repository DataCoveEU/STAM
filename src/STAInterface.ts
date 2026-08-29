import pThrottle from "p-throttle";
import type { Config, DataArray, Entity, QueryObject, StaResponse } from "./types";
import { QueryGenerator } from "./QueryGenerator";

//Browsers allow about this many parallel connections per host
const DEFAULT_MAX_CONCURRENT_REQUESTS = 5;

//Requests are not spaced out unless the config asks for it
const DEFAULT_REQUEST_DELAY = 0;

//A response either carries the entities, or the single entry of a dataArray query
type Page = Array<Entity> | DataArray;

function isDataArray(value: Page): value is DataArray {
  return !Array.isArray(value) && Array.isArray(value?.dataArray);
}

/**
 * The rows of a dataArray response, undefined when the query asked for entities
 */
function dataArrayOf(response: StaResponse<Page>): DataArray | undefined {
  const first = Array.isArray(response.value) ? response.value[0] : undefined;
  return first && Array.isArray(first.dataArray) ? (first as unknown as DataArray) : undefined;
}

/**
 * How much of the requested top a response holds already. An empty answer ends the paging
 */
function reached(value: Page): number {
  const length = isDataArray(value) ? value.dataArray.length : value.length;
  return length == 0 ? Infinity : length;
}

/**
 * Used for querying a sensorthings server, that may return a next link
 */
export class STAInterface {
  config: Config;

  //Sends at most maxConcurrentRequests per requestDelay
  private request: (url: string, options?: RequestInit) => Promise<Response>;

  constructor(config: Config) {
    this.config = config;

    const delay = config.requestDelay ?? DEFAULT_REQUEST_DELAY;
    //Wrapped, because fetch throws when it is called detached from its global
    const send = (url: string, options?: RequestInit) => fetch(url, options);

    this.request = delay
      ? pThrottle({
          limit: config.maxConcurrentRequests ?? DEFAULT_MAX_CONCURRENT_REQUESTS,
          interval: delay,
        })(send)
      : send;
  }

  //Waits for this request's place in the current wave
  private async fetchJson(url: string, options?: RequestInit): Promise<StaResponse<Page>> {
    return (await this.request(url, options)).json();
  }

  /**
   * Queries the service and follows its `@iot.nextLink` pages
   * @param query the query to run
   * @returns the merged response, a dataArray query answers with the rows instead of entities
   */
  async getGeoJson<T = Array<Entity>>(query: QueryObject): Promise<StaResponse<T>> {
    var limit: number | undefined = query.top;
    //Only query the given top elements, if a top value is present
    if (query.top == undefined || query.top == null) {
      query.top = 10000;
    }

    //Clone
    query = JSON.parse(JSON.stringify(query));

    //Generate url
    const url = `${this.config.baseUrl}/${new QueryGenerator(query, this.config).toString()}`;
    //get data
    const data = await this.fetchJson(url, this.config.fetchOptions);

    //A dataArray query answers with a single entry that carries all the rows
    const rows = dataArrayOf(data);
    if (rows) data.value = rows;

    var link = data["@iot.nextLink"];

    //Get data as long as a next link is present
    while (link && (limit == undefined || reached(data.value) < limit)) {
      const page = await this.fetchJson(link);
      const pageRows = dataArrayOf(page);

      if (pageRows && isDataArray(data.value)) {
        data.value.dataArray.push(...pageRows.dataArray);
      } else if (Array.isArray(data.value) && Array.isArray(page.value)) {
        //Push data in existing value array
        data.value.push(...page.value);
      }

      //Update next link
      link = page["@iot.nextLink"];
    }

    return data as StaResponse<T>;
  }
}
