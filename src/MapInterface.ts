import type {
  Config,
  Coordinates,
  CoordinatesList,
  DataArray,
  Datastream,
  Entity,
  FeatureCollection,
  FeatureProperties,
  GeoJsonFeature,
  Geometry,
  MqttConnect,
  MqttOptions,
  ObservationData,
  QueryObject,
  Range,
  RangeQuery,
  StaResponse,
} from "./types";
import type { MqttClient } from "mqtt";
import { STAInterface } from "./STAInterface";

//Used when the config does not specify a minimum cluster size
const DEFAULT_CLUSTER_MIN = 5;

//Milliseconds the map has to be still before the data is requested
const DEFAULT_DEBOUNCE_DURATION = 200;

/**
 * Carries the geojson of a zoom level whenever its cached data changed
 */
export class ChangeEvent extends Event {
  constructor(readonly geoJson: FeatureCollection) {
    super("change");
  }
}

export class MapInterface extends EventTarget {
  config: Config;
  readonly api: STAInterface;
  /** The MQTT client, once it is connected. Undefined while MQTT is disabled or still connecting */
  client: MqttClient | undefined;
  /** Resolves with the connected MQTT client, or with undefined while MQTT is disabled */
  readonly mqttReady: Promise<MqttClient | undefined>;
  lastZoom: number;

  //The MQTT config, normalized from the `mqtt` shorthand. Undefined while MQTT is disabled
  private readonly mqttOptions: MqttOptions | undefined;

  //Stores the cached geojson
  cache: Array<CacheObject>;

  //Pending request of a map movement that has not settled yet
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  //Clustering is enabled unless it was explicitly disabled
  private get clusterEnabled(): boolean {
    return this.config.cluster ?? true;
  }

  private get clusterMin(): number {
    return this.config.clusterMin ?? DEFAULT_CLUSTER_MIN;
  }

  constructor(config: Config) {
    super();
    this.cache = [];
    this.lastZoom = 0;
    this.config = config;
    this.api = new STAInterface(config);

    //MQTT
    this.mqttOptions = config.mqtt === true ? {} : config.mqtt || undefined;
    this.mqttReady = this.mqttOptions
      ? this.startMqtt(this.mqttOptions)
      : Promise.resolve(undefined);
  }

  /**
   * Connects to the broker and listens for updates, without ever rejecting
   * @param options the MQTT config
   * @returns the connected client, or undefined when connecting failed
   */
  private async startMqtt(options: MqttOptions): Promise<MqttClient | undefined> {
    var client: MqttClient;
    try {
      client = await this.connectMqtt(options);
    } catch (e) {
      console.error("Failed to connect to the MQTT broker", e);
      return undefined;
    }

    //Receive updates from server
    client.on("message", this.onMqttMessage.bind(this));
    this.client = client;

    return client;
  }

  /**
   * Resolves the MQTT client: the configured one, the page's global, or the bundled one
   * @param options the MQTT config
   * @returns the connected client
   */
  private async connectMqtt(options: MqttOptions): Promise<MqttClient> {
    //An already connected client is used as is
    if (options.client && typeof options.client !== "function") return options.client;

    //The config's factory, then the page's own client, then the bundled one
    const CONNECT: MqttConnect = options.client ?? (await import("mqtt")).default.connect;

    const BROKER = options.url ?? defaultMqttUrl(this.config.baseUrl);
    console.log("Connecting to MQTT server at", BROKER);

    return CONNECT(BROKER, options.options);
  }

  /**
   * Applies an update the broker published to the cached feature it belongs to
   * @param topic topic the update was published on
   * @param message the updated entity
   */
  private onMqttMessage(topic: string, message: { toString(): string }) {
    console.log("Change", topic, message.toString());
    // parse message
    const marker: Entity = JSON.parse(message.toString());
    //Check for the entityType
    const location = marker.feature as Geometry;

    //Fix the geojson if it is not nested in a feature, because openlayers wouldn't save the properties
    const geoJson: GeoJsonFeature =
      location.type == "Feature"
        ? (location as unknown as GeoJsonFeature)
        : { type: "Feature", geometry: location, properties: {} };

    delete marker.Locations;

    //Add the properties
    geoJson.properties = marker as FeatureProperties;

    //Update items in cache
    this.cache = this.cache.map((e: CacheObject) => {
      if (e.geoJson.properties["@iot.id"] == marker["@iot.id"]) {
        e.geoJson = geoJson;
        e.timestamp = new Date();
      }

      return e;
    });

    //Show on map
    this.emitChange(this.lastZoom);
  }

