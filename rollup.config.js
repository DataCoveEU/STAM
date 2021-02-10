import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import fs from 'fs';
import path from 'path';
import cleanup from 'rollup-plugin-cleanup';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { terser } from "rollup-plugin-terser";


const extensions = [
    '.js', '.jsx', '.ts', '.tsx'
];

export default {
    input: './src/index.ts',
    plugins: [
        commonjs(),
        nodeResolve({ preferBuiltins: true, extensions }),
        json(),
        nodePolyfills(),
        cleanup({
            'comments': 'none'
        }),
        replace({
            'leaflet-realtime': () => `";${fs.readFileSync(path.join(__dirname, "node_modules/leaflet-realtime/dist/leaflet-realtime.js")).toString()}"`,
            delimiters: ['', '']
        }),
        babel({
            babelHelpers: 'inline',
            extensions
        }),
        terser()
    ],
    output: {
        sourcemap: true,
        file: './dist/stam.min.js',
        format: 'umd',
        name: 'bundle'
    }
}