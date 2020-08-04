import 'whatwg-fetch'
import { QueryObject } from './index';
import { QueryGenerator } from './QueryGenerator';

/**
 * Used for querying a sensorthings server, that may return a next link
 */
export class STAInterface {
  baseUrl: String;
  constructor(baseUrl: String) {
    this.baseUrl = baseUrl;
  }


  getGeoJson(query: QueryObject) {
    return new Promise(async (resolve, reject) => {


      //Generate url
      var url = `${this.baseUrl}/${(new QueryGenerator(query).toString())}`;
      //get data
      var data = await (await fetch(url as any)).json()
      var link = data['@iot.nextLink'];
      //Get data as long as a next link is present
      while (link) {
        var response = await (await fetch(link)).json()
        //Push data in existing value array
        data.value.push(...response.value);
        //Update next link
        link = response['@iot.nextLink'];
      }
      resolve(data);
    });
  }
}