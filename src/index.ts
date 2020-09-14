//@ts-ignore
import picoModal from 'picomodal';
import { textToMarker } from './leaflet/markers';
import { MapInterface } from './MapInterface';

declare var L: any;
declare var ol: any;
declare var Plotly: any;

export interface QueryObject {
  [key: string]: Array<string> | string | Array<QueryObject> | number | boolean,
  entityType: string,
  filter?: string,
  select?: Array<string>,
  expand?: Array<QueryObject>
  top?: number,
  skip?: number,
  count?: boolean,
  id?: number,
  resultFormat?: string,
  orderby?: string,
  pathSuffix?: string
}

export interface Range {
  from: number,
  to?: number
}

export interface RangeQuery {
  zoomLevel: number | Range,
  query: QueryObject
}

export interface Path {
  color: string,
  weight: number,
  opacity: number,
  fillColor: string,
  fillOpacity: number,
}

export interface Style {
  hover: Path,
  default: Path
}

export interface Config {
  plot: {
    startDate: Date,
    offset?: number,
    endDate?: Date
  },
  cachingDuration: number,
  cluster: boolean,
  clusterMin: number,
  queryObject: QueryObject | Array<RangeQuery>,
  baseUrl: string,
  markerStyle?: Function | string,
  clusterStyle?: Function | {
    circle: Path,
    polygon: Style
  },
  markerMouseOver?: Function,
  markerClick?: Function,
  clusterMouseOver?: Function,
  clusterClick?: Function,
  map?: any
}

//Add the style of the loader
addCss(`.loader{border:16px solid #f3f3f3;border-top:16px solid #3498db;border-radius:50%;width:60px;height:60px;left:0;right:0;top:0;margin:auto;bottom:0;position:fixed;animation:spin 2s linear infinite}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`);

