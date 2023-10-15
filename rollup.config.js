import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/TextPolygon.js',
  output: [
    {
      file: 'dist/TextPolygon.esm.js',
      format: 'esm',
      exports: 'named',
      sourcemap: true,
      name: 'TextPolygon',
      globals: {
        leaflet: 'L'
      }
    },
    {
      file: 'dist/TextPolygon.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      name: 'TextPolygon',
      globals: {
        leaflet: 'L'
      }
    },
    {
      file: 'dist/TextPolygon.umd.js',
      format: 'umd',
      exports: 'named',
      sourcemap: true,
      name: 'TextPolygon',
      globals: {
        leaflet: 'L'
      }
    }
  ],
  external: ['leaflet'],
  plugins: [
    resolve(),
    commonjs(),
    terser()
  ]
};