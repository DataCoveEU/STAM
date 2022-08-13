
# STAM

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## 🧐 About <a name = "about"></a>

STAM (SensorThings API Map) is a JavaScript library for showing the Things/Features of interest of a SensorThings server on a Leaflet/OpenLayers map.

## Features

* Easy implementation of an exising SensorThings server into a map
* Leaflet and OpenLayers are supported
* Things and Features of interest are supported as spatial features

## 🏁 Getting Started <a name = "getting_started"></a>

### Prerequisites

* A website
* A OpenLayers or Leaflet map
* A SensorThings server url

### Installation

#### Integration with HTML

Include the js file in a script tag. This will expose the variable L.stam or ol.layer.STAM depending on the used map libary.

```html

<script  src="https://unpkg.com/sta-map@latest/dist/stam.min.js"></script>

```

### Spatial Features

#### Point

A GeoJson with an extra property named getData. 

getData is a object, the keys are the observedProperties and the values are async functions.

closePopup is a function, which, when called, closes the current popup.

These functions take a callback as a argument. The callback gets a predefined QueryObject as an argument, can change it and has to return it.

The function returns the data inside the value attribute. 

```js
var data = await feature.properties.getData['NO']((query)=>{
    query.filter = "phenomenonTime lt now()";
    query.resultFormat = 'dataArray';
    return query;
});
```

#### Cluster

GeoJSON with a property named 'count' with the Things/FeaturesOfInterest inside the cluster

### Config

The config is used to specify the style and behaviour of the displayed content
```js
{
	//Specify the range to plot. Offset OR endDate may be specified
	plot: {
		startDate: Date, //Starting date
		offset?: number, //Count of the observations to be plotted. Can be negative.
		endDate?: Date //End date to plot to
	},
	//Time in seconds to cache the data. Data is cached forever if null
	cachingDuration: number,
	//Enable mqtt support
	mqtt: boolean,
	//Defaults to true, if false no clustering is going to be applied
	cluster: boolean,
	//The minimal count of things in a cluster, so that a cluster is displayed
	clusterMin: number,
	//Can be a array of a ranges or directly a queryObject. Queries can be specified for given zoomlevels or ranges.
	queryObject: {
		entityType: string, //Entity type to Query. Can only be Things or FeaturesOfInterest
		filter?: string, //Filter
	}| Array<{
		//If a number, the query is used for only that zoom level
		zoomLevel: number | {
			from: number, //Must be specified, if to is not specified, the query is going to be used for every zoom level >= from
			to?: number //The highest zoom level the query should be used for
		},
		query: QueryObject //The query to be used
	}>,
	//The base url of the Sensorthings API
	baseUrl: string,
  //Specifies the color of the marker. The functions gets the geojson as a parameter and has to return the color. The function can be async.
  //Valid colors: green, black, blue, grey, violet, orange, red, yellow, gold
	markerStyle?: Function | string,
	//Used to style non-Point Locations or Features. Returns the style of the feature: https://leafletjs.com/reference.html#geojson
	polygonStyle?: Function,
	//Used to style the cluster. Can be a function that returns the second specified interface
	clusterStyle?: Function | {
	//Used to specify the style of the circle. 
	circle: { //Path interface
				color: string, //Border color
				weight: number, //Weight of the borders
				opacity: number, //The border's opacity
				fillColor: string,
				fillOpacity: number,
	},
	polygon: {
				hover: Path, //The style of the polygon when the curser hovers over it
				default: Path //The default style
			}
	},
	//Called, with the feature as an argument, when a marker is hovered.
	markerMouseOver?: Function,
	//Called, when a popup has been closed with the given feature of the marker
	popupClose?: Function,
	//Called, with the feature as an argument, when a marker is clicked. If the function returns a string, it is added into the popup.
	markerClick?: Function,
	//Called, with the feature as an argument, when a cluster is hovered.
	clusterMouseOver?: Function,
	//Called, with the feature as an argument, when a cluster is clicked.
	clusterClick?: Function,
	//The instance of the openLayers map. Only necessary for openLayers. 
	map?: any,
	fetchOptions?: RequestInit, //fetch request options. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
	queryParameters?: Map<String,String> //Parameters which shall be added to every request in the URL
}
```  

### Usage

#### Leaflet

```js
L.stam(config)
```

#### OpenLayers

```js
new  ol.layer.STAM(config)
```

### MQTT

MQTT support has been implemented and can be activated by setting the mqtt flag in the config.
To use MQTT functionalities, the corresponding client library has to be included.

```js
<script src="https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js"></script>
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/TobiasPressler"><img src="https://avatars3.githubusercontent.com/u/47741525?v=4?s=100" width="100px;" alt=""/><br /><sub><b>TobiasPressler</b></sub></a><br /><a href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler" title="Code">💻</a> <a href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/hylkevds"><img src="https://avatars2.githubusercontent.com/u/4989461?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hylke van der Schaaf</b></sub></a><br /><a href="https://github.com/DataCoveEU/STAM/commits?author=hylkevds" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

  

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome

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

