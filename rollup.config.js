import typescript from 'rollup-plugin-typescript2';
import {
    uglify
} from "rollup-plugin-uglify";
import {
    nodeResolve
} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
    input: './src/index.ts',
    plugins: [
        commonjs(),
        nodeResolve(),
        typescript( /*{ plugin options }*/ ),
        uglify(),
        json()
    ],
    output: {
        file: './dist/stam.min.js',
        format: 'iife',
        name: 'bundle'
    }
}