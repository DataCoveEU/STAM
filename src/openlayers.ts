import { MapInterface } from "./MapInterface";
import type { Config, Path, ClusterStyle } from "./types";
import { addCss, createDefaultPopup } from "./utils";
import type OlMap from "ol/Map";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";

declare global {
  var ol: {
    layer: typeof import("ol/layer");
    source: typeof import("ol/source");
    style: typeof import("ol/style");
    geom: typeof import("ol/geom");
    format: typeof import("ol/format");
    color: typeof import("ol/color");
    Feature: typeof import("ol/Feature").default;
    Overlay: typeof import("ol/Overlay").default;
  };
}

//Add the style of the loader
addCss(
  `.loader{border:16px solid #f3f3f3;border-top:16px solid #3498db;border-radius:50%;width:60px;height:60px;left:0;right:0;top:0;margin:auto;bottom:0;position:fixed;animation:spin 2s linear infinite}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`,
);

//Adding css style for the marker popup
addCss(
  `.ol-popup{position:absolute;min-width:180px;background-color:#fff;-webkit-filter:drop-shadow(0 1px 4px rgba(0, 0, 0, .2));filter:drop-shadow(0 1px 4px rgba(0, 0, 0, .2));padding:15px;border-radius:10px;border:1px solid #ccc;bottom:40px;left:-50px}.ol-popup:after,.ol-popup:before{top:100%;border:solid transparent;content:" ";height:0;width:0;position:absolute;pointer-events:none}.ol-popup:after{border-top-color:#fff;border-width:10px;left:48px;margin-left:-10px}.ol-popup:before{border-top-color:#ccc;border-width:11px;left:48px;margin-left:-11px}.ol-popup-closer{text-decoration:none;position:absolute;top:2px;right:8px}.ol-popup-closer:after{content:"✖"}`,
);

var zoom: any;

//Marker image for a color name
function markerStyle(color: string) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      scale: 0.5,
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
      src: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    }),
  });
}

