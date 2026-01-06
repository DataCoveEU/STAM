export interface QueryObject {
  [key: string]: Array<string> | string | Array<QueryObject> | number | boolean;
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

export interface Config {
  plot: {
    startDate: Date;
    offset?: number;
    endDate?: Date;
  };
  cachingDuration: number;
  mqtt: boolean;
  cluster: boolean;
  clusterMin: number;
  queryObject: QueryObject | Array<RangeQuery>;
  baseUrl: string;
  markerStyle?: Function | string;
  clusterStyle?:
    | Function
    | ClusterStyle;
  polygonStyle?: Function | string;
  markerMouseOver?: Function;
  popupClose?: Function;
  markerClick?: Function;
  clusterMouseOver?: Function;
  clusterClick?: Function;
  map?: any;
  fetchOptions?: RequestInit;
  queryParameters?: Map<String, String>;
}
