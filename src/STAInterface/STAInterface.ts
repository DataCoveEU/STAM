import 'whatwg-fetch'
import { QueryObject } from './../index';
import { QueryGenerator } from '../QueryGenerator/QueryGenerator';

export class STAInterface {
  queryObject: QueryObject;
  baseUrl: String;
  constructor(queryObject: QueryObject, baseUrl: String) {
    this.queryObject = queryObject;
    this.baseUrl = baseUrl;
  }

  getGeoJson(zoomLevel: Number, boundingBox: Array<Number>) {
    return new Promise((resolve, reject) => {
      var correctedQuery = this.queryObject;
      correctedQuery.select = ['id'];
      correctedQuery.expand = [<QueryObject>{ entityType: "Locations" }];

      var query = `${this.baseUrl}/${(new QueryGenerator(this.queryObject).toString())}`;
      fetch(query as any).then(async (data: any) => {
        resolve(await data.json());
      })
    });
  }
}