//Leaflet
if (typeof L !== "undefined") {

  //Will be replaced at build with leaflet realtime js
  "leaflet-realtime";


  //Layer that represents all count circles and tooltips
  var countLayer: any;
  var geojsonLayer: any;
  //Extend a LayerGroup
  (L as any).Stam = L.LayerGroup.extend({
    initialize: function (config: Config) {
      var mapInterface = new MapInterface(config);

      var highlight: Boolean;

      var cache: any = {
        type: 'FeatureCollection',
        features: []
      }

      //Default style
      var style = {
        'default': {
          'opacity': 0,
          'fillOpacity': 0
        },
        'highlight': {
          'color': 'red',
          'opacity': 1,
        }
      };

      //Used for setting the style of a polygon when it is hovered
      var setHighlight = function (layer: any) {
        // Check if something's highlighted, if so unset highlight
        if (highlight) {
          unsetHighlight(highlight);
        }

        //Get the style from the config
        var configStyle = typeof config.clusterStyle == 'function' ? config.clusterStyle(layer.feature).polygon.hover : config.clusterStyle?.polygon.hover;

        //Add a transparent background, if no background was set
        addTransparentBackground(configStyle);

        // Set highlight style on layer and store to variable
        layer.setStyle(configStyle ?? style.highlight);
        highlight = layer;
      }

      //Remove the style after the mouse hovered over a polygon
      var unsetHighlight = function (layer: any) {
        //Get the style from the config
        var configStyle = typeof config.clusterStyle == 'function' ? config.clusterStyle(layer.feature).polygon.default : config.clusterStyle?.polygon.default;

        //Add a transparent background, if no background was set
        addTransparentBackground(configStyle);

        // Set default style and clear variable
        layer.setStyle(configStyle ?? style.default);
        highlight = null;
      }


      //Called when the layer is added to the map
      this.on('add', function () {
        if (this._map != undefined) {
          var map = this._map;


          var zoom = map.getZoom();

          countLayer = L.layerGroup();

          //Called on every feature of the map
          var onEachFeature = (feature: any, layer: any) => {
            //Check if a polygon is cluster generated by the library and a polygon
            if (feature.geometry?.type == 'Polygon' && feature.properties.count) {
              //Check for mouse hover
              layer.on('mouseover', function () {
                if (config.clusterMouseOver) config.clusterMouseOver(feature);

                //Highlight the polygon with the given style
                setHighlight(layer);
              });

              layer.on('mouseout', function () {
                unsetHighlight(layer);
              });

              layer.on('click', function () {

                //Configure a click on the cluster, if nothing is configured or nothing returned, the map zooms to the bounds of the polygon 
                if (config.clusterClick) {
                  return config.clusterClick(feature);
                }
                map.fitBounds(layer.getBounds());
              });

              //Get the style from the config
              var configStyle = typeof config.clusterStyle == 'function' ? config.clusterStyle(layer.feature).polygon.default : config.clusterStyle?.polygon.default;

              //Add a transparent background, if no background was set
              addTransparentBackground(configStyle);

              //Set the default style of a polygon
              layer.setStyle(configStyle ?? style.default);

              //Get the bounds and calculate the center of the polygon
              var bounds = layer.getBounds();
              var lat = (bounds._northEast.lat + bounds._southWest.lat) / 2;
              var lng = (bounds._northEast.lng + bounds._southWest.lng) / 2;



              //Position a circle in the center
              var circle = L.circleMarker(L.latLng(lat, lng), {
                radius: 127 / 3
              });

              //Add the count of things inside the polygon to the circle
              circle.bindTooltip(`<span>${feature.properties.count}</span>`, { permanent: true, direction: "center", className: 'count' });

              //Add the circle to the countLayer
              countLayer.addLayer(circle);
            } else {
              var defaultPopup: boolean = true;

              //Add a click event to the markers
              layer.on('click', function () {
                if (!layer.getPopup()) {
                  //Bind popup with functions return if present
                  if (config.markerClick) {
                    var out = config.markerClick(feature);
                    if (out) {
                      defaultPopup = false;
                      layer.bindPopup(out).openPopup();
                    }
                  }

                  if (defaultPopup) {
                    //Default behavior 
                    var div = document.createElement('div');
                    createDefaultPopup(div, feature, config);
                    layer.bindPopup(div).openPopup();
                  }
                } else {
                  layer.getPopup().openPopup();
                }
              });

              layer.on('mouseover', function () {
                if (config.markerMouseOver) return config.markerMouseOver(feature);
              });
            }
          };

          //Used for marker styling
          var pointToLayer = function (feature: any, latlng: any) {
            //Check if style function is async
            if (typeof config.markerStyle == 'function' && config.markerStyle.constructor.name === "AsyncFunction") {
              var marker = L.marker(latlng);
              //Add marker to layerGroup when done
              config.markerStyle(feature).then((color: string) => {
                marker.setIcon(textToMarker(color));
              });
              return marker;
            } else {
              //Marker coloring
              var marker = L.marker(latlng, { icon: typeof config.markerStyle == 'function' ? textToMarker(config.markerStyle(feature)) : typeof config.markerStyle == 'string' ? textToMarker(config.markerStyle) : new L.Icon.Default() });
              return marker;
            }
          }

          //Called when the LayerGroup was added to the map, then the LayerGroup's super class is done initiating 
          map.on('layeradd', function () {
            map.off('layeradd');

            //Create a geojson layer
            /* geojsonLayer = L.geoJSON(null, {
               onEachFeature,
               pointToLayer,
               style: config.clusterStyle
             });*/
            geojsonLayer = L.realtime(function (resolve: any, reject: any) {
              resolve(cache);
            }, {
              onEachFeature,
              pointToLayer,
              getFeatureId: function (geojson: any) {
                //Prevent style reset
                if (highlight) setHighlight(highlight);
                //Return id if possible
                if (geojson.properties['@iot.id']) return geojson.properties['@iot.id'];

                var flatten = geojson.geometry.coordinates.flat(3);
                if (geojson.properties.count) {
                  return flatten.join('/');
                } else {
                  //Create id from coordinates
                  return `${flatten[0]}/${flatten[1]}`;
                }
              },
              //style: config.clusterStyle ?? undefined,
              interval: 3 * 100
            });

            //Add count and geojson layer
            this.addLayer(countLayer);
            this.addLayer(geojsonLayer);

            //Initiate the layer group with the current bounds and zoom level
            var bounds = map.getBounds();
            mapInterface.getLayerData(map.getZoom(), [bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat]);
          });

          mapInterface.on('change', function (geojson: any) {
            if (geojson.zoom == zoom) {
              /*
              //Clear layer on change
              geojsonLayer.clearLayers();
              //Add the new data
              geojsonLayer.addData(geojson);
              //Force cluster layer clearing
              clearCluster = true;*/
              cache = geojson;
            }
          }.bind(this));


          //Called when zoom ended or the map was moved. The geojson layer is removed and a new one added, because the loaded geojson's are cached inside the MapInterface
          map.on('moveend', function () {
            //Update the zoom variable if the zoom was changed
            if (zoom != map.getZoom()) {
              zoom = map.getZoom();
              countLayer.clearLayers();
            }
            //Set flag to true so that the cluster labels are removed
            var bounds = map.getBounds();

            //add a new layer and remove all old layers
            mapInterface.getLayerData(map.getZoom(), [bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat]);
          });
        }
      });
    },

  });

  (L as any).stam = function (config: Config) {
    return new (L as any).Stam(config);
  }

  //Adding custom css to head, so that the count tooltipp's background is transparent
  addCss('.leaflet-tooltip.count {background-color: transparent;border: transparent;  box-shadow: none;  font-weight: bold;font-size: 20px;}');
}

