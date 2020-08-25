import typescript from 'rollup-plugin-typescript2';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import {
    terser
} from "rollup-plugin-terser";

import {
    nodeResolve
} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
    input: './src/index.ts',
    plugins: [
        commonjs(),
        nodeResolve({ preferBuiltins: true }),
        typescript(),
        terser(),
        json(),
        nodePolyfills()
    ],
    output: {
        file: './dist/stam.min.js',
        format: 'iife',
        name: 'bundle'
    }
}