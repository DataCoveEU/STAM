import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: {
        'stam-leaflet': 'src/leaflet.ts',
        'stam-openlayers': 'src/openlayers.ts',
    },
    platform: 'browser',
    deps: {
        neverBundle: ['leaflet', 'ol/*'],
    },
    sourcemap: true,
    //minify: true,
})
