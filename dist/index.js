"use strict";
//OpenLayers
//Leaflet
(function () {
    L.Stm = L.TileLayer.extend({
        getTileUrl: function () {
            var i = Math.ceil(Math.random() * 4);
            return "https://placekitten.com/256/256?image=" + i;
        },
        getAttribution: function () {
            return "<a href='https://placekitten.com/attribution.html'>PlaceKitten</a>";
        }
    });
    L.stm = function () {
        return new L.Stm();
    };
})();
