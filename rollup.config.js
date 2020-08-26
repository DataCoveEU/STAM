import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import typescript from 'rollup-plugin-typescript2';


export default {
    input: './src/index.ts',
    plugins: [
        commonjs(),
        nodeResolve({ preferBuiltins: true }),
        typescript(),
        //terser(),
        json(),
        nodePolyfills()
    ],
    output: {
        file: './dist/stam.min.js',
        format: 'iife',
        name: 'bundle'
    }
}