if (typeof ol != "undefined") {

  //Adding css style for the marker popup
  addCss(`.ol-popup{position:absolute;min-width:180px;background-color:#fff;-webkit-filter:drop-shadow(0 1px 4px rgba(0, 0, 0, .2));filter:drop-shadow(0 1px 4px rgba(0, 0, 0, .2));padding:15px;border-radius:10px;border:1px solid #ccc;bottom:40px;left:-50px}.ol-popup:after,.ol-popup:before{top:100%;border:solid transparent;content:" ";height:0;width:0;position:absolute;pointer-events:none}.ol-popup:after{border-top-color:#fff;border-width:10px;left:48px;margin-left:-10px}.ol-popup:before{border-top-color:#ccc;border-width:11px;left:48px;margin-left:-11px}.ol-popup-closer{text-decoration:none;position:absolute;top:2px;right:8px}.ol-popup-closer:after{content:"✖"}`);

  //Since ol 6 ol.inherits was removed
  var ol_ext_inherits = function (child: any, parent: any) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
  };

  var zoom: number;

  var olmap: any;

  /**
   * STAM implementation for openLayers
   * @param config STAM configuration object
   */
  var ol_layer_stam = function (config: Config) {
    //Get map instance from config
    olmap = config.map;

    //Init LayerGroup
    ol.layer.Group.call(this, config);

    //Get current zoom level and remove all decimal places
    zoom = olmap.getView().getZoom().toFixed(0);

    var mapInterface = new MapInterface(config);

    var clearCircles: boolean = false;

    var circleLayer = new ol.layer.Vector({ source: new ol.source.Vector() });

    //Create the vectorLayer with the geojson vector source
    var vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      // features,
      style: function (feature: any) {
        if (clearCircles) {
          clearCircles = false;
          circleLayer.getSource().clear();
        }
        //Check the feature type
        if (feature.getGeometry().getType() == "Point") {
          //Check if it is a async function
          if (typeof config.markerStyle == 'function' && config.markerStyle.constructor.name === "AsyncFunction") {
            //Get the color an set the style
            config.markerStyle(olToGeoJSON(feature)).then((color: string) => {
              feature.setStyle(new ol.style.Style({
                image: new ol.style.Icon(({
                  anchor: [0.5, 1],
                  scale: 0.5,
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'fraction',
                  //Call function if present, with the feature, if not use the color name if present. Default is blue
                  src: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`
                })),
              }));
            });
            return null;
          }
          //Add the marker image
          var style = new ol.style.Style({
            image: new ol.style.Icon(({
              anchor: [0.5, 1],
              scale: 0.5,
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              //Call function if present, with the feature, if not use the color name if present. Default is blue
              src: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${typeof config.markerStyle == 'function' ? config.markerStyle(olToGeoJSON(feature)) : config.markerStyle ? config.markerStyle : 'blue'}.png`
            })),
          });

          return style;
        } else {

          //Get extends of cluster
          var cords = feature.getGeometry().getExtent();

          //Calculate middle
          var long = (cords[0] + cords[2]) / 2;
          var lat = (cords[1] + cords[3]) / 2;

          //Get style from config
          var style: any = typeof config.clusterStyle == 'function' ? config.clusterStyle(olToGeoJSON(feature)) : config.clusterStyle;

          //Get the individual styles
          var circleStyle = style?.circle as Path;
          var polygonStyle = style?.polygon.default as Path;


          if (feature.get('count') != undefined) {
            //Add circle with text
            var circle = new ol.Feature({ geometry: new ol.geom.Circle([long, lat], (cords[2] - cords[0]) / 6), name: 'cluster' });

            //Create the text style
            var text = new ol.style.Text({
              font: 30 + 'px Calibri,sans-serif',
              fill: new ol.style.Fill({ color: '#000' }),
              stroke: new ol.style.Stroke({
                color: '#fff', width: 2
              }),
              text: `${feature.get('count')}`
            });

            //Add circle style, if present
            if (circleStyle) {
              var style = pathToOl(circleStyle);
              style.setText(text);
              circle.setStyle(style);
            } else {
              circle.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                  width: 2,
                  color: 'red',
                  radius: 1
                }),
                text
              }));
            }

            //Add circle to circle layer
            circleLayer.getSource().addFeature(circle);
          }

          //Convert path to openLayers style
          if (polygonStyle) {
            polygonStyle = pathToOl(polygonStyle)
          }

          //Use config style if preset
          return polygonStyle ?? new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#3399CC',
              width: 1.25
            }),
            fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.4)' })
          });
        }
      }
    });

    //Create a layergroup out of the circle layer and GeoJson layer
    var layer = new ol.layer.Group({ layers: [circleLayer, vectorLayer] });

    //Add layer to the map
    olmap.addLayer(layer);


    //Create a geojson format with the current projection
    var format = new ol.format.GeoJSON({
      featureProjection: olmap.getView().getProjection().getCode()
    });

    //Fetch the geojson
    mapInterface.on('change', (geoJson: any) => {
      if (geoJson.zoom == zoom) {
        //Clear the geojson layer
        vectorLayer.getSource().clear();

        //Force circle layer clear
        clearCircles = true;

        //Create the geojson and add it to the source
        vectorLayer.getSource().addFeatures(format.readFeatures(geoJson))
      }
    });

    //If popup is not in the html dom, add it
    if (!document.getElementById('popup')) {
      document.writeln(`<div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content"></div>
      </div>`);
    }

    //Creating the popup
    var
      container = document.getElementById('popup'),
      content_element = document.getElementById('popup-content'),
      closer = document.getElementById('popup-closer');

    //Marker close event
    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    //Create overlay for popup
    var overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      offset: [0, -10]
    });
    //Add popup to map
    olmap.addOverlay(overlay);

    var selected: any = null;

    var defaultHighlightStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.7)',
      }),
      stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 3,
      }),
    });

    var last: any = null;

    olmap.on('pointermove', function (e: any) {

      //Get the hovered feature
      var hit = olmap.forEachFeatureAtPixel(e.pixel, function (f: any) {
        //Check if it is a cluster
        if (f.get('count')) {

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
            var clusterStyle = typeof config.clusterStyle == 'function' ? config.clusterStyle(olToGeoJSON(f)).polygon.hover : config.clusterStyle.polygon.hover
            style = pathToOl(clusterStyle);
          } else {
            var style = defaultHighlightStyle;
          }

          f.setStyle(style);
        } else {
          //Check if it is a marker
          if (f.get('@iot.id')) {
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
        this.getTargetElement().style.cursor = 'pointer';
      } else {
        //Remove style from old selected
        if (selected) {
          selected?.setStyle(undefined);
          selected = null;
        }
        //Remove cursor style
        this.getTargetElement().style.cursor = '';
      }
    });


    //Map onclick
    olmap.on('click', function (evt: any) {
      //Get the clicked feature
      var feature = olmap.forEachFeatureAtPixel(evt.pixel,
        function (feature: any) {
          return feature;
        });
      //Check if feature was clicked
      if (feature) {
        //Marker was clicked
        if (feature.get('@iot.id') != undefined) {
          var geometry = feature.getGeometry();

          var content;
          //Check type
          if (typeof config.markerClick == 'function') {
            content = config.markerClick(olToGeoJSON(feature));
          }

          //If no content, just insert the default content
          if (!content) {
            createDefaultPopup(content_element, olToGeoJSON(feature), config);
          } else {
            content_element.innerHTML = content;
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
          if (feature.get('count') != undefined) {
            if (typeof config.clusterClick == 'function') {
              config?.clusterClick(olToGeoJSON(feature));
            } else {
              olmap.getView().fit(feature.getGeometry().getExtent(), olmap.getSize(), { duration: 1000 });
            }
          }
        }
      }
    });

    //Add listener to moveend, called when moving and zooming;
    olmap.on("moveend", function () {
      //Check if zoom level was changed
      if (zoom != olmap.getView().getZoom()) {
        zoom = olmap.getView().getZoom().toFixed(0);
      }

      //always add new layer, because the geojson is cached inside MapInterface.ts
      addSTAMLayer(mapInterface, zoom, config, olmap);
    });
  };

  //Inherit the layer group from openLayers
  ol_ext_inherits(ol_layer_stam, ol.layer.Group);

  //Add the layer to ol.layer.STAM
  ol.layer.STAM = ol_layer_stam
}

/**
 * Helper function, to set the background of an element to transparent, if nothing was set. 
 * This is necessary due to the behavior of leaflet, to set the background to the border color, if no fill color was set
 * @param configStyle The config to edit
 */
function addTransparentBackground(configStyle: Path) {
  if (configStyle && !configStyle.fillColor) {
    configStyle.fillColor = 'rgba(255,0,0,0.0)';
  }
}

/**
 * Adds the default body to a popup
 * @param content_element popup content element
 * @param feature GeoJSON feature that was clicked
 */
function createDefaultPopup(content_element: HTMLElement, feature: any, config: Config) {
  content_element.innerHTML = '<h3>' + feature.properties.name + '</h3>';

  var list = document.createElement('ul');

  //Iterate all ObservedProperties
  feature.properties.getData.forEach(function (obj: any) {

    //Create new list element
    var li = document.createElement('li');
    li.innerText = obj.observedProperty;
    //Set cursor style on hover
    li.setAttribute('style', "cursor: pointer");
    if (typeof Plotly != 'undefined') {
      li.onclick = function () {
        //Create new popup
        picoModal({
          width: '70%', content: '', modalId: 'pico-1'
        }).beforeClose(function () {
          Plotly.purge("pico-1");
          //Remove pico-1 element from the DOM
          document.getElementById("pico-1").remove();
        }).afterShow(async function (modal: any) {
          //Set overflow to hidden, so no scrollbar is shown
          modal.modalElem().style.overflow = 'hidden';
          //Set height to 50%
          modal.modalElem().style.height = '50%';

          //Create loader div
          var loader = document.createElement('div');
          //Set class to loader
          loader.classList.add('loader');

          //Add loader to modal
          modal.modalElem().appendChild(loader);

          var reverse: boolean = false;
          //Get data
          var result = await obj.getData(function (query: QueryObject) {
            //Get the dataArray
            query.resultFormat = 'dataArray';
            query.orderby = 'phenomenonTime asc';
            if (config.plot) {
              var operator: string = 'gt';
              //Check if offset is present
              if (config.plot.offset) {
                //Set top to the offset
                query.top = Math.abs(config.plot.offset);
                //Check if number is negative
                if (Math.sign(config.plot.offset) == -1) {
                  //Reverse array after getting the data, due to the orderby
                  reverse = true;
                  //Reverse order to get the last $top observations
                  query.orderby = 'phenomenonTime desc';
                  //Change operator to lower than
                  operator = 'lt';
                }

                //Add filter
                query.filter = `phenomenonTime ${operator} ${config.plot.startDate.toISOString()}`;
              } else {
                //Check if end data is present
                if (config.plot.endDate) {
                  //Filter for startDate and endDate
                  query.filter = `(phenomenonTime gt ${config.plot.startDate.toISOString()}) and (phenomenonTime lt ${config.plot.endDate.toISOString()})`;
                }
              }
            }
            return query;
          });

          //SHOW diagram

          var x: any = [];
          var y: any = [];

          //Get datastream
          var Datastream = result.value;

          //Reverse array if necessary
          if (reverse) {
            Datastream.dataArray = Datastream.dataArray.reverse();
          }

          //Check if data was returned
          if (Datastream.dataArray) {
            Datastream.dataArray.forEach((Observation: any) => {
              //Split data if a timespan was entered, and add both to the x array
              if (Observation[1].indexOf('/') != -1) {
                x.push(Observation[1].split('/')[0]);
                x.push(Observation[1].split('/')[1]);

                y.push(Observation[2]);
              } else {
                //Time is not a timespan
                x.push(Observation[1]);
              }
              y.push(Observation[2]);
            });
          }

          //Create trace
          var trace1 = {
            x,
            y,
            type: 'scatter'
          };

          var data: any = [trace1];

          //Set both axis to autorange and add the unit as a title
          var layout = {
            xaxis: {
              autorange: true
            },
            yaxis: {
              autorange: true,
              title: { text: result.unitOfMeasurement.name }
            },
            autosize: true
          };

          //Remove loader
          loader.remove();

          //Add new plot
          Plotly.newPlot('pico-1', data, layout, { responsive: true });

        }).show();
      };
    }
    //Append to list
    list.appendChild(li);
  });

  //Append list to popup
  content_element.appendChild(list);
}

/**
 * Creates a stam layer
 * @param mapInterface mapInterface instance
 * @param zoom current zoom level
 * @returns a promise that resolves with an openLayers vectorLayer that contains the geoJson
 */
function addSTAMLayer(mapInterface: MapInterface, zoom: number, config: Config, map: any) {
  var bounds;

  //Check it the projection is EPSG 4326
  if (olmap.getView().getProjection().getCode() == "EPSG:4326")
    bounds = olmap.getView().calculateExtent();
  else {
    //If not convert the bounding box to EPSG 4326
    var zw = olmap.getView().calculateExtent();
    var code = olmap.getView().getProjection().getCode();
    bounds = [];
    bounds.push(...(new ol.geom.Point([zw[2], zw[3]])).transform(code, 'EPSG:4326').getCoordinates());
    bounds.push(...(new ol.geom.Point([zw[0], zw[1]])).transform(code, 'EPSG:4326').getCoordinates());
  }

  mapInterface.getLayerData(zoom, bounds);
}

/**
 * Converts a ol feature to a geoJson
 * @param feature ol feature
 */
function olToGeoJSON(feature: any): any {
  return { type: feature.getGeometry().getType(), properties: feature.getProperties(), geometry: { type: 'Point', coordinates: feature.getGeometry().getCoordinates() } };
}

/**
 * Helper function to convert a Path object to a valid openLayers style
 * @param path Path to convert
 */
function pathToOl(path: Path) {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: colorWithAlpha(path.color ?? 'red', path.opacity),
      width: path.weight ?? 1
    }),
    fill: new ol.style.Fill({
      color: path.fillColor ? colorWithAlpha(path.fillColor, path.fillOpacity) : 'rgba(0, 0, 0, 0)'
    })
  });
}

/**
 * Adds a alpha value to a color
 * @param color Color string or hex
 * @param alpha Alpha value from 0 to 1
 */
function colorWithAlpha(color: any, alpha: any = 1) {
  //Convert color to rgb
  const [r, g, b] = Array.from(ol.color.asArray(color));
  //Add alpha
  return ol.color.asString([r, g, b, alpha]);
}

/**
 * Add css to the document
 * @param css Css string
 */
function addCss(css: string) {
  var head = document.head || document.getElementsByTagName('head')[0],
    style: any = document.createElement('style');

  head.appendChild(style);

  style.type = 'text/css';
  if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}