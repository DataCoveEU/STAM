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
      if (this.queryObject.entityType == 'Things') {
        var topx = boundingBox[1]
        var topy = boundingBox[0];
        var bottomx = boundingBox[3];
        var bottomy = boundingBox[2];

        var geo = `geo.intersects(Locations/location,geography'POLYGON ((${topx} ${topy}, ${topx} ${bottomy}, ${bottomx} ${topy}, ${bottomx} ${bottomy},${topx} ${topy}))')`;
        if (correctedQuery.filter) {
          correctedQuery.filter = `(${correctedQuery.filter}) and ${geo}`;
        } else {
          correctedQuery.filter = geo;
        }
      }

      var query = `${this.baseUrl}/${(new QueryGenerator(this.queryObject).toString())}`;
      fetch(query as any).then(async (data: any) => {
        var data = await data.json();
        var link = data['@iot.nextLink'];
        while (link) {
          var response = await (await fetch(link)).json()
          data.value.push(...response.value);
          console.log(response);
          link = response['@iot.nextLink'];
        }
      })
    });
  }
}