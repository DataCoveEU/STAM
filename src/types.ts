import type { IClientOptions, MqttClient } from "mqtt";

export interface QueryObject {
  [key: string]: Array<string> | string | Array<QueryObject> | number | boolean | undefined;
  entityType: string;
  filter?: string;
  select?: Array<string>;
  expand?: Array<QueryObject>;
  top?: number;
  skip?: number;
  count?: boolean;
  id?: number;
  resultFormat?: string;
  orderby?: string;
  pathSuffix?: string;
}

export interface Range {
  from: number;
  to?: number;
}

export interface RangeQuery {
  zoomLevel: number | Range;
  query: QueryObject;
}

export interface Path {
  color: string;
  weight: number;
  opacity: number;
  fillColor: string;
  fillOpacity: number;
}

export interface Style {
  hover: Path;
  default: Path;
}

/** A style handed to a map library, a Path of which every field is optional. */
export type PathStyle = Partial<Path>;

export type ClusterStyle = {
  circle: Path;
  polygon: Style;
};

/** Observations of one ObservedProperty, with the unit its datastream is measured in. */
export interface ObservationData extends StaResponse<DataArray> {
  unitOfMeasurement?: Datastream["unitOfMeasurement"];
}

/** Abort signal and progress callback a caller may pass to a request. */
export interface LoadOptions {
  /** Aborts the request and the pages it still has to follow. */
  signal?: AbortSignal;
  /** Called with the rows loaded so far, after every page. */
  onProgress?: (loaded: number) => void;
}

/** Observation getter STAM adds to a marker for every ObservedProperty of its datastreams. */
export interface ObservedPropertyData {
  observedProperty: string;
  getData: (
    configureQuery: (query: QueryObject) => QueryObject,
    options?: LoadOptions,
  ) => Promise<ObservationData>;
}

/** The SensorThings entity, plus the members STAM adds to it. */
export interface FeatureProperties extends Entity {
  //The entity is passed through as returned by the service
  [key: string]: unknown;
  name?: string;
  /** Number of features in the cluster. Present on cluster features only. */
  count?: number;
  /** Observation getters, one per ObservedProperty. Present on marker features only. */
  getData?: Array<ObservedPropertyData>;
  /** Closes the popup. Set before `markerClick` is called. */
  closeMarker?: () => void;
}

/** A position, or the nesting of them a geometry type brings with it. */
export type Coordinates = Array<number> | Array<Coordinates>;

/** The rings of a polygon, as polygon filters and tiles use them. */
export type CoordinatesList = Array<Array<Array<number>>>;

/** A GeoJSON geometry, as the service returns it. */
export interface Geometry {
  type: string;
  coordinates: Coordinates;
}

/** GeoJSON feature handed to the configuration callbacks. */
export interface GeoJsonFeature {
  //The OpenLayers bundle reports the geometry type here, the Leaflet bundle "Feature"
  type: string;
  geometry: Geometry;
  properties: FeatureProperties;
}

/** The features of one zoom level, emitted whenever its cached data changed. */
export interface FeatureCollection {
  type: "FeatureCollection";
  features: Array<GeoJsonFeature>;
  zoom: number;
}

/** An entity of the SensorThings service, its properties depend on the service. */
export interface Entity {
  [key: string]: unknown;
  "@iot.id"?: number | string;
  name?: string;
}

/** A datastream, expanded with the parts the default popup needs. */
export interface Datastream extends Entity {
  unitOfMeasurement?: { name?: string; symbol?: string; definition?: string };
  ObservedProperty?: { name: string };
}

/** The rows of a `resultFormat=dataArray` query, the pages already merged. */
export interface DataArray {
  dataArray: Array<Array<unknown>>;
  components?: Array<string>;
}

/** A response of the SensorThings service, its `@iot.nextLink` pages already followed. */
export interface StaResponse<T = Array<Entity>> {
  value: T;
  "@iot.count"?: number;
  "@iot.nextLink"?: string;
}

/** Marker color, or a possibly async callback returning one per feature. */
export type MarkerStyle = string | ((feature: GeoJsonFeature) => string | Promise<string>);

