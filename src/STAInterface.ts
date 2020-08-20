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

    var limit: number = query.top;
    //Only query the given top elements, if a top value is present
    if (query.top == undefined || query.top == null) {
      query.top = 10000;
    }

    //Clone
    query = JSON.parse(JSON.stringify(query));
    //Set count to true
    query.count = true;
    return new Promise(async (resolve, reject) => {
      //Generate url
      var url = `${this.baseUrl}/${(new QueryGenerator(query).toString())}`;
      //get data
      var data = await (await fetch(url as any)).json()
      if (data.value[0] && data.value[0].dataArray) {
        data.value = data.value[0];
      }
      var link = data['@iot.nextLink'];

      //Get data as long as a next link is present
      while (link && (limit == undefined || ((data.value.length && data.value.length < limit) || (data.value.dataArray && data.value.dataArray.length < limit)))) {
        var response = await (await fetch(link)).json()

        if (response.value[0] && response.value[0].dataArray) {
          data.value.dataArray.push(...response.value[0].dataArray);
        } else {
          //Push data in existing value array
          data.value.push(...response.value);
        }
        //Update next link
        link = response['@iot.nextLink'];
      }
      console.log(data);
      resolve(data);
    });
  }
}