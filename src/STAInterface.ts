import pThrottle from "p-throttle";
import type { Config, QueryObject } from "./types";
import { QueryGenerator } from "./QueryGenerator";

//Browsers allow about this many parallel connections per host
const DEFAULT_MAX_CONCURRENT_REQUESTS = 5;

//Requests are not spaced out unless the config asks for it
const DEFAULT_REQUEST_DELAY = 0;

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
  private async fetchJson(url: string, options?: RequestInit): Promise<any> {
    return (await this.request(url, options)).json();
  }

  async getGeoJson(query: QueryObject): Promise<any> {
    var limit: number | undefined = query.top;
    //Only query the given top elements, if a top value is present
    if (query.top == undefined || query.top == null) {
      query.top = 10000;
    }

    //Clone
    query = JSON.parse(JSON.stringify(query));

    //Generate url
    var url = `${this.config.baseUrl}/${new QueryGenerator(query, this.config).toString()}`;
    //get data
    var data = await this.fetchJson(url, this.config.fetchOptions);
    if (data.value[0] && data.value[0].dataArray) {
      data.value = data.value[0];
    }
    var link = data["@iot.nextLink"];

    //Get data as long as a next link is present
    while (
      link &&
      (limit == undefined ||
        (data.value.length && data.value.length < limit) ||
        (data.value.dataArray && data.value.dataArray.length < limit))
    ) {
      var response = await this.fetchJson(link);

      if (response.value[0] && response.value[0].dataArray) {
        data.value.dataArray.push(...response.value[0].dataArray);
      } else {
        //Push data in existing value array
        data.value.push(...response.value);
      }
      //Update next link
      link = response["@iot.nextLink"];
    }

    return data;
  }
}
