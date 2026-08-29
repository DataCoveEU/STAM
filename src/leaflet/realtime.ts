import type { FeatureCollection, GeoJsonFeature } from "../types";

/** A layer the plugin created for a feature */
type FeatureLayer = L.Layer & {
  setLatLng?: (latlng: L.LatLng) => void;
  setLatLngs?: (latlngs: unknown) => void;
  setStyle?: (style: unknown) => void;
  feature?: GeoJsonFeature;
};

/** What the plugin hands to its update event */
type FeatureMap = Record<string, GeoJsonFeature>;

if (typeof L !== "undefined") {
  L.Realtime = L.Layer.extend({
    options: {
      start: true,
      interval: 60 * 1000,
      getFeatureId: function (f: GeoJsonFeature) {
        return f.properties.id;
      },
      updateFeature: function (feature: GeoJsonFeature, oldLayer: FeatureLayer | undefined) {
        if (!oldLayer) {
          return;
        }

        const type = feature.geometry && feature.geometry.type;
        const coordinates = feature.geometry && feature.geometry.coordinates;
        switch (type) {
          case "Point":
            oldLayer.setLatLng!(L.GeoJSON.coordsToLatLng(coordinates as [number, number]));
            break;
          case "LineString":
          case "MultiLineString":
            oldLayer.setLatLngs!(
              L.GeoJSON.coordsToLatLngs(coordinates as Array<any>, type === "LineString" ? 0 : 1),
            );
            break;
          case "Polygon":
          case "MultiPolygon":
            oldLayer.setLatLngs!(
              L.GeoJSON.coordsToLatLngs(coordinates as Array<any>, type === "Polygon" ? 1 : 2),
            );
            break;
          default:
            return null;
        }
        return oldLayer;
      },
      logErrors: true,
      cache: false,
      removeMissing: true,
      onlyRunWhenAdded: false,
    },

    initialize: function (src: any, options: any) {
      L.setOptions(this, options);
      this._container = options.container || L.geoJson(null as any, options);

      if (typeof src === "function") {
        this._src = src;
      } else {
        this._fetchOptions = src && src.url ? src : { url: src };
        this._src = L.bind(this._defaultSource, this);
      }

      this._features = {};
      this._featureLayers = {};
      this._requestCount = 0;

      if (this.options.start && !this.options.onlyRunWhenAdded) {
        this.start();
      }
    },

    start: function () {
      if (!this._timer) {
        this._timer = setInterval(L.bind(this.update, this), this.options.interval);
        this.update();
      }

      return this;
    },

    stop: function () {
      if (this._timer) {
        clearTimeout(this._timer);
        delete this._timer;
      }

      return this;
    },

    isRunning: function () {
      return this._timer;
    },

    setUrl: function (url: string) {
      if (this._fetchOptions) {
        this._fetchOptions.url = url;
        this.update();
      } else {
        throw new Error("Custom sources does not support setting URL.");
      }
    },

    update: function (geojson?: FeatureCollection) {
      const requestCount = ++this._requestCount,
        checkRequestCount = L.bind(function (this: any, cb: any) {
          return L.bind(function (this: any) {
            if (requestCount === this._requestCount) {
              return cb.apply(this, arguments);
            }
          }, this);
        }, this) as any;
      let responseHandler, errorHandler;

      if (geojson) {
        this._onNewData(false, geojson);
      } else {
        responseHandler = L.bind(function (this: any, data: any) {
          this._onNewData(this.options.removeMissing, data);
        }, this);
        errorHandler = L.bind(this._onError, this);

        this._src(checkRequestCount(responseHandler), checkRequestCount(errorHandler));
      }

      return this;
    },

    remove: function (geojson?: FeatureCollection | GeoJsonFeature | Array<GeoJsonFeature>) {
      if (typeof geojson === "undefined") {
        return L.Layer.prototype.remove.call(this);
      }

      const features: Array<GeoJsonFeature> = Array.isArray(geojson)
          ? geojson
          : "features" in geojson
            ? geojson.features
            : [geojson],
        exit: FeatureMap = {};
      let i, len, fId;

      for (i = 0, len = features.length; i < len; i++) {
        fId = this.options.getFeatureId(features[i]);
        this._container.removeLayer(this._featureLayers[fId]);
        exit[fId] = this._features[fId];
        delete this._features[fId];
        delete this._featureLayers[fId];
      }

      this.fire("update", {
        features: this._features,
        enter: {},
        update: {},
        exit: exit,
      });

      return this;
    },

    getLayer: function (featureId: string | number) {
      return this._featureLayers[featureId];
    },

    getFeature: function (featureId: string | number) {
      return this._features[featureId];
    },

    getBounds: function () {
      const container = this._container;
      if (container.getBounds) {
        return container.getBounds();
      }

      throw new Error("Container has no getBounds method");
    },

    onAdd: function (map: L.Map) {
      map.addLayer(this._container);
      if (this.options.start) {
        this.start();
      }
    },

    onRemove: function (map: L.Map) {
      if (this.options.onlyRunWhenAdded) {
        this.stop();
      }

      map.removeLayer(this._container);
    },

    _onNewData: function (removeMissing: boolean, geojson: FeatureCollection) {
      const layersToRemove: Array<FeatureLayer> = [],
        enter: FeatureMap = {},
        update: FeatureMap = {},
        seenFeatures: FeatureMap = {};
      let i,
        len,
        feature,
        exit: FeatureMap = {};

      const handleData = L.bind(function (this: any, geojson: any) {
        const features = L.Util.isArray(geojson) ? geojson : geojson.features;
        if (features) {
          for (i = 0, len = features.length; i < len; i++) {
            // only add this if geometry or geometries are set and not null
            feature = features[i];
            if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
              handleData(feature);
            }
          }
          return;
        }

        const container = this._container;
        const options = this.options;

        if (options.filter && !options.filter(geojson)) {
          return;
        }

        const f = L.GeoJSON.asFeature(geojson);
        const fId = options.getFeatureId(f);
        const oldLayer = this._featureLayers[fId];

        let layer = this.options.updateFeature(f, oldLayer);
        if (!layer) {
          layer = L.GeoJSON.geometryToLayer(geojson, options);
          if (!layer) {
            return;
          }
          layer.defaultOptions = layer.options;
          layer.feature = f;

          if (options.onEachFeature) {
            options.onEachFeature(geojson, layer);
          }

          if (options.style && layer.setStyle) {
            layer.setStyle(options.style(geojson));
          }
        }

        layer.feature = f;
        if (container.resetStyle) {
          container.resetStyle(layer);
        }

        if (oldLayer) {
          update[fId] = geojson;
          if (oldLayer != layer) {
            layersToRemove.push(oldLayer);
            container.addLayer(layer);
          }
        } else {
          enter[fId] = geojson;
          container.addLayer(layer);
        }

        this._featureLayers[fId] = layer;
        this._features[fId] = seenFeatures[fId] = f;
      }, this) as any;

      handleData(geojson);

      if (removeMissing) {
        exit = this._removeUnknown(seenFeatures);
      }
      for (i = 0; i < layersToRemove.length; i++) {
        this._container.removeLayer(layersToRemove[i]);
      }

      this.fire("update", {
        features: this._features,
        enter: enter,
        update: update,
        exit: exit,
      });
    },

    _onError: function (err: unknown, msg: string) {
      if (this.options.logErrors) {
        console.warn(err, msg);
      }

      this.fire("error", {
        error: err,
        message: msg,
      });
    },

    _removeUnknown: function (known: FeatureMap) {
      let fId,
        removed: FeatureMap = {};
      for (fId in this._featureLayers) {
        if (!known[fId]) {
          this._container.removeLayer(this._featureLayers[fId]);
          removed[fId] = this._features[fId];
          delete this._featureLayers[fId];
          delete this._features[fId];
        }
      }

      return removed;
    },

    _bustCache: function (url: string) {
      return url + L.Util.getParamString({ _: new Date().getTime() }, url);
    },

    _defaultSource: function (
      responseHandler: (data: FeatureCollection) => void,
      errorHandler: (error: unknown) => void,
    ) {
      const fetchOptions = this._fetchOptions;
      let url = fetchOptions.url;

      url = this.options.cache ? url : this._bustCache(url);

      fetch(url, fetchOptions)
        .then(function (response) {
          return response.json();
        })
        .then(responseHandler)
        .catch(errorHandler);
    },
  });

  L.realtime = function (src, options) {
    return new L.Realtime(src, options);
  };
}