class STAM extends ol.layer.Group {
  constructor(config: Config) {
    super();
    const olmap = config.map as OlMap;

    //Get current zoom level and remove all decimal places
    zoom = (olmap.getView().getZoom() ?? 0).toFixed(0);

    var mapInterface = new MapInterface(config);

    const circleSource = new ol.source.Vector();
    const circleLayer: VectorLayer<VectorSource> = new ol.layer.Vector({ source: circleSource });

    //The circle of every drawn cluster, so it can be removed together with its cluster
    const circles = new Map<string, any>();

    //The style a cluster is configured with, cached on the feature
    const clusterStyleOf = (feature: any): ClusterStyle | undefined => {
      if (typeof config.clusterStyle != "function") return config.clusterStyle;

      if (!feature._clusterStyleCache) {
        feature._clusterStyleCache = { style: config.clusterStyle(olToGeoJSON(feature)) };
      }
      return feature._clusterStyleCache.style;
    };

    //Create the vectorLayer with the geojson vector source
    const vectorSource = new ol.source.Vector();
    const vectorLayer: VectorLayer<VectorSource> = new ol.layer.Vector({
      source: vectorSource,
      // features,
      style: function (feature: any) {
        //Check the feature type
        if (feature.getGeometry().getType() == "Point") {
          //Call the function if present, otherwise use the color name if present. Default is blue
          const color =
            typeof config.markerStyle == "function"
              ? config.markerStyle(olToGeoJSON(feature))
              : config.markerStyle || "blue";

          //A style function may return the color directly or as a promise
          if (color instanceof Promise) {
            //Set the style once the color resolves
            color.then((resolved: string) => feature.setStyle(markerStyle(resolved)));
            return undefined;
          }

          //Add the marker image
          return markerStyle(color);
        } else {
          //Use config style if preset
          return (
            pathToOl(clusterStyleOf(feature)?.polygon.default) ??
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: "#3399CC",
                width: 1.25,
              }),
              fill: new ol.style.Fill({ color: "rgba(255,255,255,0.4)" }),
            })
          );
        }
      },
    });

    /**
     * Draws the count of a cluster as a circle on the circle layer
     */
    const addCircle = (key: string, feature: any) => {
      if (feature.get("count") == undefined) return;

      //Get extends of cluster
      const cords = feature.getGeometry().getExtent();

      //Calculate middle
      const long = (cords[0] + cords[2]) / 2;
      const lat = (cords[1] + cords[3]) / 2;

      //Add circle with text
      const circle = new ol.Feature({
        geometry: new ol.geom.Circle([long, lat], (cords[2] - cords[0]) / 6),
        name: "cluster",
      });

      //Create the text style
      const text = new ol.style.Text({
        font: 30 + "px Calibri,sans-serif",
        fill: new ol.style.Fill({ color: "#000" }),
        stroke: new ol.style.Stroke({
          color: "#fff",
          width: 2,
        }),
        text: `${feature.get("count")}`,
      });

      const circleStyle = clusterStyleOf(feature)?.circle;

      //Add circle style, if present
      if (circleStyle) {
        const style = pathToOl(circleStyle);
        style.setText(text);
        circle.setStyle(style);
      } else {
        circle.setStyle(
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              width: 2,
              color: "red",
            }),
            text,
          }),
        );
      }

      //Add circle to circle layer
      circles.set(key, circle);
      circleSource.addFeature(circle);
    };

    //Create a layergroup out of the circle layer and GeoJson layer
    const layer = new ol.layer.Group({ layers: [circleLayer, vectorLayer] });

    //Create a geojson format with the current projection
    const format = new ol.format.GeoJSON({
      featureProjection: olmap.getView().getProjection().getCode(),
    });

    //Fetch the geojson
    const onChange = (geoJson: any) => {
      if (geoJson.zoom != zoom) return;

      //Everything the map should show now
      const incoming = new Map<string, any>();
      for (const feature of geoJson.features) incoming.set(featureKey(feature), feature);

      //Features that are still there stay untouched, the ones that are gone are removed
      for (const feature of vectorSource.getFeatures()) {
        const key = (feature as any)._stamKey;
        if (incoming.delete(key)) continue;

        vectorSource.removeFeature(feature);

        const circle = circles.get(key);
        if (circle) {
          circleSource.removeFeature(circle);
          circles.delete(key);
        }
      }

      //Only what is left is new, so only that is parsed and drawn
      for (const [key, geoJsonFeature] of incoming) {
        const feature: any = format.readFeature(geoJsonFeature);
        feature._stamKey = key;

        vectorSource.addFeature(feature);
        addCircle(key, feature);
      }
    };

    //If popup is not in the html dom, add it
    if (!document.getElementById("popup")) {
      document.body.insertAdjacentHTML(
        "beforeend",
        `<div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content"></div>
      </div>`,
      );
    }

    //Creating the popup
    const container = document.getElementById("popup") as HTMLElement,
      content_element = document.getElementById("popup-content") as HTMLElement,
      closer = document.getElementById("popup-closer") as HTMLElement;
    let initialBounds: any = null;

    //Create overlay for popup
    var overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      offset: [0, -10],
    });
    //Add popup to map

    var selected: any = null;

    var defaultHighlightStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255,255,255,0.7)",
      }),
      stroke: new ol.style.Stroke({
        color: "#3399CC",
        width: 3,
      }),
    });

    var last: any = null;

    const onPointerMove = function (this: any, e: any) {
      //Get the hovered feature
      var hit = olmap.forEachFeatureAtPixel(e.pixel, function (f: any) {
        //Check if it is a cluster
        if (f.get("count")) {
          //Set last clicked element if not set
          if (last != f) {
            last = f;
            //Call mouse over, but only once per marker
            if (config.clusterMouseOver) config.clusterMouseOver(olToGeoJSON(f));
          }
          //Remove style of old selected, if the current selected is a new one
          if (selected != f) {
            selected?.setStyle(undefined);

            selected = f;
          }

          var style;

          //Set config style if present
          if (config.clusterStyle) {
            var clusterStyle =
              typeof config.clusterStyle == "function"
                ? ((feature: any) => {
                    if (!feature._clusterStyleCache) {
                      feature._clusterStyleCache = {
                        style: config.clusterStyle(olToGeoJSON(feature)),
                      };
                    }
                    return feature._clusterStyleCache.style.polygon.hover;
                  })(f)
                : (config.clusterStyle as ClusterStyle).polygon.hover;
            style = pathToOl(clusterStyle);
          } else {
            style = defaultHighlightStyle;
          }

          f.setStyle(style);
        } else {
          //Check if it is a marker
          if (f.get("@iot.id")) {
            //Call function only once per marker
            if (last != f) {
              last = f;
              //Call callback
              if (config.markerMouseOver) config.markerMouseOver(olToGeoJSON(f));
            }
          }
        }

        return f;
      });

      //Check if something was hovered over
      if (hit) {
        //Set cursor to pointer
        this.getTargetElement().style.cursor = "pointer";
      } else {
        //Remove style from old selected
        if (selected) {
          selected?.setStyle(undefined);
          selected = null;
        }
        //Remove cursor style
        this.getTargetElement().style.cursor = "";
      }
    };

    //Map onclick
    const onClick = function (evt: any) {
      //Get the clicked feature
      var feature = olmap.forEachFeatureAtPixel(evt.pixel, function (feature: any) {
        return feature;
      });
      //Check if feature was clicked
      if (feature) {
        //Marker was clicked
        if (feature.get("@iot.id") != undefined) {
          var geometry = feature.getGeometry();

          var close = function () {
            if (config.popupClose) {
              config.popupClose();
            }
            overlay.setPosition(undefined);
            closer.blur();
            olmap.getView().fit(initialBounds, { size: olmap.getSize() });
            return false;
          };

          var content;
          initialBounds = olmap.getView().calculateExtent();
          //Check type
          if (typeof config.markerClick == "function") {
            var geojsonFeature = olToGeoJSON(feature);
            //Add close function
            geojsonFeature.properties.closeMarker = close;

            content = config.markerClick(geojsonFeature);
          }

          //Marker close event
          closer.onclick = close;

          //If no content, just insert the default content
          if (!content) {
            createDefaultPopup(content_element, olToGeoJSON(feature), config);
          } else if (typeof content == "string") {
            content_element.innerHTML = content;
          } else {
            content_element.replaceChildren(content);
          }

          if (geometry.getType() == "Point") {
            overlay.setPosition(geometry.getCoordinates());
          } else {
            var cords = evt.pixel;
            cords[1] = cords[1] + 36;
            overlay.setPosition(olmap.getCoordinateFromPixel(cords));
          }
        } else {
          //Cluster was clicked
          if (feature.get("count") != undefined) {
            if (typeof config.clusterClick == "function") {
              config?.clusterClick(olToGeoJSON(feature));
            } else {
              olmap.getView().fit(feature.getGeometry().getExtent(), {
                size: olmap.getSize(),
                duration: 1000,
              });
            }
          }
        }
      }
    };

    //Add listener to moveend, called when moving and zooming;
    const onMoveEnd = function () {
      //Check if zoom level was changed
      if (zoom != olmap.getView().getZoom()) {
        zoom = (olmap.getView().getZoom() ?? 0).toFixed(0);
      }

      //always add new layer, because the geojson is cached inside MapInterface.ts
      addSTAMLayer(mapInterface, zoom, olmap);
    };

    //Listeners of the running layer, released again when it is taken off the map
    let unsubscribe: (() => void) | undefined;

    const listen = () => {
      olmap.addLayer(layer);
      olmap.addOverlay(overlay);

      unsubscribe = mapInterface.onChange(onChange);
      olmap.on("pointermove", onPointerMove);
      olmap.on("click", onClick);
      olmap.on("moveend", onMoveEnd);
    };

    const release = () => {
      olmap.removeLayer(layer);
      olmap.removeOverlay(overlay);

      unsubscribe?.();
      unsubscribe = undefined;
      olmap.un("pointermove", onPointerMove);
      olmap.un("click", onClick);
      olmap.un("moveend", onMoveEnd);
    };

    //A layer that is not on the map must neither listen to it nor draw on it
    olmap.getLayers().on("add", (event: any) => {
      if (event.element === this) listen();
    });
    olmap.getLayers().on("remove", (event: any) => {
      if (event.element === this) release();
    });
  }
}

