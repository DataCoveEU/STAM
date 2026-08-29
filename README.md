# STAM

[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)

STAM (SensorThings API Map) displays `Things` or `FeaturesOfInterest` from an OGC SensorThings API service on a Leaflet or OpenLayers map. It loads spatial features for the current map view, clusters dense areas, caches fetched data, and can receive MQTT updates.

## Requirements

- A SensorThings API endpoint.
- A browser map created with Leaflet or OpenLayers.
- The corresponding map library loaded as a browser global: `L` for Leaflet or `ol` for OpenLayers.

The generated bundles externalize Leaflet and OpenLayers. Load the matching library and its CSS before creating a STAM layer.

## Installation

```sh
pnpm add sta-map
```

The package exposes two browser bundles:

```js
import { STAM } from "sta-map/leaflet";
import { STAM } from "sta-map/openlayers";
```

For direct browser imports, use the published files at `dist/stam-leaflet.js` and `dist/stam-openlayers.js`.

## Leaflet

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script type="module">
  import { STAM } from "https://unpkg.com/sta-map@latest/dist/stam-leaflet.js";

  const map = L.map("map").setView([50.27, 7.26], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  STAM({
    baseUrl: "https://example.com/v1.1",
    queryObject: { entityType: "Things" },
    cluster: true,
    clusterMin: 5,
  }).addTo(map);
</script>
```

`STAM()` returns a Leaflet layer. Add it to the map with `.addTo(map)`.

## OpenLayers

```js
import { STAM } from "sta-map/openlayers";

const map = new ol.Map({
  target: "map",
  layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
  view: new ol.View({ center: [808701, 6493627], zoom: 8 }),
});

map.addLayer(
  new STAM({
    baseUrl: "https://example.com/v1.1",
    queryObject: { entityType: "Things" },
    cluster: true,
    clusterMin: 5,
    map,
  }),
);
```

The OpenLayers bundle expects the global `ol` build and the map instance in `config.map`.

## Configuration

| Option                  | Description                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`               | Base URL of the SensorThings API service.                                                                                                |
| `queryObject`           | A query object or zoom-based array of `{ zoomLevel, query }` entries. Supported entity types are `Things` and `FeaturesOfInterest`.      |
| `cluster`               | Enables clustering. Defaults to enabled when omitted.                                                                                    |
| `clusterMin`            | Minimum feature count for a cluster to remain displayed.                                                                                 |
| `cachingDuration`       | Cache lifetime in seconds. A falsy value keeps cached data indefinitely.                                                                 |
| `plot`                  | Observation range used by the default popup: `{ startDate, offset?, endDate? }`.                                                         |
| `markerStyle`           | Marker color string or function. Supported colors are `green`, `black`, `blue`, `grey`, `violet`, `orange`, `red`, `yellow`, and `gold`. |
| `polygonStyle`          | Style for non-point spatial features.                                                                                                    |
| `clusterStyle`          | Circle and polygon styles for clusters, or a function returning them.                                                                    |
| `fetchOptions`          | Options passed to `fetch` for SensorThings requests.                                                                                     |
| `maxConcurrentRequests` | Requests sent per `requestDelay`. Without a delay the requests are not limited. Defaults to 5.                                           |
| `requestDelay`          | Milliseconds between two waves of requests. Each wave sends up to `maxConcurrentRequests`. Defaults to 0.                                |
| `debounceDuration`      | Milliseconds the map has to be still before its data is requested. Defaults to 200.                                                      |
| `queryParameters`       | `Map<string, string>` appended to every generated request URL.                                                                           |
| `mqtt`                  | Enables MQTT updates. `true` uses the defaults derived from `baseUrl`, an object configures them. See [MQTT](#mqtt).                     |
| `map`                   | Required by the OpenLayers bundle; ignored by Leaflet.                                                                                   |

Callbacks are available for marker and cluster hover/click events, and for popup close events. A `markerClick` callback may return HTML for the popup. The default popup can request observations through the feature's generated data callbacks:

```js
const observations = await feature.properties.getData[0].getData((query) => {
  query.resultFormat = "dataArray";
  query.orderby = "phenomenonTime asc";
  return query;
});
```

## MQTT

Set `mqtt: true`. STAM ships [MQTT.js](https://github.com/mqttjs/MQTT.js) and loads it as a separate
chunk the first time a map enables MQTT, so pages without MQTT never download it.

STAM then connects to `wss://<host of baseUrl>/mqtt` and subscribes to `<last segment of baseUrl>/<entityType>`,
e.g. `v1.1/Things`. Updates are applied to the matching cached features.

Services that deviate from those defaults are configured with an object instead:

```js
STAM({
  baseUrl: "https://sensor.example/v1.1",
  queryObject: { entityType: "Things" },
  mqtt: {
    url: "wss://broker.example:8884/mqtt",
    options: { username: "sta", password: "secret", clientId: "stam-map" },
    topicPrefix: "sta/v1.1",
  },
});
```

| Option        | Description                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | Websocket endpoint of the broker. Defaults to `wss://<host of baseUrl>/mqtt`, `ws` for an http `baseUrl`.                                    |
| `options`     | Passed to the client's `connect`, typed as the `IClientOptions` of MQTT.js.                                                                  |
| `topicPrefix` | Prefix the entity type is appended to. Defaults to the last path segment of `baseUrl`. Ignored when `topics` is set.                         |
| `topics`      | Topics to subscribe to, replacing the derived `<topicPrefix>/<entityType>`. Either an array or a callback receiving the current entity type. |
| `client`      | A connected client, or a `connect` function. Defaults to the bundled MQTT.js.                                                                |

`MqttClient` and `IClientOptions` are re-exported from the bundles, so a page can type its own client
without importing `mqtt` itself. With `client` the page controls the connection, and the bundled client
is never loaded:

```js
import mqtt from "mqtt";

STAM({
  baseUrl: "https://sensor.example/v1.1",
  queryObject: { entityType: "Things" },
  mqtt: { client: mqtt.connect("wss://broker.example/mqtt", { username: "sta" }) },
});
```

## Development

```sh
pnpm install
pnpm dev
```

The development server watches the bundles and serves the Leaflet example at `http://localhost:3000/`. Run `pnpm test`, `pnpm typecheck`, and `pnpm build` for verification.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TobiasPressler"><img src="https://avatars3.githubusercontent.com/u/47741525?v=4?s=100" width="100px;" alt="TobiasPressler"/><br /><sub><b>TobiasPressler</b></sub></a><br /><a href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler" title="Code">💻</a> <a href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hylkevds"><img src="https://avatars2.githubusercontent.com/u/4989461?v=4?s=100" width="100px;" alt="Hylke van der Schaaf"/><br /><sub><b>Hylke van der Schaaf</b></sub></a><br /><a href="https://github.com/DataCoveEU/STAM/commits?author=hylkevds" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://allcontributors.org/) specification. Contributions of any kind are welcome.

## License

BSD 2-Clause License

Copyright (c) 2020, DataCove e.U.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
