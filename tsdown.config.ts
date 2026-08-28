import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "stam-leaflet": "src/leaflet.ts",
    "stam-openlayers": "src/openlayers.ts",
  },
  platform: "browser",
  deps: {
    onlyBundle: false,
    neverBundle: ["leaflet", "ol/*"],
  },
  sourcemap: true,
});
