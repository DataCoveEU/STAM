import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import cleanup from "rollup-plugin-cleanup";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { fileURLToPath } from "url";
import typescript from "@rollup/plugin-typescript";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: "./src/index.ts",
  plugins: [
    nodePolyfills(),
    commonjs(),
    nodeResolve({ preferBuiltins: true, extensions }),
    json(),
    cleanup({
      comments: "none",
    }),
    typescript(),
  ],
  output: {
    sourcemap: true,
    file: "./dist/stam.min.js",
    format: "umd",
    name: "bundle",
  },
};
