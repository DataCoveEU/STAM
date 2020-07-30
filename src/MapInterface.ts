import {
  Config,
  QueryObject
} from './index';
import {
  STAInterface
} from './STAInterface';
// @ts-ignore
import * as p from 'polygon-clipping';
const poly = (p as any).default;

//@ts-ignore
import * as turf from '@turf/turf'



export class MapInterface {
  config: Config;
  api: STAInterface;
  //Stores the cached geojson
  cache: any;
  constructor(config: Config) {
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

    if (this.cache[zoom]) {
      var poly1: any = [
        [
          [topx, topy],
          [topx, bottomy],
          [bottomx, bottomy],
          [bottomx, topy],
          [topx, topy]
        ]
      ];

      var onlyPolys: any = this.cache[zoom].features.filter((geo: any) => {
        return geo.properties.count;
      });

      onlyPolys = onlyPolys.map((geo: any) => {
        return geo.geometry.coordinates;
      });

      var substracted = poly.difference(poly1, ...onlyPolys);

      if (substracted[0]) {
        geo = polygonToFilter(substracted, correctedQuery.entityType);
      } else
        return this.cache[zoom];
    } else {
      geo = `geo.intersects(${correctedQuery.entityType == 'Things' ? 'Locations/location' : 'feature'},geography'POLYGON ((${topx} ${topy}, ${topx} ${bottomy}, ${bottomx} ${bottomy}, ${bottomx} ${topy} ,${topx} ${topy}))')`;
    }


    if (correctedQuery.filter) {
      correctedQuery.filter = `(${correctedQuery.filter}) and ${geo}`;
    } else {
      correctedQuery.filter = geo;
    }


    correctedQuery.top = 1000;

    var data: any;

    data = await this.api.getGeoJson(correctedQuery);

    if (!this.cache[zoom]) {
      this.cache[zoom] = {
        "type": "FeatureCollection",
        "features": []
      }
    }


    if (data) {
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

      //Check if GeoJson Type is point, if not the GeoJson is not beeing changed
      if (locations[0] && locations[0].type == "Point") {
        await this.cluster(locations, zoom);
      } else {
        this.cache[zoom].features.push(...locations);
      }
    }

    return this.cache[zoom];
  }

  private async cluster(locations: any, zoom: number) {
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

    var tiles: any = [];

    locations.forEach((feature: any) => {
      var existing = tiles.find((feature2: any) => {
        return compare_features(feature, feature2);
      });

      if (!existing) {
        tiles.push(feature);
      }
      else {
        existing.properties.count = existing.properties.count + 1;
      }
    });

    //Filter out all existing tiles
    tiles = tiles.filter((feature: any) => {
      return !this.cache[zoom].features.some((feature2: any) => {
        return compare_features(feature, feature2);
      })
    });

    //Getting all markers
    var toMarker: any = [];

    tiles = tiles.filter((geo: any) => {
      //TODO use config
      if (geo.properties.count < 5) {
        toMarker.push([geo.geometry.coordinates]);
        return false;
      }
      else {
        return true;
      }
    });

    //Push tiles to cache
    this.cache[zoom].features.push(...tiles);

    if (toMarker.length != 0) {
      var combine: any = poly.union(...toMarker);

      if (combine) {

        var markerQuery = JSON.parse(JSON.stringify(this.config.queryObject));

        if (!markerQuery.expand)
          markerQuery.expand = [];

        if (!markerQuery.expand.some((expand: QueryObject) => {
          return expand.entityType == 'Datastreams';
        })) {
          markerQuery.expand.push(<QueryObject>{
            entityType: "Datastreams",
            select: ["id", "name"]
          });
        }

        if (!markerQuery.expand.some((expand: QueryObject) => {
          return expand.entityType == 'Location';
        })) {
          markerQuery.expand.push(<QueryObject>{
            entityType: "Locations",
          });
        }

        if (markerQuery.filter)
          markerQuery.filter = `(${markerQuery.filter}) and `;

        markerQuery.filter = markerQuery.filter ? markerQuery.filter : '' + polygonToFilter(combine, markerQuery.entityType);


        var markers: any = await this.api.getGeoJson(markerQuery);

        markers.value.forEach((marker: any) => {
          var geoJson = marker.Locations[0].location;
          delete marker.Locations;
          geoJson.properties = marker;
          for (var datastream in marker.Datastreams) {
          }
          if (!this.cache[zoom].features.some((feature: any) => {
            return compare_features(geoJson, feature);
          })) {
            this.cache[zoom].features.push(geoJson);
          }
        });
      }
    }
  }
}

/**
 * 
 * @param f1 feature to be compared
 * @param f2 feature to be compared
 * @returns true if the features are the same
 */
function compare_features(f1: any, f2: any): boolean {
  //Check if the type is the same
  if (f1.type != f2.type) return false;

  //If feature is a point, the coordinates can be compared directly
  if (f1.type == "Point") return polygon_compare(f1.coordinates, f2.coordinates);

  //If it is a polygon or something else, the coordinates need to be gotten from the geometry object
  return polygon_compare(f1.geometry.coordinates, f2.geometry.coordinates);
}

/**
 * Deep comparing two arrays
 * @param a1 Array to be compared
 * @param a2 Array to be compared
 * @returns true if the same
 */
function polygon_compare(a1: any, a2: any): boolean {
  return JSON.stringify(a1) === JSON.stringify(a2);
}

/**
 * Converts a polygon into a valid filter for a sensorthings API
 * @param multipolygon polgon or multipolygon to convert
 * @returns valid filter
 */
function polygonToFilter(multipolygon: any, entityType: string): string {
  return multipolygon.map((polygon: any) => {
    //Check if polygon is a multipolygon
    if (polygon[0][0][0] != undefined) {
      //Multipolygon
      polygon = polygon[0];
    }
    return `geo.intersects(${entityType == 'Things' ? 'Locations/location' : 'feature'},geography'POLYGON ((${polygon.map((array: any) => { return array.join(' '); }).join(',')}))')`;
  }).join(' or ');
}