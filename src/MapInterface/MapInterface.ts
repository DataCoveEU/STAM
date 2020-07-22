import { Config } from '../index';
import { STAInterface } from '../STAInterface/STAInterface';

export class MapInterface {
  config: Config;
  api: STAInterface
  constructor(config: Config) {
    this.config = config;
    this.api = new STAInterface(config.queryObject, config.baseUrl);
  }

  async getLayerData(zoom: Number, boundingBox: Array<Number>) {
    var data = await this.api.getGeoJson(zoom, boundingBox);
    console.log(data);
  }
}