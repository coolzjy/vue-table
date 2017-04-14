var cp = require('cp')
var rollup = require('rollup');
var babel = require('rollup-plugin-babel')
var resolve = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs')
var uglify = require('rollup-plugin-uglify')

rollup.rollup({
  entry: './src/index.js',
  external: ['vue'],
  plugins: [
    babel(),
    resolve(),
    commonjs()
  ]
}).then(function (bundle) {
  bundle.write({
    format: 'cjs',
    dest: './dist/index.common.js'
  })

  bundle.write({
    format: 'es',
    dest: './dist/index.esm.js'
  })

  cp.sync('./src/index.css', './dist/index.css')
  cp.sync('./src/theme.css', './dist/theme.css')
})

rollup.rollup({
  entry: './src/index.js',
  external: ['vue'],
  plugins: [
    babel(),
    resolve(),
    commonjs(),
    uglify()
  ]
}).then(function (bundle) {
  bundle.write({
    format: 'iife',
    moduleName: 'VueTable',
    globals: { vue: 'Vue' },
    dest: './dist/index.min.js'
  })
})
