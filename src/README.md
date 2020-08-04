# description

This file describes the task of every file

## index.js

Implementing STAM for OpenLayers and Leaflet and adding them to the global variable, depending if they are installed. The data is added to the map via GeoJSON layers. When a user moves the map or zooms, a new GeoJSON layer is added and the old is removed. This is possible because of the caching of the server data inside the MapInterface.

## QueryGenerator

This class converts a QueryObject into a link.

## MapInterface

If new data is requested, when the view changed, the getLayerData method is called. It gets the bounding box of the OSM tiles that the current view's bounding box intersects with. The cached tiles are removed from this bounding box, and the resulting polygon is used to query all things or features of interest that intersect, with the use of the STAInterface. Then the things are grouped into the corresponding OSM tiles and if a tile has less than the configured count of things, markers are displayed for the things. If there are more than configured things, polygons with the size and position of the OSM tiles are added to the GeoJSON collection with the markers and are returned with the other cached markers and polygons.

## STAInterface

Is used for querying a sensorthings server that may return 'next' links

## laeflet/markers.ts

This file contains the definition of 8 different colored markers for Leaflet.