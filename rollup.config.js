import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.version': JSON.stringify(''),
    }),
    json(),
    resolve({
      mainFields: ['module', 'main'],
    }),
    commonjs(),
  ],
  // UMD fallback for `react` is the global variable `React`.
  external: ['react'],
  output: {
    globals: {
      react: 'React',
    },
  },
};
