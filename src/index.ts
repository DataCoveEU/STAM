import { STAInterface } from './STAInterface/STAInterface';
import { MapInterface } from './MapInterface/MapInterface';


declare var L: any;

export interface QueryObject {
  [key: string]: Array<String> | String | Array<QueryObject> | Number | Boolean,
  entityType: String,
  filter?: String,
  select?: Array<String>,
  expand?: Array<QueryObject>
  top?: Number,
  skip?: Number,
  count?: Boolean
}

export interface Config {
  queryObject: QueryObject;
  baseUrl: String
}

//Leaflet
if (L !== undefined) {


  (L as any).Stam = L.LayerGroup.extend({
    initialize: function (config: Config) {
      var mapInterface = new MapInterface(config);
      this.on('add', function () {
        if (this._map != undefined) {
          var map = this._map;

          map.on('layeradd', function () {
            //Remove callback
            map.off('layeradd');
            var bounds = map.getBounds();
            var data = mapInterface.getLayerData(map.getZoom(), [bounds._northEast.lng, bounds._northEast.lat, bounds._southWest.lng, bounds._southWest.lat]).then((data: any) => {
              this.addLayer(
                L.geoJSON(data)
              );
            });

            //Add first layer for the given zoom level
            this.addLayer(

              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              })
            );
          });
          //add Layer for start zoom level

          var zoom = map.getZoom();
          map.on('moveend', function (e: any) {
            if (map.getZoom() != zoom) {
              zoom = map.getZoom();
              console.log(map.getZoom());
            }
          });
        }
      });
    },

  });

  (L as any).stam = function () {
    return new (L as any).Stam(<Config>{
      baseUrl: "https://airquality-frost.docker01.ilt-dmz.iosb.fraunhofer.de/v1.1",
      queryObject: <QueryObject>{
        count: true,
        skip: 0,
        entityType: 'Things',
        filter: null,
        select: null,
        expand: null,
        top: 0
      }
    });
  }
}

/*
class STAM {
  queryObject: Object;
  constructor(config: Config) {
    this.queryObject = config.queryObject;
  }

  getOlLayer() {
    var geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [0, 0]
        }
      }, {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [[4e6, -2e6], [8e6, 2e6]]
        }
      }, {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [[4e6, 2e6], [8e6, -2e6]]
        }
      }, {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
        }
      }, {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiLineString',
          'coordinates': [
            [[-1e6, -7.5e5], [-1e6, 7.5e5]],
            [[1e6, -7.5e5], [1e6, 7.5e5]],
            [[-7.5e5, -1e6], [7.5e5, -1e6]],
            [[-7.5e5, 1e6], [7.5e5, 1e6]]
          ]
        }
      }, {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiPolygon',
          'coordinates': [
            [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
            [[[-2e6, 6e6], [-2e6, 8e6], [0, 8e6], [0, 6e6]]],
            [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6], [3e6, 6e6]]]
          ]
        }
      }, {
        'type': 'Feature',
        'geometry': {
          'type': 'GeometryCollection',
          'geometries': [{
            'type': 'LineString',
            'coordinates': [[-5e6, -5e6], [0, -5e6]]
          }, {
            'type': 'Point',
            'coordinates': [4e6, -5e6]
          }, {
            'type': 'Polygon',
            'coordinates': [[[1e6, -6e6], [2e6, -4e6], [3e6, -6e6]]]
          }]
        }
      }]
    };

    var vectorSource = new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
    });

    vectorSource.addFeature(new ol.Feature(new ol.geom.Circle([5e6, 7e6], 1e6)));

    var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
    });

    return vectorLayer;
  }

  //Leaflet function
  addTo(map: any) {
    var layer = L.TileLayer.extend({
      getTileUrl: function () {
        var i = Math.ceil(Math.random() * 4);
        return "https://placekitten.com/256/256?image=" + i;
      },
      getAttribution: function () {
        return "<a href='https://placekitten.com/attribution.html'>PlaceKitten</a>"
      }
    });
    var x = new layer();
    (new layer()).addTo(map);
  }
}
//OpenLayers

 */