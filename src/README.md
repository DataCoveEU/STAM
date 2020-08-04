# Description

This file describes the task of every file

## index.js

Implementing STAM for OpenLayers and Leaflet and adding them to the global variable, depending if they are installed. The data is added to the map via GeoJSON layers.
## QueryGenerator

This class converts a QueryObject into a link.

## MapInterface

If new data is requested, the getLayerData method is called. It gets the count for every OSM tile inside the view, If the count is below a given value, all things inside the tile are queried. Every time a value is added to the cache, a 'change' event is emitted, with the whole feature collection for the zoom level. 

## STAInterface

Is used for querying a sensorthings server that may return 'next' links

## laeflet/markers.ts

This file contains the definition of 8 different colored markers for Leaflet.
