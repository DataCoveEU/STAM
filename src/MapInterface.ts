import { EventEmitter } from "events";
import {
  Config,
  QueryObject,

  Range, RangeQuery
} from './index';
import { STAInterface } from './STAInterface';

export class MapInterface extends EventEmitter {
  config: Config;
  api: STAInterface;
  //Stores the cached geojson
  cache: Array<CacheObject>;
  constructor(config: Config) {
    super();
    this.cache = [];
    this.config = config;
    this.api = new STAInterface(config.baseUrl);
  }


  /**
   * Converts the longitude to a OSM tile number
   * @param lon longitude
   * @param zoom current zoom level
   * @returns OSM tile number
   */
  long2tile(lon: number, zoom: number) {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
  }

  /**
   * Converts the latitude to a OSM tile number
   * @param lat latitude 
   * @param zoom current zoom level
   * @returns OSM tile number
   */
  lat2tile(lat: number, zoom: number) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
  }

  /**
   * OSM tile number to the upper left longitude
   * @param x osm tile number
   * @param z osm tile number
   * @returns longitude of upper right point of the OSM tile
   */
  tile2long(x: number, z: number) {
    return (x / Math.pow(2, z) * 360 - 180);
  }

  /**
   * OSM tile number to the upper left latitude
   * @param x osm tile number
   * @param z osm tile number
   * @returns latitude of upper right point of the OSM tile
   */
  tile2lat(y: number, z: number) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }

  /**
   * Converts latitude and longitude coordinates to the upper left point of the OSM tile the point intersects with
   * @param coordinate object of latitude and longitude coordinates of a point. For example: {lat, lng}
   * @param zoom current zoom level
   * @returns object with latitude and longitude of the OSM tile's upper left corner
   */
  coordinatesToOsm(coordinate: any, zoom: number) {
    var lat = this.tile2long(this.long2tile(coordinate.lat, zoom), zoom);
    var lng = this.tile2lat(this.lat2tile(coordinate.lng, zoom), zoom);
    return {
      lat,
      lng
    };
  }

  /**
  * Converts latitude and longitude coordinates to the bottom right point of the OSM tile the point intersects with
  * @param coordinate object of latitude and longitude coordinates of a point. For example: {lat, lng}
  * @param zoom current zoom level
  * @returns object with latitude and longitude of the OSM tile's bottom right corner
  */
  coordinatesToOsmBottom(coordinate: any, zoom: number) {
    var lat = this.tile2long(this.long2tile(coordinate.lat, zoom) + 1, zoom);
    var lng = this.tile2lat(this.lat2tile(coordinate.lng, zoom) + 1, zoom);
    return {
      lat,
      lng
    };
  }

  /**
   * Converts the bounding box of the map's view to the bounding box of the OSM tiles the map's bounding box intersects with
   * @param zoomLevel the current zoom level
   * @param boundingBox map's view's bounding box [topLat, topLong, bottomLat, bottomLong]
   * @returns the bounding box of the OSM tiles the map's bounding box intersects with
   */
  getOSMBoundingBox(zoomLevel: number, boundingBox: Array<number>): Array<number> {
    var topleft = {
      lat: 0,
      lng: 0
    };
    var bottomright = {
      lat: 0,
      lng: 0
    };


    var latTop = this.long2tile(boundingBox[0], zoomLevel);
    var longTop = this.lat2tile(boundingBox[1], zoomLevel);

    topleft.lat = this.tile2long(latTop + 1, zoomLevel);
    topleft.lng = this.tile2lat(longTop, zoomLevel);

    var latBottom = this.long2tile(boundingBox[2], zoomLevel);
    var longBottom = this.lat2tile(boundingBox[3], zoomLevel);

    //Getting the bottom right corner of the tile
    bottomright.lat = this.tile2long(latBottom, zoomLevel);
    bottomright.lng = this.tile2lat(longBottom + 1, zoomLevel);

    return [topleft.lat, topleft.lng, bottomright.lat, bottomright.lng];
  }

  /**
   * Get a QueryObject based on the current zoom level
   * @param zoom Zoom level
   */
  getQuery(zoom: number) {
    //Check if it is a QueryObject
    if ("entityType" in this.config.queryObject) {
      return (this.config.queryObject as QueryObject)
    } else {
      //Get all queries
      var range = (this.config.queryObject as Array<RangeQuery>);
      //Iterate through all
      for (var rangeQuery of range) {
        if (isNaN(Number(rangeQuery.zoomLevel))) {
          //Object
          var zoomObject = (rangeQuery.zoomLevel as Range);
          //to must not be specified
          if (zoomObject.to) {
            //Check if it is in the given range
            if (zoom >= zoomObject.from && zoom <= zoomObject.to) {
              return rangeQuery.query;
            }
          } else {
            //Check if it is greater than specified
            if (zoom >= zoomObject.from) {
              return rangeQuery.query;
            }
          }
        } else {
          //Number
          var number = (rangeQuery.zoomLevel as number);
          if (number == zoom) {
            return rangeQuery.query;
          }
        }
      }
      throw new Error("No Query specified for the zoomLevel: " + zoom);
    }
  }

  /**
   * Gets a GeoJSON from the current zoom level and bounding box, the fetched data is cached
   * @param zoom current zoom level
   * @param boundingBox map's bounding box
   * @returns a GeoJSON with polygons as clusters with the property count as the count of things inside the cluster, but only if the things are points. If not the thing's location is returned.
   */
  async getLayerData(zoom: number, boundingBox: Array<number>) {

    //If all data is cached, no event would be emitted
    this.emitChange(zoom);

    //Removing the reference to config.queryObject 
    var correctedQuery: QueryObject = JSON.parse(JSON.stringify(this.getQuery(zoom)));

    //Checking if the queried entityType is things
    if (correctedQuery.entityType == 'Things') {
      correctedQuery.select = ['id'];
      correctedQuery.expand = [<QueryObject>{
        entityType: "Locations"
      }];
    } else {
      if (correctedQuery.entityType == 'FeaturesOfInterest') {
        //If it is a FeaturesOfInterest
        correctedQuery.select = ['feature'];
      } else {
        throw new Error("Only Things and FeaturesOfInterest are supported");
      }
    }


    //Only query the count not the data
    correctedQuery.count = true;
    correctedQuery.top = 0;

    //Get the coordinates of the top left and bottom right
    var top = { lat: this.lat2tile(boundingBox[1], zoom), lng: this.long2tile(boundingBox[0], zoom) };
    var bottom = { lat: this.lat2tile(boundingBox[3], zoom), lng: this.long2tile(boundingBox[2], zoom) };


    var recs: any = [];

    var promises: any = [];

    //Iterate all OSM tiles
    for (var x = bottom.lng; x <= top.lng; x++) {
      for (var y = top.lat; y <= bottom.lat; y++) {
        //Get top and bottom coordinates
        const T = { lat: this.tile2lat(y, zoom), lng: this.tile2long(x, zoom) };
        const B = { lat: this.tile2lat(y + 1, zoom), lng: this.tile2long(x + 1, zoom) };

        //Clone the query object
        const QUERYCOPY = JSON.parse(JSON.stringify(correctedQuery));

        //Get the ST filter
        const GEOFILTER = polygonToFilter([
          [
            [T.lng, T.lat],
            [T.lng, B.lat],
            [B.lng, B.lat],
            [B.lng, T.lat],
            [T.lng, T.lat]
          ]
        ], QUERYCOPY.entityType);

        //Append it to old filter if given
        if (QUERYCOPY.filter) {
          QUERYCOPY.filter = `(${QUERYCOPY.filter}) and ${GEOFILTER}`;
        } else {
          QUERYCOPY.filter = GEOFILTER;
        }

        //Create a geojson polygon with tbe given coordinates
        const feature = {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [T.lng, T.lat],
                [T.lng, B.lat],
                [B.lng, B.lat],
                [B.lng, T.lat],
                [T.lng, T.lat]
              ]
            ]
          },
          "properties": {
            "count": 0
          }
        };

        //Check if a polygon is already present
        const existing = this.getCached(zoom).features.find((feature2: any) => {
          return compare_features(feature, feature2);
        });

        if (!existing) {
          promises.push(new Promise(async (resolve, reject) => {
            if (this.config.cluster || this.config.cluster == undefined) {
              var data: any = await this.api.getGeoJson(QUERYCOPY);
              feature.properties.count = data["@iot.count"];
              this.addToCache(zoom, feature);
            } else {
              this.addToCache(zoom, feature, false);
            }
            resolve(feature);
          }));
        }
      }
    }

    var counts = await Promise.all(promises);

    counts.forEach((feature: any) => {
      recs.push(feature);
    });

    var toMarker: any = [];

    //Iterate all polygons
    recs.forEach((feature: any) => {
      //Check if markers should be loaded
      if ((feature.properties.count < this.config.clusterMin) || this.config.cluster == false) {
        toMarker.push(feature.geometry.coordinates);
      }
    });

    //Load markers
    await this.getMarkers(toMarker, zoom);


  }

  private async getMarkers(toMarker: any, zoom: number) {
    if (toMarker.length != 0) {


      //Remove reference to config.queryObject
      var markerQuery = JSON.parse(JSON.stringify(this.getQuery(zoom)));
      markerQuery.top = 1000;

      if (markerQuery.entityType == "Things") {
        //Check if expand is specified in the queryObject
        if (!markerQuery.expand)
          markerQuery.expand = [];

        //Check if a queryObject to expand the datastream with id and name is specified
        var datastreamQuery = markerQuery.expand.find((expand: QueryObject) => {
          return expand.entityType == 'Datastreams';
        });

        if (!datastreamQuery) {
          markerQuery.expand.push(<QueryObject>{
            entityType: "Datastreams",
            select: ["id", "name", "unitOfMeasurement"],
            expand: [<QueryObject>{ entityType: 'observedProperty' }]
          });
        }
        else {
          if (!datastreamQuery.select) {
            datastreamQuery.select = ["id", "name", "unitOfMeasurement"];
          }
          if (!datastreamQuery.select.includes("id")) {
            datastreamQuery.select.push("id");
          }

          if (!datastreamQuery.select.includes("name")) {
            datastreamQuery.select.push("name");
          }

          if (!datastreamQuery.select.includes("unitOfMeasurement")) {
            datastreamQuery.select.push("unitOfMeasurement");
          }
        }

        //Check if the Location was expanded
        if (!markerQuery.expand.some((expand: QueryObject) => {
          return expand.entityType == 'Locations';
        })) {
          markerQuery.expand.push(<QueryObject>{
            entityType: "Locations",
          });
        }
      }
      else {
        //Add feature to select, if it queries for the FeaturesOfInterest
        if (markerQuery.select && !markerQuery.select.includes('feature')) {
          markerQuery.select.push('feature');
        }

        markerQuery.expand = [<QueryObject>{ entityType: 'Observations', top: 1, expand: [<QueryObject>{ entityType: 'Datastream', select: ['unitOfMeasurement', 'id'], expand: [<QueryObject>{ entityType: 'observedProperty' }] }] }]
      }


      //If a filter is already specified, append the geometry query to the old filter
      if (markerQuery.filter)
        markerQuery.filter = `(${markerQuery.filter}) and `;

      var promises = [];

      for (var cord of toMarker) {
        var query = JSON.parse(JSON.stringify(markerQuery));
        query.filter = polygonToFilter(cord, query.entityType);
        promises.push(new Promise(async (resolve, reject) => {
          var markers: any = await this.api.getGeoJson(query);

          markers.value.forEach((marker: any) => {
            //Get the geoJson of the marker
            var geoJson: any;
            if (markerQuery.entityType == 'Things')
              geoJson = marker.Locations[0].location;
            else
              geoJson = marker.feature;

            //Fix the geojson if it is not nested in a feature, because openlayer wouldn't save the properties 
            if (geoJson.type == "Point") {
              geoJson =
              {
                "type": "Feature",
                "geometry": geoJson
              }
            }


            delete marker.Locations;
            geoJson.properties = marker;
            if (!marker.getData)
              marker.getData = {};
            if (markerQuery.entityType == 'Things') {
              //Iterate through the datastreams
              for (var datastream of marker.Datastreams) {
                this.addGetDataCallback(datastream, marker);
              }
            } else {
              const DATASTREAM = marker.Observations[0].Datastream;
              this.addGetDataCallback(DATASTREAM, marker);
            }

            //Check if the marker is already in the cache
            if (!this.getCached(zoom).features.some((feature: any) => {
              return compare_features(geoJson, feature);
            })) {
              this.addToCache(zoom, geoJson);
            }
          });
          resolve();
        }))
      }

      await Promise.all(promises);
    }

  }

  private addGetDataCallback(datastream: any, marker: any) {
    const id = datastream['@iot.id'];
    const unitOfMeasurement = datastream.unitOfMeasurement;
    marker.getData[datastream.ObservedProperty.name] = function (configureQuery: Function) {
      var datastreamQuery = <QueryObject>{ entityType: "Datastreams", id, pathSuffix: 'Observations' };
      datastreamQuery = configureQuery(datastreamQuery);
      return new Promise(async (resolve, reject) => {
        var data = await this.api.getGeoJson(datastreamQuery);
        data.unitOfMeasurement = unitOfMeasurement;
        resolve(data);
      });
    }.bind(this);
  }

  getCached(zoom: number) {
    if (this.config.cachingDuration) {
      this.cache = this.cache.filter(function (cache: CacheObject) {
        //Clone date
        var date = new Date(cache.timestamp);
        //Add caching time
        date.setSeconds(cache.timestamp.getSeconds() + this.config.cachingDuration);
        //Check if date should be removed
        return date > new Date();
      }.bind(this));
    }
    var toReturn: any = {
      "type": "FeatureCollection",
      "features": []
    };
    //Get all geojsons with the given zoom level
    for (var cache of this.cache) {
      if (cache.zoom == zoom) {
        toReturn.features.push(cache.geoJson);
      }
    }
    return toReturn;
  }

  addToCache(zoom: number, geoJson: object, emitEvent: boolean = true) {
    this.cache.push(<CacheObject>{ geoJson, zoom, timestamp: new Date() });
    if (emitEvent) this.emitChange(zoom);
  }

  private emitChange(zoom: number) {
    var toReturn: any = this.getCached(zoom);
    //Remove cluster that should not be displayed, but still cached
    toReturn.features = this.getCached(zoom).features.filter((feature: any) => {
      if (feature.properties?.count == undefined)
        return true;

      if (this.config.cluster == false)
        return feature.properties?.count == undefined;

      return feature.properties?.count >= this.config.clusterMin;
    });
    this.emit('change', toReturn);
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
 * @param multipolygon polygon or multipolygon to convert
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

interface CacheObject {
  zoom: number,
  timestamp: Date,
  geoJson: object
}