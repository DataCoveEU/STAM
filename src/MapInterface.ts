import {
  Config,
  QueryObject
} from './index';
import {
  STAInterface
} from './STAInterface';
import * as p from 'polygon-clipping';
import {
  marker
} from 'leaflet';
import {
  QueryGenerator
} from './QueryGenerator';
const poly = (p as any).default;

export class MapInterface {
  config: Config;
  api: STAInterface;
  cache: any;
  loadedQuads: any;
  constructor(config: Config) {
    this.loadedQuads = {};
    this.cache = {};
    this.config = config;
    this.api = new STAInterface(config.baseUrl);
  }


  long2tile(lon: number, zoom: number) {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
  }
  lat2tile(lat: number, zoom: number) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
  }

  tile2long(x: number, z: number) {
    return (x / Math.pow(2, z) * 360 - 180);
  }
  tile2lat(y: number, z: number) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }

  coordinatesToOsm(coordinate: any, zoom: number) {
    var x = this.tile2long(this.long2tile(coordinate.x, zoom), zoom);
    var y = this.tile2lat(this.lat2tile(coordinate.y, zoom), zoom);
    return {
      x,
      y
    };
  }

  coordinatesToOsmBottom(coordinate: any, zoom: number) {
    var x = this.tile2long(this.long2tile(coordinate.x, zoom) + 1, zoom);
    var y = this.tile2lat(this.lat2tile(coordinate.y, zoom) + 1, zoom);
    return {
      x,
      y
    };
  }

  getOSMBoundingBox(zoomLevel: number, boundingBox: Array<number>): Array<number> {
    var topleft = {
      x: 0,
      y: 0
    };
    var bottomright = {
      x: 0,
      y: 0
    };
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

  async getLayerData(zoom: number, boundingBox: Array<number>) {

    var correctedQuery = JSON.parse(JSON.stringify(this.config.queryObject));

    if (correctedQuery.entityType == 'Things') {
      correctedQuery.select = ['id'];
      correctedQuery.expand = [<QueryObject>{
        entityType: "Locations"
      }];
    } else {
      correctedQuery.select = ['feature'];
    }

    var osmbb = this.getOSMBoundingBox(zoom, boundingBox);


    var topx = osmbb[0]
    var topy = osmbb[1];
    var bottomx = osmbb[2];
    var bottomy = osmbb[3];

    var geo;

    if (this.loadedQuads[zoom]) {
      var poly1: any = [
        [
          [topx, topy],
          [topx, bottomy],
          [bottomx, bottomy],
          [bottomx, topy],
          [topx, topy]
        ]
      ];


      this.loadedQuads[zoom].forEach((element: any) => {
        poly1 = poly.difference(poly1, [element]);
      });

      if (poly1[0])
        geo = `geo.intersects(${correctedQuery.entityType == 'Things' ? 'Locations/location' : 'feature'},geography'POLYGON ((${poly1[0][0].map((el: any) => { return el.join(' ') }).join(',')})) ')`;
      else
        return [];
    } else {
      geo = `geo.intersects(${correctedQuery.entityType == 'Things' ? 'Locations/location' : 'feature'},geography'POLYGON ((${topx} ${topy}, ${topx} ${bottomy}, ${bottomx} ${bottomy}, ${bottomx} ${topy} ,${topx} ${topy}))')`;
    }

    if (correctedQuery.filter) {
      correctedQuery.filter = `(${correctedQuery.filter}) and ${geo}`;
    } else {
      correctedQuery.filter = geo;
    }


    correctedQuery.top = 1000;

    var data: any = await this.api.getGeoJson(correctedQuery);

    var locations;
    if (correctedQuery.entityType == 'Things') {
      locations = data.value.map((data: any) => {
        return data.Locations[0].location
      });
    } else {
      locations = data.value.map((data: any) => {
        return data.feature
      });
    }

    var osmQuads: any = [];

    //Check if GeoJson Type is point, if not the GeoJson is not beeing changed
    if (locations[0] && locations[0].type == "Point") {
      ({ locations, osmQuads } = await this.cluster(locations, zoom, osmQuads));
    } else {
      osmQuads = locations;
    }

    if (this.cache[zoom])
      this.cache[zoom].features.push(...osmQuads);
    else
      this.cache[zoom] = {
        'type': 'FeatureCollection',
        'features': osmQuads,
      };

    return this.cache[zoom];
  }

  private async cluster(locations: any, zoom: number, osmQuads: any) {
    locations = locations.map((location: any) => {
      var top = this.coordinatesToOsm({
        x: location.coordinates[0],
        y: location.coordinates[1]
      }, zoom);
      var bottom = this.coordinatesToOsmBottom({
        x: location.coordinates[0],
        y: location.coordinates[1]
      }, zoom);
      var obj = {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [top.x, top.y],
              [top.x, bottom.y],
              [bottom.x, bottom.y],
              [bottom.x, top.y],
              [top.x, top.y]
            ]
          ]
        },
        "properties": {
          "count": 1
        }
      };
      return obj;
    });


    locations.forEach((element: any) => {
      var existing = osmQuads.find((geo: any) => {
        return geo.geometry.coordinates[0][0][0] == element.geometry.coordinates[0][0][0] && geo.geometry.coordinates[0][0][1] == element.geometry.coordinates[0][0][1];
      });

      if (!existing) {
        osmQuads.push(element);
        if (!this.loadedQuads[zoom])
          this.loadedQuads[zoom] = [];
        this.loadedQuads[zoom].push(element.geometry.coordinates);
      }
      else {
        existing.properties.count = existing.properties.count + 1;
      }
    });

    //Getting all markers
    var toMarker: any = [];

    osmQuads = osmQuads.filter((geo: any) => {
      //TODO use config
      if (geo.properties.count < 5) {
        toMarker.push(geo);
        return false;
      }
      else {
        return true;
      }
    });

    var combine: any;

    toMarker.forEach((elem: any, index: number) => {
      if (index == 0)
        return combine = elem.geometry.coordinates;
      combine = poly.union(combine, [elem.geometry.coordinates]);
    });

    if (combine) {

      var markerQuery = JSON.parse(JSON.stringify(this.config.queryObject));

      if (!markerQuery.expand)
        markerQuery.expand = [];

      if (!markerQuery.expand.includes((expand: QueryObject) => {
        return expand.entityType == 'Datastreams';
      })) {
        markerQuery.expand.push(<QueryObject>{
          entityType: "Datastreams",
          select: ["id", "name"]
        });
      }

      if (!markerQuery.expand.includes((expand: QueryObject) => {
        return expand.entityType == 'Location';
      })) {
        markerQuery.expand.push(<QueryObject>{
          entityType: "Locations",
        });
      }

      if (markerQuery.filter)
        markerQuery.filter = `(${markerQuery.filter}) and `;

      markerQuery.filter = markerQuery.filter ? markerQuery.filter : '' + combine.map((e: any) => {
        return `geo.intersects(Locations/location,geography'POLYGON ((${(e[0][0][0] ? e[0] : e).map((array: any) => { return array.join(' '); }).join(',')}))')`;
      }).join(' or ');


      var markers: any = await this.api.getGeoJson(markerQuery);

      markers.value.forEach((marker: any) => {
        var geoJson = marker.Locations[0].location;
        delete marker.Locations;
        geoJson.properties = marker;
        for (var datastream in marker.Datastreams) {
        }
        osmQuads.push(geoJson);
      });
    }
    return { locations, osmQuads };
  }
}