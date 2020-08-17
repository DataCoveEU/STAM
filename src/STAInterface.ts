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

    //Clone
    query = JSON.parse(JSON.stringify(query));
    //Set count to true
    query.count = true;
    return new Promise(async (resolve, reject) => {
      //Generate url
      var url = `${this.baseUrl}/${(new QueryGenerator(query).toString())}`;
      //get data
      var data = await (await fetch(url as any)).json()
      var link = data['@iot.nextLink'];

      /* 
            if (query.top != 0) {
              var promiseArray = [];
              for (var x = 1; x <= Math.ceil((data['@iot.count'] / (query.top as number))); x++) {
                if (x > 10) break;
                query.skip = x * (query.top as number);
                promiseArray.push(fetch(`${this.baseUrl}/${new QueryGenerator(query).toString()}`).then((response: any) => { return response.json() }))
              }
      
              var values = await Promise.all(promiseArray);
      
              values.forEach((json: any) => {
                data.value.push(...json.value);
              });
            } */

      resolve(data);

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