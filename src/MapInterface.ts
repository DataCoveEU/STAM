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
   * Gets a GeoJSON from the current zoom level and bounding box, the fetched data is cached
   * @param zoom current zoom level
   * @param boundingBox map's bounding box
   * @returns a GeoJSON with polygons as clusters with the property count as the count of things inside the cluster, but only if the things are points. If not the thing's location is returned.
   */
  async getLayerData(zoom: number, boundingBox: Array<number>) {

    //Removing the reference to config.queryObject 
    var correctedQuery = JSON.parse(JSON.stringify(this.config.queryObject));

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


    if (this.config.cluster || this.config.cluster == undefined) {
      //Add an object to the cache, if it is the first time for this zoom level
      if (!this.cache[zoom]) {
        this.cache[zoom] = {
          "type": "FeatureCollection",
          "features": []
        }
      }

      //Only query the count not the data
      correctedQuery.count = true;
      correctedQuery.top = 0;

      //Get the coordinates of the top left and bottom right
      var top = { lat: this.lat2tile(boundingBox[1], zoom), lng: this.long2tile(boundingBox[0], zoom) };
      var bottom = { lat: this.lat2tile(boundingBox[3], zoom), lng: this.long2tile(boundingBox[2], zoom) };


      var recs = [];

      //Iterate all OSM tiles
      for (var x = bottom.lng; x <= top.lng; x++) {
        for (var y = top.lat; y <= bottom.lat; y++) {
          //Get top and bottom coordinates
          var t = { lat: this.tile2lat(y, zoom), lng: this.tile2long(x, zoom) };
          var b = { lat: this.tile2lat(y + 1, zoom), lng: this.tile2long(x + 1, zoom) };

          //Clone the query object
          var copyQuery = JSON.parse(JSON.stringify(correctedQuery));

          //Get the ST filter
          var geoFilter = polygonToFilter([
            [
              [t.lng, t.lat],
              [t.lng, b.lat],
              [b.lng, b.lat],
              [b.lng, t.lat],
              [t.lng, t.lat]
            ]
          ], copyQuery.entityType);

          //Append it to old filter if given
          if (copyQuery.filter) {
            copyQuery.filter = `(${copyQuery.filter}) and ${geoFilter}`;
          } else {
            copyQuery.filter = geoFilter;
          }

          //Create a geojson polygon with tbe given coordinates
          var feature = {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [t.lng, t.lat],
                  [t.lng, b.lat],
                  [b.lng, b.lat],
                  [b.lng, t.lat],
                  [t.lng, t.lat]
                ]
              ]
            },
            "properties": {
              "count": 0
            }
          };

          //Check if a polygon is already present
          var existing = this.cache[zoom].features.find((feature2: any) => {
            return compare_features(feature, feature2);
          });

          if (!existing) {
            //Query the count of things
            var data: any = await this.api.getGeoJson(copyQuery);

            //Add it to the recs array if more than 0
            if (data["@iot.count"] != 0) {
              feature.properties.count = data["@iot.count"];
              recs.push(feature);
            }
          }
        }
      }

      var toMarker: any = [];
      var toPush: any = [];

      //Iterate all polygons
      recs.forEach((feature: any) => {
        //Check if markers should be loaded
        if (feature.properties.count <= this.config.clusterMin) {
          toMarker.push(feature.geometry.coordinates);
        } else {
          toPush.push(feature);
        }
      });


      this.cache[zoom].features.push(...toPush);

      //Load markers
      await this.getMarkers(toMarker, zoom);
    } else {

      //Get the OSM tiles bounding box
      var OSMBOundingBox = this.getOSMBoundingBox(zoom, boundingBox);

      var topLat = OSMBOundingBox[0]
      var topLong = OSMBOundingBox[1];
      var bottomLat = OSMBOundingBox[2];
      var bottomLong = OSMBOundingBox[3];

      geoFilter = null;

      //Check if cached tiles exist
      if (this.cache[zoom]) {

        //Create a poly out of the bounding box
        var poly1: any = [
          [
            [topLat, topLong],
            [topLat, bottomLong],
            [bottomLat, bottomLong],
            [bottomLat, topLong],
            [topLat, topLong]
          ]
        ];

        //Get all cluster tiles
        var onlyPolys: any = this.cache[zoom].features.filter((geo: any) => {
          return geo?.properties?.count;
        });

        //Get all the coordinates
        onlyPolys = onlyPolys.map((geo: any) => {
          return geo.geometry.coordinates;
        });

        //Subtract the cached tiles from the OSM bounding box to reduce network traffic
        var subtracted = poly.difference(poly1, ...onlyPolys);

        //Check if the array isn't empty
        if (subtracted[0]) {
          //Get the geo filter
          geoFilter = polygonToFilter(subtracted, correctedQuery.entityType);
        } else
          //If the array is empty, nothing has to be fetched from the server, so the cached geoJSON can be returned
          return this.cache[zoom];
      } else {
        //Create a polygon with the OSM bounding box coordinates
        geoFilter = `geo.intersects(${correctedQuery.entityType == 'Things' ? 'Locations/location' : 'feature'},geography'POLYGON ((${topLat} ${topLong}, ${topLat} ${bottomLong}, ${bottomLat} ${bottomLong}, ${bottomLat} ${topLong} ,${topLat} ${topLong}))')`;
      }

      //Check for an existing filter
      if (correctedQuery.filter) {
        correctedQuery.filter = `(${correctedQuery.filter}) and ${geoFilter}`;
      } else {
        correctedQuery.filter = geoFilter;
      }

      //Higher the fetched things to 1000, if not set
      if (!correctedQuery.top)
        correctedQuery.top = 1000;

      //Fetch the data from the server, next links are handled by the STAInterface and merged into one object
      var rawGeoJson: any = await this.api.getGeoJson(correctedQuery);


      //If any data was returned
      if (rawGeoJson) {
        var locations;

        //Map the response to one array of geoJson Features
        if (correctedQuery.entityType == 'Things') {
          locations = rawGeoJson.value.map((data: any) => {
            return data.Locations[0].location
          });
        } else {
          //Get the location from the FeaturesOfInterest
          locations = rawGeoJson.value.map((data: any) => {
            return data.feature
          });
        }

        //Add an object to the cache, if it is the first time for this zoom level
        if (!this.cache[zoom]) {
          this.cache[zoom] = {
            "type": "FeatureCollection",
            "features": []
          }
        }

        this.cache[zoom].features.push(...locations);

        /*

        //Check if GeoJson Type is point, if not the GeoJson is not gonna be changed
        if (locations[0] && locations[0].type == "Point") {
          //Create cluster from the points
          await this.cluster(locations, zoom);
        } else {
          this.cache[zoom].features.push(...locations);
        }
        */
      }
    }
    return this.cache[zoom];
  }

  /*
  private async cluster(locations: any, zoom: number) {
    locations = locations.map((location: any) => {
      //Get the coordinates of the top left point of the OSM tile the point intersects with
      var top = this.coordinatesToOsm({
        lat: location.coordinates[0],
        lng: location.coordinates[1]
      }, zoom);

      //Get the coordinates of the bottom right point of the OSM tile the point intersects with
      var bottom = this.coordinatesToOsmBottom({
        lat: location.coordinates[0],
        lng: location.coordinates[1]
      }, zoom);

      //Create a geojson with the coordinates. Duplicates will be filtered later.
      var obj = {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [top.lat, top.lng],
              [top.lat, bottom.lng],
              [bottom.lat, bottom.lng],
              [bottom.lat, top.lng],
              [top.lat, top.lng]
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

    //Remove duplicates, increase counter if duplicate
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
      //Remove tiles with less than configured things inside
      if (geo.properties.count < this.config.clusterMin) {
        //Push all clusters, that should be displayed as markers to the toMarker array
        toMarker.push([geo.geometry.coordinates]);
        return false;
      }
      else {
        return true;
      }
    });

    //Push tiles to cache
    this.cache[zoom].features.push(...tiles);

    //Check if any markers should be loaded
    await this.getMarkers(toMarker, zoom);
  }
  */

  private async getMarkers(toMarker: any, zoom: number) {
    if (toMarker.length != 0) {

      //Create union out of all clusters to reduce the ST filter length
      var combine: any = poly.union(...toMarker);

      //Check if a result was returned
      if (combine) {

        //Remove reference to config.queryObject
        var markerQuery = JSON.parse(JSON.stringify(this.config.queryObject));
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
              select: ["id", "name"],
              expand: [<QueryObject>{ entityType: 'observedProperty' }]
            });
          }
          else {
            if (datastreamQuery.select && !datastreamQuery.select.includes("id")) {
              datastreamQuery.select.push("id");
            }

            if (datastreamQuery.select && !datastreamQuery.select.includes("name")) {
              datastreamQuery.select.push("name");
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
        }


        //If a filter is already specified, append the geometry query to the old filter
        if (markerQuery.filter)
          markerQuery.filter = `(${markerQuery.filter}) and `;

        markerQuery.filter = markerQuery.filter ? markerQuery.filter : '' + polygonToFilter(combine, markerQuery.entityType);

        //Get the data for the markers
        var markers: any = await this.api.getGeoJson(markerQuery);

        //Iterate all markers
        markers.value.forEach((marker: any) => {
          //Get the geoJson of the marker
          var geoJson: any;
          if (markerQuery.entityType == 'Things')
            geoJson = marker.Locations[0].location;
          else
            geoJson = marker.feature;
          delete marker.Locations;
          geoJson.properties = marker;
          if (!marker.getData)
            marker.getData = {};
          if (markerQuery.entityType == 'Things') {
            //Iterate through the datastreams
            for (var datastream of marker.Datastreams) {
              marker.getData[datastream.ObservedProperty.name] = function (filter: string) {
                var datastreamQuery = <QueryObject>{ entityType: "Datastreams", id: datastream['@iot.id'], expand: [<QueryObject>{ entityType: "Observations", filter }] };
                return this.api.getGeoJson(datastreamQuery);
              }.bind(this);
            }
          }

          //Check if the marker is already in the cache
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