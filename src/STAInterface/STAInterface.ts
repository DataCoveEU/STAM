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

  long2tile(lon: number, zoom: number) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); }
  lat2tile(lat: number, zoom: number) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); }

  tile2long(x: number, z: number) {
    return (x / Math.pow(2, z) * 360 - 180);
  }
  tile2lat(y: number, z: number) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }

  getOSMBoundingBox(zoomLevel: number, boundingBox: Array<number>): Array<number> {
    var topleft = { x: 0, y: 0 };
    var bottomright = { x: 0, y: 0 };
    var xT = this.long2tile(boundingBox[0], zoomLevel);
    var yT = this.lat2tile(boundingBox[1], zoomLevel);

    topleft.x = this.tile2long(xT + 1, zoomLevel);
    topleft.y = this.tile2lat(yT, zoomLevel);

    //Getting the bottom right corner of the tile
    var xB = this.long2tile(boundingBox[2], zoomLevel);
    var yB = this.lat2tile(boundingBox[3], zoomLevel);

    bottomright.x = this.tile2long(xB, zoomLevel);
    bottomright.y = this.tile2lat(yB + 1, zoomLevel);

    return [topleft.x, topleft.y, bottomright.x, bottomright.y];
  }

  getGeoJson(zoomLevel: number, boundingBox: Array<number>) {
    return new Promise(async (resolve, reject) => {
      var correctedQuery = this.queryObject;
      correctedQuery.select = ['id'];
      correctedQuery.expand = [<QueryObject>{ entityType: "Locations" }];
      if (this.queryObject.entityType == 'Things') {
        var osmbb = this.getOSMBoundingBox(zoomLevel, boundingBox);
        console.log(osmbb);

        var topx = osmbb[0]
        var topy = osmbb[1];
        var bottomx = osmbb[2];
        var bottomy = osmbb[3];

        var geo = `geo.intersects(Locations/location,geography'POLYGON ((${topx} ${topy}, ${topx} ${bottomy}, ${bottomx} ${bottomy}, ${bottomx} ${topy} ,${topx} ${topy}))')`;
        if (correctedQuery.filter) {
          correctedQuery.filter = `(${correctedQuery.filter}) and ${geo}`;
        } else {
          correctedQuery.filter = geo;
        }
      }

      var query = `${this.baseUrl}/${(new QueryGenerator(this.queryObject).toString())}`;
      var data = await (await fetch(query as any)).json()
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