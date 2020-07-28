import 'whatwg-fetch'
import { QueryObject } from './index';
import { QueryGenerator } from './QueryGenerator';

export class STAInterface {
  baseUrl: String;
  constructor(baseUrl: String) {
    this.baseUrl = baseUrl;
  }


  getGeoJson(query: QueryObject) {
    return new Promise(async (resolve, reject) => {


      var url = `${this.baseUrl}/${(new QueryGenerator(query).toString())}`;
      var data = await (await fetch(url as any)).json()
      var link = data['@iot.nextLink'];
      while (link) {
        var response = await (await fetch(link)).json()
        data.value.push(...response.value);
        link = response['@iot.nextLink'];
      }


      resolve(data);
    });
  }
}