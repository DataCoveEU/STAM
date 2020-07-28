import { STAInterface } from './STAInterface';
import { MapInterface } from './MapInterface';
import { marker, map } from 'leaflet';
import { colorMarkers, textToMarker } from './leaflet/markers';
import { color } from 'openlayers';


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

          var first: number;


          var onEachFeature = (feature: any, layer: any) => {
            if (first != zoom) { countLayer.clearLayers(); first = zoom; }
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

          var map = this._map;

          map.on('layeradd', function () {
            //Remove callback
            map.off('layeradd');
            countLayer = L.layerGroup();
            this.addLayer(countLayer);
            var bounds = map.getBounds();
            mapInterface.getLayerData(map.getZoom(), [bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat]).then((data: any) => {
              var l = L.geoJSON(data, {
                onEachFeature,
                pointToLayer,
                style: config.ClusterStyle
              });
              layers.push(l);
              this.addLayer(l);
            });
          });
          //add Layer for start zoom level

          var zoom = map.getZoom();
          map.on('moveend', function (e: any) {
            if (zoom != map.getZoom()) {
              zoom = map.getZoom();
            }
            var bounds = map.getBounds();
            mapInterface.getLayerData(map.getZoom(), [bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat]).then((data: any) => {
              var l = L.geoJSON(data, {
                onEachFeature,
                pointToLayer,
                style: config.ClusterStyle
              });
              layers.forEach((layer: any) => {
                layer.remove();
              });
              layers.push(l);
              this.addLayer(l);
            });
          });
        }
      });
    },

  });

  (L as any).stam = function (config: Config) {
    return new (L as any).Stam(config);
  }

  //Adding custom css to head
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
  var ol_ext_inherits = function (child: any, parent: any) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
  };

  var ol_layer_stam = function (config: Config) {
    ol.layer.Group.call(this, config);

    var mapInterface = new MapInterface(config);

    var bounds;
    if (config.map.getView().getProjection().code_ == "EPSG:4326")
      bounds = config.map.getView().calculateExtent();
    else {
      var zw = config.map.getView().calculateExtent();
      bounds = [];
      bounds.push(...ol.proj.toLonLat([zw[2], zw[3]]));
      bounds.push(...ol.proj.toLonLat([zw[0], zw[1]]));
    }

    console.log(bounds);


    mapInterface.getLayerData(8, bounds).then((data: any) => {

      var vectorSource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" }),
      });



      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
      });

      config.map.addLayer(vectorLayer);

      // this.getLayers().array_.push(vectorLayer);
    });
  };
  ol_ext_inherits(ol_layer_stam, ol.layer.Group);

  ol.layer.STAM = ol_layer_stam
}
