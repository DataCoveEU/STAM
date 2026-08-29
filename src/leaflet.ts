// @ts-ignore
import { textToMarker } from "./leaflet/markers";
import { MapInterface } from "./MapInterface";
import "./leaflet/realtime";
import type {
  ClusterStyle,
  Config,
  FeatureCollection,
  GeoJsonFeature,
  Path,
  PathStyle,
} from "./types";
import { addCss, addTransparentBackground, createDefaultPopup } from "./utils";

declare global {
  namespace L {
    var realtime: (source: RealtimeSource, options: RealtimeOptions) => RealtimeLayer;
    var Realtime: new (source: RealtimeSource, options: RealtimeOptions) => RealtimeLayer;
  }
}

/** Hands the current features to the realtime layer whenever it polls */
type RealtimeSource = (resolve: (geoJson: FeatureCollection) => void, reject: () => void) => void;

interface RealtimeOptions {
  onEachFeature: (feature: GeoJsonFeature, layer: StyledLayer) => void;
  pointToLayer: (feature: GeoJsonFeature, latlng: L.LatLng) => L.Layer;
  getFeatureId: (feature: GeoJsonFeature) => string | number;
  style?: (feature: GeoJsonFeature) => PathStyle | string | undefined;
  interval: number;
}

interface RealtimeLayer extends L.Layer {
  stop(): void;
}

/** A geojson feature, with the style STAM cached on it */
type StyledFeature = GeoJsonFeature & {
  _clusterStyleCache?: { style?: ClusterStyle };
  _polygonStyleCache?: { style?: PathStyle | string };
};

/** The STAM layer itself, a layer group that knows the map it sits on */
type StamLayer = L.LayerGroup & { _map?: L.Map };

/** A leaflet layer of a feature, only vector layers can be styled */
type StyledLayer = L.Layer & {
  feature?: StyledFeature;
  setStyle?: (style: PathStyle) => void;
  getBounds?: () => L.LatLngBounds;
};

//Add the style of the loader
addCss(
  `.loader{border:16px solid #f3f3f3;border-top:16px solid #3498db;border-radius:50%;width:60px;height:60px;left:0;right:0;top:0;margin:auto;bottom:0;position:fixed;animation:spin 2s linear infinite}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`,
);

