import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: {
        'stam-leaflet': 'src/leaflet.ts',
        'stam-openlayers': 'src/openlayers.ts',
    },
    platform: 'browser',
    external: ['leaflet', 'ol/*'],
    sourcemap: true,
    //minify: true,
})
