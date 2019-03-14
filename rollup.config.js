import { terser } from "rollup-plugin-terser";

const input = 'index.js';

export default [
  {
    input,
    output: {
      file: `dist/workly.js`,
      format: 'iife',
      name: 'workly'
    },
    plugins: [terser()]
  },
  {
    input,
    output: {
      file: `dist/workly.umd.js`,
      format: 'umd',
      name: 'workly'
    },
    plugins: [terser()]
  },
  {
    input,
    output: {
      file: `dist/workly.m.js`,
      format: 'esm'
    },
    plugins: [terser()]
  },
];