//Layer that represents all count circles and tooltips
let countLayer: L.LayerGroup;
let geojsonLayer: RealtimeLayer;
//Extend a LayerGroup
const STAMLayer = L.LayerGroup.extend({
  initialize: function (config: Config) {
    const mapInterface = new MapInterface(config);

    let highlight: StyledLayer | null;

    let cache: FeatureCollection = {
      type: "FeatureCollection",
      features: [],
      zoom: 0,
    };

    //Default style
    const style = {
      default: {
        opacity: 0,
        fillOpacity: 0,
      },
      highlight: {
        color: "red",
        opacity: 1,
      },
    };

    //Used for setting the style of a polygon when it is hovered
    const setHighlight = function (layer: StyledLayer) {
      // Check if something's highlighted, if so unset highlight
      if (highlight) {
        unsetHighlight(highlight);
      }

      //Get the style from the config
      const configStyle =
        typeof config.clusterStyle == "function"
          ? ((feature: StyledFeature) => {
              if (!feature._clusterStyleCache) {
                feature._clusterStyleCache = {
                  style: config.clusterStyle(feature),
                };
              }
              return feature._clusterStyleCache.style?.polygon.hover;
            })(layer.feature!)
          : (config.clusterStyle as ClusterStyle)?.polygon.hover;

      //Add a transparent background, if no background was set
      addTransparentBackground(configStyle);

      // Set highlight style on layer and store to variable
      layer.setStyle?.(configStyle ?? style.highlight);
      highlight = layer;
    };

    //Remove the style after the mouse hovered over a polygon
    const unsetHighlight = function (layer: StyledLayer) {
      //Get the style from the config
      const configStyle =
        typeof config.clusterStyle == "function"
          ? ((feature: StyledFeature) => {
              if (!feature._clusterStyleCache) {
                feature._clusterStyleCache = {
                  style: config.clusterStyle(feature),
                };
              }
              return feature._clusterStyleCache.style?.polygon.default;
            })(layer.feature!)
          : (config.clusterStyle as ClusterStyle)?.polygon.default;

      //Add a transparent background, if no background was set
      addTransparentBackground(configStyle);

      // Set default style and clear variable
      layer.setStyle?.(configStyle ?? style.default);
      highlight = null;
    };

    let initialBounds: L.LatLngBounds | null = null;

    //Everything the layer registered on the map, released again when it is removed
    let release: Array<() => void> = [];

    //Called when the layer is added to the map
    this.on("add", function (this: StamLayer) {
      if (this._map != undefined) {
        const map = this._map;

        let zoom = map.getZoom();

        countLayer = L.layerGroup();

        //Called on every feature of the map
        const onEachFeature = (feature: GeoJsonFeature, layer: StyledLayer) => {
          //Check if a polygon is cluster generated by the library and a polygon
          if (feature.geometry?.type == "Polygon" && feature.properties.count) {
            //Check for mouse hover
            layer.on("mouseover", function () {
              if (config.clusterMouseOver) config.clusterMouseOver(feature);

              //Highlight the polygon with the given style
              setHighlight(layer);
            });

            layer.on("mouseout", function () {
              unsetHighlight(layer);
            });

            layer.on("click", function () {
              //Configure a click on the cluster, if nothing is configured or nothing returned, the map zooms to the bounds of the polygon
              if (config.clusterClick) {
                return config.clusterClick(feature);
              }
              map.fitBounds(layer.getBounds!());
            });

            //Get the style from the config
            const configStyle =
              typeof config.clusterStyle == "function"
                ? ((feature: StyledFeature) => {
                    if (!feature._clusterStyleCache) {
                      feature._clusterStyleCache = {
                        style: config.clusterStyle(feature),
                      };
                    }
                    return feature._clusterStyleCache.style?.polygon.default;
                  })(layer.feature!)
                : (config.clusterStyle as ClusterStyle)?.polygon.default;

            //Add a transparent background, if no background was set
            addTransparentBackground(configStyle);

            //Set the default style of a polygon
            layer.setStyle?.(configStyle ?? style.default);

            //Get the bounds and calculate the center of the polygon
            const bounds = layer.getBounds!();
            const lat = (bounds.getNorthEast().lat + bounds.getSouthWest().lat) / 2;
            const lng = (bounds.getNorthEast().lng + bounds.getSouthWest().lng) / 2;

            //Position a circle in the center
            const circle = L.circleMarker(L.latLng(lat, lng), {
              radius: 127 / 3,
            });

            //Add the count of things inside the polygon to the circle
            circle.bindTooltip(`<span>${feature.properties.count}</span>`, {
              permanent: true,
              direction: "center",
              className: "count",
            });

            //Add the circle to the countLayer
            countLayer.addLayer(circle);
          } else {
            let defaultPopup: boolean = true;

            //Add a click event to the markers
            layer.on("click", function () {
              //Get view before opening popup
              initialBounds = map.getBounds();
              if (!layer.getPopup()) {
                //Bind popup with functions return if present
                if (config.markerClick) {
                  feature.properties.closeMarker = () => {
                    layer.bindPopup(out!).closePopup();
                  };
                  const out = config.markerClick(feature) as string | HTMLElement | undefined;
                  if (out) {
                    defaultPopup = false;
                    layer.bindPopup(out).openPopup();
                  }
                }

                if (defaultPopup) {
                  //Default behavior
                  const div = document.createElement("div");
                  createDefaultPopup(div, feature, config);
                  layer.bindPopup(div).openPopup();
                }
              } else {
                //markerClick is only called the first time a marker has been clicked
                //config.markerClick(feature);
                layer.getPopup()!.openPopup();
              }
            });

            layer.on("popupclose", function () {
              if (initialBounds) {
                map.fitBounds(initialBounds);
              }
              if (config.popupClose) {
                config.popupClose(feature);
              }
            });

            layer.on("mouseover", function () {
              if (config.markerMouseOver) return config.markerMouseOver(feature);
            });
          }
        };

        //Used for marker styling
        const pointToLayer = function (feature: GeoJsonFeature, latlng: L.LatLng) {
          if (typeof config.markerStyle == "function") {
            const color = config.markerStyle(feature);
            //A style function may return the color directly or as a promise
            if (color instanceof Promise) {
              const marker = L.marker(latlng);
              //Set the icon once the color resolves
              color.then((resolved: string) => marker.setIcon(textToMarker(resolved)));
              return marker;
            }
            return L.marker(latlng, { icon: textToMarker(color) });
          }

          //Marker coloring
          return L.marker(latlng, {
            icon:
              typeof config.markerStyle == "string"
                ? textToMarker(config.markerStyle)
                : new L.Icon.Default(),
          });
        };

        // The polygonStyle should only be applied to Locations for Features from the STA service
        // not to generated squares
        let styleFunction:
          | ((feature: GeoJsonFeature) => PathStyle | string | undefined)
          | undefined = undefined;
        if (typeof config.polygonStyle == "function") {
          styleFunction = (feature: StyledFeature) => {
            if (feature.geometry?.type == "Polygon" && feature.properties.count) {
              return undefined;
            }

            if (!feature._polygonStyleCache) {
              //Add to object to prevent recall, if style function returns undefined
              feature._polygonStyleCache = {
                style:
                  typeof config.polygonStyle === "string"
                    ? config.polygonStyle
                    : (config.polygonStyle as Function)(feature),
              };
            }

            return feature._polygonStyleCache.style;
          };
        } else if (config.polygonStyle) {
          //The branch above took the function, so this is the style itself
          const polygonStyle = config.polygonStyle as string | Path;

          styleFunction = function (feature: GeoJsonFeature) {
            if (feature.geometry?.type == "Polygon" && feature.properties.count) {
              return undefined;
            }
            return polygonStyle;
          };
        }

        //Called when the LayerGroup was added to the map, then the LayerGroup's super class is done initiating
        const onLayerAdd = function (this: L.Map) {
          map.off("layeradd", onLayerAdd);

          //Create a geojson layer
          geojsonLayer = L.realtime(
            function (resolve: (geoJson: FeatureCollection) => void) {
              resolve(cache);
            },
            {
              onEachFeature,
              pointToLayer,
              getFeatureId: function (geojson: GeoJsonFeature) {
                //Prevent style reset
                if (highlight) setHighlight(highlight);
                //Return id if possible
                if (geojson.properties["@iot.id"]) return geojson.properties["@iot.id"];

                const flatten = geojson.geometry.coordinates.flat(3);
                if (geojson.properties.count) {
                  return flatten.join("/");
                } else {
                  //Create id from coordinates
                  return `${flatten[0]}/${flatten[1]}`;
                }
              },
              style: styleFunction,
              interval: 500,
            },
          );

          //Add count and geojson layer
          this.addLayer(countLayer);
          this.addLayer(geojsonLayer);

          //Initiate the layer group with the current bounds and zoom level
          const bounds = map.getBounds();
          mapInterface.getLayerData(map.getZoom(), [
            bounds.getNorthEast().lng,
            bounds.getNorthEast().lat,
            bounds.getSouthWest().lng,
            bounds.getSouthWest().lat,
          ]);
        };
        map.on("layeradd", onLayerAdd);

        //Called when zoom ended or the map was moved. The geojson layer is removed and a new one added, because the loaded geojson's are cached inside the MapInterface
        const onMoveEnd = function () {
          //Update the zoom variable if the zoom was changed
          if (zoom != map.getZoom()) {
            zoom = map.getZoom();
            countLayer.clearLayers();
          }
          //Set flag to true so that the cluster labels are removed
          const bounds = map.getBounds();

          //add a new layer and remove all old layers
          mapInterface.getLayerData(map.getZoom(), [
            bounds.getNorthEast().lng,
            bounds.getNorthEast().lat,
            bounds.getSouthWest().lng,
            bounds.getSouthWest().lat,
          ]);
        };
        map.on("moveend", onMoveEnd);

        release = [
          mapInterface.onChange((geojson) => {
            if (geojson.zoom == zoom) {
              cache = geojson;
            }
          }),
          () => map.off("layeradd", onLayerAdd),
          () => map.off("moveend", onMoveEnd),
          () => {
            //The realtime layer keeps polling until it is stopped
            geojsonLayer?.stop();
            if (geojsonLayer) map.removeLayer(geojsonLayer);
            if (countLayer) map.removeLayer(countLayer);
          },
        ];
      }
    });

    //A layer that is not on the map must neither listen to it nor draw on it
    this.on("remove", function () {
      for (const remove of release) remove();
      release = [];
    });
  },
}) as new (config: Config) => StamLayer;

const STAM = function (config: Config): StamLayer {
  return new STAMLayer(config);
};

export { STAM };
export type * from "./types";

//Adding custom css to head, so that the count tooltipp's background is transparent
addCss(
  ".leaflet-tooltip.count {background-color: transparent;border: transparent;  box-shadow: none;  font-weight: bold;font-size: 20px;}",
);
