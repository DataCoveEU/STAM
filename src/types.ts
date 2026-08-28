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

export type ClusterStyle = {
  circle: Path;
  polygon: Style;
};

/** Observation getter STAM adds to a marker for every ObservedProperty of its datastreams. */
export interface ObservedPropertyData {
  observedProperty: string;
  getData: (configureQuery: (query: QueryObject) => QueryObject) => Promise<any>;
}

/** The SensorThings entity, plus the members STAM adds to it. */
export interface FeatureProperties {
  //The entity is passed through as returned by the service
  [key: string]: any;
  name?: string;
  /** Number of features in the cluster. Present on cluster features only. */
  count?: number;
  /** Observation getters, one per ObservedProperty. Present on marker features only. */
  getData?: Array<ObservedPropertyData>;
  /** Closes the popup. Set before `markerClick` is called. */
  closeMarker?: () => void;
}

/** GeoJSON feature handed to the configuration callbacks. */
export interface GeoJsonFeature {
  //The OpenLayers bundle reports the geometry type here, the Leaflet bundle "Feature"
  type: string;
  geometry: { type: string; coordinates: any };
  properties: FeatureProperties;
}

/** Marker color, or a possibly async callback returning one per feature. */
export type MarkerStyle = string | ((feature: GeoJsonFeature) => string | Promise<string>);

/** Style for non-point spatial features, or a callback returning one per feature. */
export type PolygonStyle = string | Path | ((feature: GeoJsonFeature) => string | Path);

/** Cluster styling, or a callback returning it per cluster feature. */
export type ClusterStyleOption = ClusterStyle | ((feature: GeoJsonFeature) => ClusterStyle);

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
  /** Subscribe to MQTT updates. Defaults to `false`. */
  mqtt?: boolean;
  /** Enables clustering. Defaults to `true`. */
  cluster?: boolean;
  /** Minimum feature count for a cluster to remain displayed. Defaults to `5`. */
  clusterMin?: number;
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
  map?: any;
  /** Options passed to `fetch` for every SensorThings request. */
  fetchOptions?: RequestInit;
  /** Requests sent per `requestDelay`. Without a delay the requests are not limited. Defaults to `5`. */
  maxConcurrentRequests?: number;
  /** Milliseconds between two waves of `maxConcurrentRequests` requests. Defaults to `0`. */
  requestDelay?: number;
  /** Milliseconds the map has to be still before its data is requested. Defaults to `200`. */
  debounceDuration?: number;
  /** Additional query parameters appended to every generated request URL. */
  queryParameters?: Map<string, string>;
}
