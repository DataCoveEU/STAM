import { Config } from '../index';
import { STAInterface } from '../STAInterface/STAInterface';

export class MapInterface {
  config: Config;
  api: STAInterface
  constructor(config: Config) {
    this.config = config;
    this.api = new STAInterface(config.queryObject, config.baseUrl);
  }

  async getLayerData(zoom: number, boundingBox: Array<number>) {
    var data: any = await this.api.getGeoJson(zoom, boundingBox);

    var locations = data.value.map((data: any) => { return data.Locations[0].location });
    var geojson = {
      'type': 'FeatureCollection',
      'features': locations
    };
    console.log(geojson);

    return geojson;
  }
}