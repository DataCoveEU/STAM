import 'whatwg-fetch'
import { QueryObject } from './../index';

export class STAInterface {
  queryObject: QueryObject;

  constructor(queryObject: QueryObject) {
    this.queryObject = queryObject;
  }

  getGeoJson(zoomLever: Number) {
    return new Promise((resolve, reject) => {
      resolve();
      /**fetch("http://date.jsontest.com/" as any).then(async (data: any) => {
        resolve(await data.json());
      })*/
    });
  }
}