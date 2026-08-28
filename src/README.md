# Source Layout

- `leaflet.ts` exports the Leaflet browser bundle.
- `openlayers.ts` exports the OpenLayers browser bundle.
- `MapInterface.ts` handles SensorThings tile queries, clustering, caching, and MQTT updates.
- `STAInterface.ts` builds SensorThings requests and follows `@iot.nextLink` pagination.
- `QueryGenerator.ts` converts query objects into SensorThings URL paths.
- `leaflet/markers.ts` defines the supported Leaflet marker colors.
