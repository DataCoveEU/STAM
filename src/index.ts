import { STAInterface } from './STAInterface';
import { MapInterface } from './MapInterface';
import { colorMarkers, textToMarker } from './leaflet/markers';



declare var L: any;
declare var ol: any;

export interface QueryObject {
  [key: string]: Array<String> | String | Array<QueryObject> | Number | Boolean,
  entityType: String,
  filter?: String,
  select?: Array<String>,
  expand?: Array<QueryObject>
  top?: Number,
  skip?: Number,
  count?: Boolean,
  id?: Number
}

export interface Config {
  queryObject: QueryObject;
  baseUrl: String,
  MarkerStyle?: Function | object,
  ClusterStyle?: Function | object,
  MarkerMouseOver?: Function,
  MarkerClick?: Function,
  ClusterMouseOver?: Function,
  ClusterClick?: Function,
  map?: any
}

//Leaflet
if (typeof L !== "undefined") {
  var layers: any = [];
  var countLayer: any;
  (L as any).Stam = L.LayerGroup.extend({
    initialize: function (config: Config) {
      var mapInterface = new MapInterface(config);
      this.on('add', function () {
        if (this._map != undefined) {

          var highlight: Boolean;

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

          var setHighlight = function (layer: any) {
            // Check if something's highlighted, if so unset highlight
            if (highlight) {
              unsetHighlight(highlight);
            }
            // Set highlight style on layer and store to variable
            layer.setStyle(style.highlight);
            highlight = layer;
          }

          var unsetHighlight = function (layer: any) {
            // Set default style and clear variable
            layer.setStyle(style.default);
            highlight = null;
          }

          var clearCluster: boolean;

          var map = this._map;

          var zoom = map.getZoom();

          var onEachFeature = (feature: any, layer: any) => {
            if (clearCluster) {
              countLayer.clearLayers();
              clearCluster = false;
            }
            if (feature.geometry?.type == 'Polygon') {
              //Adding marker
              layer.on('mouseover', function () {
                if (config.ClusterMouseOver) return config.ClusterMouseOver(feature, layer);
                setHighlight(layer);
              });

              layer.on('mouseout', function () {
                if (config.ClusterMouseOver) return;
                unsetHighlight(layer);
              });

              layer.on('click', function () {
                if (config.ClusterClick) {
                  var out = config.ClusterClick(feature, layer);
                  if (out)
                    return layer.bindPopup(out);
                }
                map.fitBounds(layer.getBounds());
              });

              layer.setStyle(style.default);

              var bounds = layer.getBounds();
              var lat = (bounds._northEast.lat + bounds._southWest.lat) / 2;
              var lng = (bounds._northEast.lng + bounds._southWest.lng) / 2;
              var circle = L.circleMarker(L.latLng(lat, lng), {
                radius: zoom * 3
              });
              circle.bindTooltip(`<b>${feature.properties.count}</b>`, { permanent: true, direction: "center", className: 'count' });
              countLayer.addLayer(circle);
            } else {
              layer.on('click', function () {
                if (config.MarkerClick) return config.MarkerClick(feature, layer);
              });

              layer.on('mouseover', function () {
                if (config.MarkerMouseOver) return config.MarkerMouseOver(feature, layer);
              });

              layer.bindPopup(`<b>${JSON.stringify(feature.properties)}</b>`);
            }
          };

          var pointToLayer = function (feature: any, latlng: any) {
            //Marker coloring
            var marker = L.marker(latlng, { icon: typeof config.MarkerStyle == 'function' ? textToMarker(config.MarkerStyle(feature)) : typeof config.MarkerStyle == 'string' ? textToMarker(config.MarkerStyle) : new L.Icon.Default() });
            return marker;
          }

          map.on('layeradd', function () {
            //Remove callback
            map.off('layeradd');
            countLayer = L.layerGroup();
            this.addLayer(countLayer);
            var bounds = map.getBounds();
            mapInterface.getLayerData(map.getZoom(), [bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat]).then((geojson: any) => {
              var geoJsonLayer = L.geoJSON(geojson, {
                onEachFeature,
                pointToLayer,
                style: config.ClusterStyle
              });
              layers.push(geoJsonLayer);
              this.addLayer(geoJsonLayer);
            });
          });


          map.on('moveend', function (e: any) {
            if (zoom != map.getZoom()) {
              zoom = map.getZoom();
            }
            clearCluster = true;
            var bounds = map.getBounds();
            mapInterface.getLayerData(map.getZoom(), [bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat]).then((geojson: any) => {
              var geoJsonLayer = L.geoJSON(geojson, {
                onEachFeature,
                pointToLayer,
                style: config.ClusterStyle
              });
              layers.forEach((layer: any) => {
                layer.remove();
              });
              layers.push(geoJsonLayer);
              this.addLayer(geoJsonLayer);
            });
          });
        }
      });
    },

  });

  (L as any).stam = function (config: Config) {
    return new (L as any).Stam(config);
  }

  //Adding custom css to head, so that the count tooltipp's background is transparent
  var css = '.leaflet-tooltip.count {background-color: transparent;border: transparent;  box-shadow: none;  font-weight: bold;font-size: 20px;}',
    head = document.head || document.getElementsByTagName('head')[0],
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

if (typeof ol != "undefined") {

  //Since ol 6 ol.inherits was removed
  var ol_ext_inherits = function (child: any, parent: any) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
  };

  var zoom: number;
  //Contains all layers that where added by the library, this.getLayers() returns all layers
  var olLayers: any = [];

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

    //Add listener to moveend, called when moving and zooming;
    olmap.on("moveend", function () {
      //Check if zoom level was changed
      if (zoom != olmap.getView().getZoom()) {
        zoom = olmap.getView().getZoom().toFixed(0);
      }

      //always add new layer, because the geojson is cached inside MapInterface.ts
      addSTAMLayer(config, mapInterface, zoom).then(function (layer: any) {
        this.getLayers().array_.push(layer);

        this.changed();

        this.getLayers().array_ = this.getLayers().array_.filter(function (layer: any) {
          if (olLayers.indexOf(layer) != -1) {
            return false;
          }
          return true;
        }.bind(this));

        olmap.render();

        olLayers = [];

        olLayers.push(layer);


      }.bind(this));
    });
  };
  ol_ext_inherits(ol_layer_stam, ol.layer.Group);

  ol.layer.STAM = ol_layer_stam
}
function addSTAMLayer(config: Config, mapInterface: MapInterface, zoom: number) {
  return new Promise(function (resolve, reject) {
    var bounds;
    if (olmap.getView().getProjection().code_ == "EPSG:4326")
      bounds = olmap.getView().calculateExtent();
    else {
      var zw = olmap.getView().calculateExtent();
      var code = olmap.getView().getProjection().getCode();
      bounds = [];
      bounds.push(...(new ol.geom.Point([zw[2], zw[3]])).transform(code, 'EPSG:4326').getCoordinates());
      bounds.push(...(new ol.geom.Point([zw[0], zw[1]])).transform(code, 'EPSG:4326').getCoordinates());
    }


    mapInterface.getLayerData(zoom, bounds).then((data: any) => {

      console.log(data);

      var vectorSource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" }),
      });



      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
      });

      resolve(vectorLayer);
    });
  });
}

