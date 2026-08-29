import pThrottle from "p-throttle";
import type { Config, DataArray, Entity, LoadOptions, QueryObject, StaResponse } from "./types";
import { QueryGenerator } from "./QueryGenerator";

//Browsers allow about this many parallel connections per host
const DEFAULT_MAX_CONCURRENT_REQUESTS = 5;

//Requests are not spaced out unless the config asks for it
const DEFAULT_REQUEST_DELAY = 0;

//Entities a query without its own top loads at most, over all of its pages
export const DEFAULT_MAX_ENTITIES = 10000;

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
 * Rows a response holds already
 */
function loaded(value: Page): number {
  return isDataArray(value) ? value.dataArray.length : value.length;
}

/**
 * How much of the requested top a response holds already. An empty answer ends the paging
 */
function reached(value: Page): number {
  const length = loaded(value);
  return length == 0 ? Infinity : length;
}

/**
 * Drops what a service returned beyond the requested limit
 */
function trim(value: Page, limit: number) {
  if (isDataArray(value)) value.dataArray.length = Math.min(value.dataArray.length, limit);
  else value.length = Math.min(value.length, limit);
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
   * @param options abort signal and progress callback of the caller
   * @returns the merged response, a dataArray query answers with the rows instead of entities
   */
  async getGeoJson<T = Array<Entity>>(
    query: QueryObject,
    options?: LoadOptions,
  ): Promise<StaResponse<T>> {
    //A query without a top of its own stops at the configured maximum, instead of paging on forever
    const LIMIT = query.top ?? this.config.maxEntities ?? DEFAULT_MAX_ENTITIES;

    //Clone
    query = JSON.parse(JSON.stringify(query));
    query.top ??= LIMIT;

    //The next links go to the same service, so they carry the configured options as well
    const FETCH_OPTIONS: RequestInit | undefined = options?.signal
      ? { ...this.config.fetchOptions, signal: options.signal }
      : this.config.fetchOptions;

    //Generate url
    const url = `${this.config.baseUrl}/${new QueryGenerator(query, this.config).toString()}`;
    //get data
    const data = await this.fetchJson(url, FETCH_OPTIONS);

    //A dataArray query answers with a single entry that carries all the rows
    const rows = dataArrayOf(data);
    if (rows) data.value = rows;

    var link = data["@iot.nextLink"];
    options?.onProgress?.(loaded(data.value));

    //Get data as long as a next link is present and the limit is not reached
    while (link && reached(data.value) < LIMIT) {
      const page = await this.fetchJson(link, FETCH_OPTIONS);
      const pageRows = dataArrayOf(page);

      if (pageRows && isDataArray(data.value)) {
        data.value.dataArray.push(...pageRows.dataArray);
      } else if (Array.isArray(data.value) && Array.isArray(page.value)) {
        //Push data in existing value array
        data.value.push(...page.value);
      }

      //Update next link
      link = page["@iot.nextLink"];
      options?.onProgress?.(loaded(data.value));
    }

    //A service that ignores the top may hand out more than was asked for
    trim(data.value, LIMIT);

    return data as StaResponse<T>;
  }
}