  /**
   * Subscribes to the topics of an entity type, once the client is connected
   * @param entityType entity type of the current query
   */
  private async subscribeMqtt(entityType: string) {
    const CLIENT = await this.mqttReady;
    if (!CLIENT) return;

    CLIENT.subscribe(this.mqttTopics(entityType), (error: unknown) => {
      if (error) console.error("Failed to subscribe to MQTT updates", error);
    });
  }

  /**
   * The topics the given entity type's updates are published on
   * @param entityType entity type of the current query
   * @returns topics to subscribe to
   */
  private mqttTopics(entityType: string): Array<string> {
    const TOPICS = this.mqttOptions?.topics;

    //Explicit topics replace the derived ones
    if (TOPICS) {
      const RESOLVED = typeof TOPICS === "function" ? TOPICS(entityType) : TOPICS;
      return typeof RESOLVED === "string" ? [RESOLVED] : RESOLVED;
    }

    const PREFIX = this.mqttOptions?.topicPrefix ?? defaultTopicPrefix(this.config.baseUrl);
    return [PREFIX ? `${PREFIX}/${entityType}` : entityType];
  }

  /**
   * Converts the longitude to a OSM tile number
   * @param lon longitude
   * @param zoom current zoom level
   * @returns OSM tile number
   */
  long2tile(lon: number, zoom: number) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  }

  /**
   * Converts the latitude to a OSM tile number
   * @param lat latitude
   * @param zoom current zoom level
   * @returns OSM tile number
   */
  lat2tile(lat: number, zoom: number) {
    return Math.floor(
      ((1 -
        Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
        2) *
        Math.pow(2, zoom),
    );
  }

  /**
   * OSM tile number to the upper left longitude
   * @param x osm tile number
   * @param z osm tile number
   * @returns longitude of upper right point of the OSM tile
   */
  tile2long(x: number, z: number) {
    return (x / Math.pow(2, z)) * 360 - 180;
  }

  /**
   * OSM tile number to the upper left latitude
   * @param x osm tile number
   * @param z osm tile number
   * @returns latitude of upper right point of the OSM tile
   */
  tile2lat(y: number, z: number) {
    var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  /**
   * Converts latitude and longitude coordinates to the upper left point of the OSM tile the point intersects with
   * @param coordinate object of latitude and longitude coordinates of a point. For example: {lat, lng}
   * @param zoom current zoom level
   * @returns object with latitude and longitude of the OSM tile's upper left corner
   */
  coordinatesToOsm(coordinate: LatLng, zoom: number): LatLng {
    var lat = this.tile2long(this.long2tile(coordinate.lat, zoom), zoom);
    var lng = this.tile2lat(this.lat2tile(coordinate.lng, zoom), zoom);
    return {
      lat,
      lng,
    };
  }

  /**
   * Converts latitude and longitude coordinates to the bottom right point of the OSM tile the point intersects with
   * @param coordinate object of latitude and longitude coordinates of a point. For example: {lat, lng}
   * @param zoom current zoom level
   * @returns object with latitude and longitude of the OSM tile's bottom right corner
   */
  coordinatesToOsmBottom(coordinate: LatLng, zoom: number): LatLng {
    var lat = this.tile2long(this.long2tile(coordinate.lat, zoom) + 1, zoom);
    var lng = this.tile2lat(this.lat2tile(coordinate.lng, zoom) + 1, zoom);
    return {
      lat,
      lng,
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
      lng: 0,
    };
    var bottomright = {
      lat: 0,
      lng: 0,
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
   * The ring of an OSM tile, as a GeoJSON polygon's coordinates
   * @param x tile column
   * @param y tile row
   * @param zoom zoom level the tile belongs to
   */
  private tileRing(x: number, y: number, zoom: number): CoordinatesList {
    const T = { lat: this.tile2lat(y, zoom), lng: this.tile2long(x, zoom) };
    const B = { lat: this.tile2lat(y + 1, zoom), lng: this.tile2long(x + 1, zoom) };

    return [
      [
        [T.lng, T.lat],
        [T.lng, B.lat],
        [B.lng, B.lat],
        [B.lng, T.lat],
        [T.lng, T.lat],
      ],
    ];
  }

  /**
   * A tile is split into four on the next zoom level. Zooming back out can reuse those counts
   * instead of asking the service again
   * @returns the summed count, or undefined if the four are not all cached
   */
  private countFromCachedTiles(x: number, y: number, zoom: number): number | undefined {
    const cached = this.getCached(zoom + 1).features;
    var count = 0;

    for (const [childX, childY] of [
      [x * 2, y * 2],
      [x * 2 + 1, y * 2],
      [x * 2, y * 2 + 1],
      [x * 2 + 1, y * 2 + 1],
    ]) {
      const tile = tileFeature(this.tileRing(childX, childY, zoom + 1));
      const child = cached.find((feature) => compare_features(tile, feature));

      //Without all four the sum would be short
      if (child?.properties?.count == undefined) return undefined;
      count += child.properties.count;
    }

    return count;
  }

  /**
   * The query of another zoom level, without moving the zoom the MQTT updates are emitted for
   * @returns the query, or undefined if that zoom level has none
   */
  private queryOf(zoom: number): QueryObject | undefined {
    const current = this.lastZoom;
    try {
      return this.getQuery(zoom);
    } catch {
      return undefined;
    } finally {
      this.lastZoom = current;
    }
  }

  /**
   * A tile above this one may have fetched every entity it contains, which makes this tile's
   * entities already known
   * @returns the entities inside this tile, or undefined if no tile above it was fully fetched
   */
  private markersOfFetchedTile(
    x: number,
    y: number,
    zoom: number,
  ): Array<GeoJsonFeature> | undefined {
    const query = JSON.stringify(this.queryOf(zoom));

    //Every tile above this one covers it completely
    for (var level = zoom - 1, tileX = x >> 1, tileY = y >> 1; level >= 0; level--) {
      const cached = this.getCached(level).features;
      const tile = tileFeature(this.tileRing(tileX, tileY, level));

      const fetched = cached.find(
        (feature) => feature.properties?.fetched && compare_features(tile, feature),
      );

      if (fetched) {
        //A zoom level can be configured with another query, its entities are not the ones asked for
        if (JSON.stringify(this.queryOf(level)) != query) return undefined;

        const ring = this.tileRing(x, y, zoom)[0];
        return cached.filter(
          (feature) => feature.properties?.count == undefined && inside(feature, ring),
        );
      }

      tileX >>= 1;
      tileY >>= 1;
    }

    return undefined;
  }

  /**
   * Called with the geojson of a zoom level whenever its cached data changed
   * @param options the options of addEventListener, `once` and `signal` included
   * @returns a function that removes the listener again
   */
  onChange(
    listener: (geoJson: FeatureCollection) => void,
    options?: AddEventListenerOptions,
  ): () => void {
    const handler = (event: Event) => listener((event as ChangeEvent).geoJson);

    this.addEventListener("change", handler, options);
    return () => this.removeEventListener("change", handler, options);
  }

  /**
   * Get a QueryObject based on the current zoom level
   * @param zoom Zoom level
   */
  getQuery(zoom: number) {
    this.lastZoom = zoom;
    //Check if it is a QueryObject
    if ("entityType" in this.config.queryObject) {
      return this.config.queryObject as QueryObject;
    } else {
      //Get all queries
      var range = this.config.queryObject as Array<RangeQuery>;
      //Iterate through all
      for (var rangeQuery of range) {
        if (isNaN(Number(rangeQuery.zoomLevel))) {
          //Object
          var zoomObject = rangeQuery.zoomLevel as Range;
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
          var number = rangeQuery.zoomLevel as number;
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
   */
  getLayerData(zoom: number, boundingBox: Array<number>) {
    //Render what is cached right away, only the requests are debounced
    this.emitChange(zoom);

    //Drop the movement that was still pending, its bounding box is outdated
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(
      this.loadLayerData.bind(this),
      this.config.debounceDuration ?? DEFAULT_DEBOUNCE_DURATION,
      zoom,
      boundingBox,
    );
  }

  /**
   * Requests everything missing from the cache for the given zoom level and bounding box
   * @param zoom current zoom level
   * @param boundingBox map's bounding box
   */
  private async loadLayerData(zoom: number, boundingBox: Array<number>) {
    //Removing the reference to config.queryObject
    var correctedQuery: QueryObject = JSON.parse(JSON.stringify(this.getQuery(zoom)));

    //Subscribing waits for the connection, the data is not held back by it
    if (this.mqttOptions) void this.subscribeMqtt(correctedQuery.entityType);

    //Checking if the queried entityType is things
    if (correctedQuery.entityType == "Things") {
      correctedQuery.select = ["id"];
      correctedQuery.expand = [
        {
          entityType: "Locations",
        } as QueryObject,
      ];
    } else {
      if (correctedQuery.entityType == "FeaturesOfInterest") {
        //If it is a FeaturesOfInterest
        correctedQuery.select = ["feature"];
      } else {
        throw new Error("Only Things and FeaturesOfInterest are supported");
      }
    }

    //Only query the count not the data
    correctedQuery.count = true;
    correctedQuery.top = 0;

    //Get the coordinates of the top left and bottom right
    var top = {
      lat: this.lat2tile(boundingBox[1], zoom),
      lng: this.long2tile(boundingBox[0], zoom),
    };
    var bottom = {
      lat: this.lat2tile(boundingBox[3], zoom),
      lng: this.long2tile(boundingBox[2], zoom),
    };

    const promises: Array<Promise<void>> = [];

    //Iterate all OSM tiles
    for (var x = bottom.lng; x <= top.lng; x++) {
      for (var y = top.lat; y <= bottom.lat; y++) {
        //Get the coordinates of the tile
        const RING = this.tileRing(x, y, zoom);

        //Clone the query object
        const QUERYCOPY = JSON.parse(JSON.stringify(correctedQuery));

        //Get the ST filter
        const GEOFILTER = polygonToFilter(RING, QUERYCOPY.entityType);

        //Append it to old filter if given
        if (QUERYCOPY.filter) {
          QUERYCOPY.filter = `(${QUERYCOPY.filter}) and ${GEOFILTER}`;
        } else {
          QUERYCOPY.filter = GEOFILTER;
        }

        //Create a geojson polygon with tbe given coordinates
        const feature = tileFeature(RING);

        //Check if a polygon is already present
        const existing = this.getCached(zoom).features.find((feature2) => {
          return compare_features(feature, feature2);
        });

        //Zooming in: a tile above may have fetched everything this tile contains
        const FETCHED = this.clusterEnabled ? this.markersOfFetchedTile(x, y, zoom) : undefined;

        //Zooming out: the tiles this one was split into may still hold their counts
        const CACHEDCOUNT =
          FETCHED || !this.clusterEnabled ? undefined : this.countFromCachedTiles(x, y, zoom);

        //Check if polygon is cached
        if (!existing) {
          promises.push(
            (async () => {
              //Everything inside this tile is already known, neither count nor entities are requested
              if (FETCHED) {
                feature.properties.count = FETCHED.length;
                feature.properties.fetched = true;
                this.addToCache(zoom, feature, false);
                for (const marker of FETCHED) this.addToCache(zoom, marker);
                return;
              }

              //Check if clustering is enabled
              if (this.clusterEnabled && CACHEDCOUNT == undefined) {
                //Get count for the polygon
                var data: StaResponse | undefined;
                try {
                  data = await this.api.getGeoJson(QUERYCOPY);
                } catch {
                  try {
                    //Retry on error
                    data = await this.api.getGeoJson(QUERYCOPY);
                  } catch (e) {
                    console.error("Failed to fetch data", e);
                  }
                }
                //Leave the polygon uncached, so the next map movement retries it
                if (!data) return;

                feature.properties.count = data["@iot.count"];
                this.addToCache(zoom, feature);
              } else if (this.clusterEnabled) {
                //The summed count of the four tiles, no request needed
                feature.properties.count = CACHEDCOUNT!;
                this.addToCache(zoom, feature);
              } else {
                //Don't get the data if clustering is disabled
                this.addToCache(zoom, feature, false);
              }

              //Load this polygon's markers right away, instead of waiting for the other polygons
              if ((feature.properties.count ?? 0) < this.clusterMin || !this.clusterEnabled) {
                await this.getMarkers([RING], zoom);
                //The count told us this is all of them, so deeper zoom levels can reuse them
                if (this.clusterEnabled) feature.properties.fetched = true;
              }
            })(),
          );
        }
      }
    }

    //Every polygon renders and loads its markers on its own, this only awaits the last one
    await Promise.all(promises);
  }

  /**
   * Helper function to get all markers in the given polygons
   * @param toMarker Array of all coordinates of the polygons the markers to get are in
   * @param zoom current zoom level
   */
  private async getMarkers(toMarker: Array<CoordinatesList>, zoom: number) {
    if (toMarker.length != 0) {
      //Remove reference to config.queryObject
      var markerQuery = JSON.parse(JSON.stringify(this.getQuery(zoom)));
      markerQuery.top = 1000;
      //The count is already known from the polygon query, counting again only slows the service down
      delete markerQuery.count;

      if (markerQuery.entityType == "Things") {
        //Check if expand is specified in the queryObject
        if (!markerQuery.expand) markerQuery.expand = [];

        //Check if a queryObject to expand the datastream with id and name is specified
        var datastreamQuery = markerQuery.expand.find((expand: QueryObject) => {
          return expand.entityType == "Datastreams";
        });

        //Check if a datastream query is specified
        if (!datastreamQuery) {
          //Add expand
          markerQuery.expand.push({
            entityType: "Datastreams",
            select: ["id", "name", "unitOfMeasurement"],
            expand: [{ entityType: "ObservedProperty" } as QueryObject],
          } as QueryObject);
        } else {
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
        if (
          !markerQuery.expand.some((expand: QueryObject) => {
            return expand.entityType == "Locations";
          })
        ) {
          markerQuery.expand.push({
            entityType: "Locations",
          } as QueryObject);
        }
      } else {
        //Add feature to select, if it queries for the FeaturesOfInterest
        if (markerQuery.select && !markerQuery.select.includes("feature")) {
          markerQuery.select.push("feature");
        }

        if (!markerQuery.expand) {
          markerQuery.expand = [
            {
              entityType: "Observations",
              top: 1,
              expand: [
                {
                  entityType: "Datastream",
                  select: ["unitOfMeasurement", "id"],
                  expand: [{ entityType: "ObservedProperty" } as QueryObject],
                } as QueryObject,
              ],
            } as QueryObject,
          ];
        }
      }

      //If a filter is already specified, append the geometry query to the old filter
      if (markerQuery.filter) markerQuery.filter = `(${markerQuery.filter}) and `;

      var promises = [];

      //Iterate all polygons of the toMarker array
      for (var cord of toMarker) {
        //Deep clone
        var query = JSON.parse(JSON.stringify(markerQuery));

        if (!query.filter) query.filter = "";
        //Apply filter
        query.filter += polygonToFilter(cord, query.entityType);
        //Get data
        promises.push(
          (async () => {
            var markers: StaResponse | undefined;

            try {
              markers = await this.api.getGeoJson(query);
            } catch {
              try {
                //Retry on error
                markers = await this.api.getGeoJson(query);
              } catch (e) {
                console.error("Failed to fetch data", e);
              }
            }
            if (!markers) return;

            markers.value.forEach((marker: Entity) => {
              //Get the geoJson of the marker, check for the entityType
              const location =
                markerQuery.entityType == "Things"
                  ? (marker.Locations as Array<{ location: Geometry }>)[0].location
                  : (marker.feature as Geometry);

              //Fix the geojson if it is not nested in a feature, because openlayers wouldn't save the properties
              const geoJson: GeoJsonFeature =
                location.type == "Feature"
                  ? (location as unknown as GeoJsonFeature)
                  : { type: "Feature", geometry: location, properties: {} };

              //Delete the Locations, so they are not in the geojson's properties
              delete marker.Locations;

              //Add the properties
              const properties = marker as FeatureProperties;
              geoJson.properties = properties;
              //add getData object if not present
              if (!properties.getData) properties.getData = [];

              //Check for the entityType
              if (markerQuery.entityType == "Things") {
                //Iterate through the datastreams
                for (const datastream of marker.Datastreams as Array<Datastream>) {
                  this.addGetDataCallback(datastream, properties);
                }
              } else {
                //Get the datastream of the FeatureOfInterest
                const observations = marker.Observations as Array<{ Datastream?: Datastream }>;
                this.addGetDataCallback(observations[0]?.Datastream, properties);
              }

              //Check if the marker is already in the cache
              if (
                !this.getCached(zoom).features.some((feature) => {
                  return compare_features(geoJson, feature);
                })
              ) {
                this.addToCache(zoom, geoJson);
              }
            });
            return;
          })(),
        );
      }

      //Await all promises
      await Promise.all(promises);
    }
  }

  /**
   * Create a getter for the observations of a datastream
   * @param datastream Datastream to create the function for
   * @param marker GeoJson of the marker
   */
  private addGetDataCallback(datastream: Datastream | undefined, marker: FeatureProperties) {
    if (datastream) {
      //Get the id
      const id = datastream["@iot.id"];
      //Get the unit
      const unitOfMeasurement = datastream.unitOfMeasurement;
      //Add the function, with the id as the key
      marker.getData!.push({
        observedProperty: datastream.ObservedProperty?.name ?? "",
        getData: async (configureQuery: (query: QueryObject) => QueryObject) => {
          //Add query
          var datastreamQuery = {
            entityType: "Datastreams",
            id,
            pathSuffix: "Observations",
          } as QueryObject;
          //Use the return value of the callback function
          datastreamQuery = configureQuery(datastreamQuery);

          //Get the data
          const data: ObservationData = await this.api.getGeoJson<DataArray>(datastreamQuery);
          //Add unit to the data object
          data.unitOfMeasurement = unitOfMeasurement;
          return data;
        },
      });
    }
  }

  /**
   * Get all cached geojson's in a featureCollection and delete all expired geojson's
   * @param zoom Current zoom level
   */
  getCached(zoom: number): FeatureCollection {
    if (this.config.cachingDuration) {
      const cachingDuration = this.config.cachingDuration;
      this.cache = this.cache.filter((cache: CacheObject) => {
        //Clone date
        var date = new Date(cache.timestamp);
        //Add caching time
        date.setSeconds(cache.timestamp.getSeconds() + cachingDuration);
        //Check if date should be removed
        return date > new Date();
      });
    }
    const toReturn: FeatureCollection = {
      type: "FeatureCollection",
      features: [],
      zoom,
    };
    //Get all geojsons with the given zoom level
    for (var cache of this.cache) {
      if (cache.zoom == zoom) {
        toReturn.features.push(cache.geoJson);
      }
    }
    return toReturn;
  }

  /**
   * Add a geojson to the cache
   * @param zoom Current zoom level
   * @param geoJson GeoJson to add
   * @param emitEvent Flag if a change event should be emitted
   */
  addToCache(zoom: number, geoJson: GeoJsonFeature, emitEvent: boolean = true) {
    this.cache.push({ geoJson, zoom, timestamp: new Date() });
    if (emitEvent) this.emitChange(zoom);
  }

  /**
   * Emits a change event with the geojson for the current zoom level as an argument
   * @param zoom Current zoom leel
   */
  private emitChange(zoom: number) {
    const toReturn = this.getCached(zoom);
    //Remove cluster that should not be displayed, but still cached
    toReturn.features = toReturn.features.filter((feature) => {
      //Check if count is present, if not return the value
      if (feature.properties?.count == undefined) return true;

      //Check if clustering is disabled
      if (!this.clusterEnabled) return feature.properties?.count == undefined;

      //Return only the polygons with a higher count as specified
      return (feature.properties?.count ?? 0) >= this.clusterMin;
    });
    this.dispatchEvent(new ChangeEvent(toReturn));
  }
}

/**
 * The MQTT endpoint of a SensorThings service, as most deployments expose it
 * @param baseUrl base URL of the service
 * @returns websocket URL of the broker
 */
function defaultMqttUrl(baseUrl: string): string {
  const SERVICE = new URL(baseUrl);
  //A service reachable over http is served by a broker without TLS as well
  return `${SERVICE.protocol == "http:" ? "ws" : "wss"}://${SERVICE.host}/mqtt`;
}

/**
 * The version segment a SensorThings service prefixes its topics with
 * @param baseUrl base URL of the service
 * @returns last path segment, e.g. `v1.1`
 */
function defaultTopicPrefix(baseUrl: string): string {
  return new URL(baseUrl).pathname.split("/").filter(Boolean).pop() ?? "";
}

/**
 *
 * @param f1 feature to be compared
 * @param f2 feature to be compared
 * @returns true if the features are the same
 */
/**
 * A tile of the map as a geojson polygon
 */
function tileFeature(ring: CoordinatesList): GeoJsonFeature {
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: ring },
    properties: { count: 0 },
  };
}

/**
 * Every number of a geometry, whatever nesting its type brings with it
 */
function positions(coordinates: Coordinates): Array<number> {
  const flat: Array<number> = [];

  for (const value of coordinates) {
    if (typeof value == "number") flat.push(value);
    else flat.push(...positions(value));
  }
  return flat;
}

/**
 * Whether a feature sits inside the ring of a tile. Locations are points, so their first
 * coordinate is the one to look at
 */
function inside(feature: GeoJsonFeature, ring: Array<Array<number>>): boolean {
  const [lng, lat] = positions(feature.geometry?.coordinates ?? []);
  if (lng == undefined || lat == undefined) return false;

  const lngs = ring.map((coordinate) => coordinate[0]);
  const lats = ring.map((coordinate) => coordinate[1]);

  return (
    lng >= Math.min(...lngs) &&
    lng <= Math.max(...lngs) &&
    lat >= Math.min(...lats) &&
    lat <= Math.max(...lats)
  );
}

function compare_features(f1: GeoJsonFeature | Geometry, f2: GeoJsonFeature | Geometry): boolean {
  //Check if the type is the same
  if (f1.type != f2.type) return false;

  const id1 = "properties" in f1 ? f1.properties?.["@iot.id"] : undefined;
  const id2 = "properties" in f2 ? f2.properties?.["@iot.id"] : undefined;
  if (id1 || id2) return id1 == id2;

  //If feature is a point, the coordinates can be compared directly, if it is a polygon or
  //something else, the coordinates need to be gotten from the geometry object
  return polygon_compare(coordinatesOf(f1), coordinatesOf(f2));
}

/**
 * The coordinates of a feature or of a bare geometry
 */
function coordinatesOf(feature: GeoJsonFeature | Geometry): Coordinates {
  return "coordinates" in feature ? feature.coordinates : feature.geometry.coordinates;
}

/**
 * Deep comparing two arrays
 * @param a1 Array to be compared
 * @param a2 Array to be compared
 * @returns true if the same
 */
function polygon_compare(a1: Coordinates, a2: Coordinates): boolean {
  //return a1.length === a2.length && a1.every(function (value: any, index: number) { return value === a2[index] })
  //return JSON.stringify(a1) === JSON.stringify(a2);
  if (!a2) return false;

  // compare lengths - can save a lot of time
  if (a1.length != a2.length) return false;

  for (var i = 0, l = a1.length; i < l; i++) {
    const left = a1[i];
    const right = a2[i];

    // Check if we have nested arrays
    if (left instanceof Array && right instanceof Array) {
      // recurse into the nested arrays
      if (!polygon_compare(left, right)) return false;
    } else if (left != right) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

/**
 * Converts a polygon into a valid filter for a sensorthings API
 * @param multipolygon polygon or multipolygon to convert
 * @returns valid filter
 */
function polygonToFilter(multipolygon: Coordinates, entityType: string): string {
  return (multipolygon as Array<Coordinates>)
    .map((polygon) => {
      const first = polygon[0];
      //Check if polygon is a multipolygon
      const ring = (Array.isArray(first) && Array.isArray(first[0]) ? first : polygon) as Array<
        Array<number>
      >;

      return `geo.intersects(${
        entityType == "Things" ? "Locations/location" : "feature"
      },geography'POLYGON ((${ring
        .map((position) => {
          return position.join(" ");
        })
        .join(",")}))')`;
    })
    .join(" or ");
}

/**
 * Cached objects
 */
/** A point in latitude and longitude, as the tile helpers take it */
export interface LatLng {
  lat: number;
  lng: number;
}

interface CacheObject {
  zoom: number;
  timestamp: Date;
  geoJson: GeoJsonFeature;
}
