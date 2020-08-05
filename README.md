# STAM
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## 🧐 About <a name = "about"></a>

STAM (SensorThings API Map) is a JavaScript library for showing the Things/Features of interest of a SensorThings server on a Leaflet/OpenLayers map.

## Features

* Easy implementation of an exising SensorThings server into a map
* Leaflet and OpenLayers are supported
* Things and Features of interest are supported

## 🏁 Getting Started <a name = "getting_started"></a>

### Prerequisites

* A website
* A OpenLayers or Leaflet map
* A SensorThings server url

### Installing

#### In browser

Download the [minified file](https://raw.githubusercontent.com/DataCoveEU/STAM/master/dist/stam.min.js), and include it in a script tag. This will expose the variable L.stam or ol.layer.STAM depending on the used map libary.

```html
<script src="https://raw.githubusercontent.com/DataCoveEU/STAM/master/dist/stam.min.js"></script>
```

### TypeScript

TypeScript is supported internally within each module, no installs required.

## Usage

### Leaflet

```js
L.stam({
    baseUrl: "https://airquality-frost.docker01.ilt-dmz.iosb.fraunhofer.de/v1.1",
    MarkerStyle: "yellow",
    clusterMin: 5,
    queryObject: {
        count: true,
        skip: 0,
        entityType: 'Things',
        filter: null,
        select: null,
        expand: null,
        top: 0
    }
})
```

### OpenLayers

```js
new ol.layer.STAM({
    baseUrl: "https://airquality-frost.docker01.ilt-dmz.iosb.fraunhofer.de/v1.1",
    MarkerStyle: "yellow",
    map,
    clusterMin: 5,
    queryObject: {
        count: true,
        skip: 0,
        entityType: 'Things',
        select: null,
        top: 20000
    }
})
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/TobiasPressler"><img src="https://avatars3.githubusercontent.com/u/47741525?v=4?s=100" width="100px;" alt=""/><br /><sub><b>TobiasPressler</b></sub></a><br /><a href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler" title="Code">💻</a> <a href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!