export { STAM };

/**
 * Creates a stam layer
 * @param mapInterface mapInterface instance
 * @param zoom current zoom level
 * @returns a promise that resolves with an openLayers vectorLayer that contains the geoJson
 */
function addSTAMLayer(mapInterface: MapInterface, zoom: number, olmap: any) {
  var bounds;

  //Check it the projection is EPSG 4326
  if (olmap.getView().getProjection().getCode() == "EPSG:4326")
    bounds = olmap.getView().calculateExtent();
  else {
    //If not convert the bounding box to EPSG 4326
    var zw = olmap.getView().calculateExtent();
    var code = olmap.getView().getProjection().getCode();
    bounds = [];
    bounds.push(...new ol.geom.Point([zw[2], zw[3]]).transform(code, "EPSG:4326").getCoordinates());
    bounds.push(...new ol.geom.Point([zw[0], zw[1]]).transform(code, "EPSG:4326").getCoordinates());
  }

  mapInterface.getLayerData(zoom, bounds);
}

/**
 * Identifies a feature across updates. Markers keep their id, a cluster its tile and count
 */
function featureKey(feature: any): string {
  const id = feature.properties?.["@iot.id"];
  if (id != undefined) return `${id}`;

  const coordinates = feature.geometry.coordinates.flat(3).join("/");
  //A cluster whose count changed has to be drawn again
  return feature.properties?.count == undefined
    ? coordinates
    : `${coordinates}/${feature.properties.count}`;
}

/**
 * Converts a ol feature to a geoJson
 * @param feature ol feature
 */
function olToGeoJSON(feature: any): any {
  return {
    type: feature.getGeometry().getType(),
    properties: feature.getProperties(),
    geometry: {
      type: "Point",
      coordinates: feature.getGeometry().getCoordinates(),
    },
  };
}

/**
 * Helper function to convert a Path object to a valid openLayers style
 * @param path Path to convert
 */
function pathToOl(path: Path | undefined) {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: colorWithAlpha(path?.color ?? "red", path?.opacity),
      width: path?.weight ?? 1,
    }),
    fill: new ol.style.Fill({
      color: path?.fillColor
        ? colorWithAlpha(path?.fillColor, path?.fillOpacity)
        : "rgba(0, 0, 0, 0)",
    }),
  });
}

function colorWithAlpha(color: any, alpha: any = 1) {
  const [r, g, b] = Array.from(ol.color.asArray(color));
  return ol.color.asString([r, g, b, alpha]);
}