/** Style for non-point spatial features, or a callback returning one per feature. */
export type PolygonStyle = string | Path | ((feature: GeoJsonFeature) => string | Path);

/** Cluster styling, or a callback returning it per cluster feature. */
export type ClusterStyleOption = ClusterStyle | ((feature: GeoJsonFeature) => ClusterStyle);

/** The client and its options, as the bundled `mqtt` package types them */
export type { IClientOptions, MqttClient } from "mqtt";

/** Connects to a broker, `mqtt.connect` of the `mqtt` package matches it */
export type MqttConnect = (url: string, options?: IClientOptions) => MqttClient;

/** Everything STAM would otherwise derive from `baseUrl`. */
export interface MqttOptions {
  /** Websocket endpoint of the broker. Defaults to `<ws|wss>://<host of baseUrl>/mqtt`. */
  url?: string;
  /** Passed to the client's `connect`, the `IClientOptions` of MQTT.js. */
  options?: IClientOptions;
  /** Prefix the entity type is appended to. Defaults to the last segment of `baseUrl`, e.g. `v1.1`. */
  topicPrefix?: string;
  /** Topics to subscribe to, replacing the derived `<topicPrefix>/<entityType>`. */
  topics?: Array<string> | ((entityType: string) => string | Array<string>);
  /** A connected client, or a `connect` creating one. Defaults to the bundled MQTT.js. */
  client?: MqttClient | MqttConnect;
}

export interface Config {
  /** Base URL of the SensorThings API service. */
  baseUrl: string;
  /** A single query object, or zoom based ranges evaluated against the current zoom level. */
  queryObject: QueryObject | Array<RangeQuery>;
  /** Observation range used by the default popup. Omitted: the service default range. */
  plot?: {
    startDate: Date;
    offset?: number;
    endDate?: Date;
  };
  /** Cache lifetime in seconds. Omitted or falsy: cached data is kept indefinitely. */
  cachingDuration?: number;
  /** Subscribe to MQTT updates. `true` uses the defaults derived from `baseUrl`. Defaults to `false`. */
  mqtt?: boolean | MqttOptions;
  /** Enables clustering. Defaults to `true`. */
  cluster?: boolean;
  /** Minimum feature count for a cluster to remain displayed. Defaults to `5`. */
  clusterMin?: number;
  /** Entities requested per tile, while no count told us how many there are. Defaults to `1000`. */
  maxMarkersPerTile?: number;
  markerStyle?: MarkerStyle;
  clusterStyle?: ClusterStyleOption;
  polygonStyle?: PolygonStyle;
  /** Called when the pointer enters a marker. */
  markerMouseOver?: (feature: GeoJsonFeature) => void;
  /** Called when a popup closes. The OpenLayers bundle calls it without a feature. */
  popupClose?: (feature?: GeoJsonFeature) => void;
  /** Called when a marker is clicked. Returning content replaces the default popup. */
  markerClick?: (feature: GeoJsonFeature) => string | HTMLElement | void;
  /** Called when the pointer enters a cluster. */
  clusterMouseOver?: (feature: GeoJsonFeature) => void;
  /** Called when a cluster is clicked. Replaces the default zoom-to-cluster behavior. */
  clusterClick?: (feature: GeoJsonFeature) => void;
  /** The OpenLayers map instance. Required by the OpenLayers bundle, ignored by Leaflet. */
  map?: unknown;
  /** Options passed to `fetch` for every SensorThings request. */
  fetchOptions?: RequestInit;
  /** Requests sent per `requestDelay`. Without a delay the requests are not limited. Defaults to `5`. */
  maxConcurrentRequests?: number;
  /** Milliseconds between two waves of `maxConcurrentRequests` requests. Defaults to `0`. */
  requestDelay?: number;
  /** Milliseconds the map has to be still before its data is requested. Defaults to `200`. */
  debounceDuration?: number;
  /** Entities a query without its own `top` loads at most, over all pages. Defaults to `10000`. */
  maxEntities?: number;
  /** Additional query parameters appended to every generated request URL. */
  queryParameters?: Map<string, string>;
}
