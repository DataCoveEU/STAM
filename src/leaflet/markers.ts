const assetUrl = (name: string) => new URL(`https://raw.githubusercontent.com/DataCoveEU/STAM/refs/heads/main/src/leaflet/markers/${name}`, import.meta.url).href;
const blackIconUrl = assetUrl("marker-icon-2x-black.png");
const blueIconUrl = assetUrl("marker-icon-2x-blue.png");
const goldIconUrl = assetUrl("marker-icon-2x-gold.png");
const greenIconUrl = assetUrl("marker-icon-2x-green.png");
const greyIconUrl = assetUrl("marker-icon-2x-grey.png");
const orangeIconUrl = assetUrl("marker-icon-2x-orange.png");
const redIconUrl = assetUrl("marker-icon-2x-red.png");
const violetIconUrl = assetUrl("marker-icon-2x-violet.png");
const yellowIconUrl = assetUrl("marker-icon-2x-yellow.png");
const shadowUrl = assetUrl("marker-shadow.png");

let colorMarkers: any = null;

if (typeof L != 'undefined') {
    colorMarkers = {
        blueIcon: new L.Icon({
            iconUrl: blueIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        goldIcon: (new L.Icon({
            iconUrl: goldIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })),
        redIcon: (new L.Icon({
            iconUrl: redIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })),
        greenIcon: (new L.Icon({
            iconUrl: greenIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })),
        orangeIcon: new L.Icon({
            iconUrl: orangeIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        yellowIcon: new L.Icon({
            iconUrl: yellowIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        violetIcon: new L.Icon({
            iconUrl: violetIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        greyIcon: new L.Icon({
            iconUrl: greyIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        blackIcon: new L.Icon({
            iconUrl: blackIconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }
}


export function textToMarker(color: string) {
    switch (color) {
        case "green": return colorMarkers.greenIcon;
        case "black": return colorMarkers.blackIcon;
        case "blue": return colorMarkers.blueIcon;
        case "grey": return colorMarkers.greyIcon;
        case "violet": return colorMarkers.violetIcon;
        case "yellow": return colorMarkers.yellowIcon;
        case "red": return colorMarkers.redIcon;
        case "orange": return colorMarkers.orangeIcon;
        case "gold": return colorMarkers.goldIcon;
        default: return new L.Icon.Default()
    }
}
