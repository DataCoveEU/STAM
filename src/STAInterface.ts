import pLimit, { type LimitFunction } from "p-limit";
import type { Config, QueryObject } from "./types";
import { QueryGenerator } from "./QueryGenerator";

//Browsers allow about this many parallel connections per host
const DEFAULT_MAX_CONCURRENT_REQUESTS = 5;

/**
 * Used for querying a sensorthings server, that may return a next link
 */
export class STAInterface {
  config: Config;

  //Caps the requests this interface has in flight at once
  private limit: LimitFunction;

  constructor(config: Config) {
    this.config = config;
    this.limit = pLimit(config.maxConcurrentRequests ?? DEFAULT_MAX_CONCURRENT_REQUESTS);
  }

  //Waits for a free slot before requesting
  private fetchJson(url: string, options?: RequestInit): Promise<any> {
    return this.limit(async () => (await fetch(url, options)).json());
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
