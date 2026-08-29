import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "stam-leaflet": "src/leaflet.ts",
    "stam-openlayers": "src/openlayers.ts",
  },
  platform: "browser",
  deps: {
    onlyBundle: false,
    //Bundled, so the dynamic import of MapInterface becomes a chunk of its own
    alwaysBundle: ["mqtt"],
    neverBundle: ["leaflet", "ol/*"],
    //The declarations import from `mqtt` instead of inlining its type tree
    dts: { neverBundle: ["mqtt"] },
  },
  sourcemap: true,
});
