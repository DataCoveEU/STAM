
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

<script  src="https://raw.githubusercontent.com/DataCoveEU/STAM/master/dist/stam.min.js"></script>

```

### Features

#### Point

A GeoJson with an extra property named getData. 

getData is a object, the keys are the observedProperties and the values are async functions.


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
	//Called, with the feature as an argument, when a marker is clicked.
	markerClick?: Function,
	//Called, with the feature as an argument, when a cluster is hovered.
	clusterMouseOver?: Function,
	//Called, with the feature as an argument, when a cluster is clicked.
	clusterClick?: Function,
	//The instance of the openLayers map. Only necessary for openLayers. 
	map?: any
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

  

## Contributors ✨

  

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

  

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore-start -->

<!-- markdownlint-disable -->

<table>

<tr>

<td  align="center"><a  href="https://github.com/TobiasPressler"><img  src="https://avatars3.githubusercontent.com/u/47741525?v=4?s=100"  width="100px;"  alt=""/><br  /><sub><b>TobiasPressler</b></sub></a><br  /><a  href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler"  title="Code">💻</a>  <a  href="https://github.com/DataCoveEU/STAM/commits?author=TobiasPressler"  title="Documentation">📖</a></td>

</tr>

</table>

  

<!-- markdownlint-enable -->

<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

  

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome

##

MIT License

Copyright (c) 2020 DataCove e.U.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
