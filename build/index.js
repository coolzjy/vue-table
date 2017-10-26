const cp = require('cp')
const rollup = require('rollup');
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const uglify = require('rollup-plugin-uglify')

;(async () => {
  const inputOptions = {
    input: './src/index.js',
    external: ['vue'],
    plugins: [
      babel(),
      resolve(),
      commonjs()
    ]
  }

  const cjsOutputOptions = {
    file: './dist/index.common.js',
    format: 'cjs'
  }

  const esOutputOptions = {
    file: './dist/index.esm.js',
    format: 'es'
  }

  const iifeOutputOptions = {
    file: './dist/index.min.js',
    format: 'iife',
    name: 'VueTable',
    globals: { vue: 'Vue' }
  }

  const bundle = await rollup.rollup(inputOptions)
  await bundle.write(cjsOutputOptions)
  await bundle.write(esOutputOptions)

  inputOptions.plugins.push(uglify())

  const minBundle = await rollup.rollup(inputOptions)
  await minBundle.write(iifeOutputOptions)

  cp.sync('./src/index.css', './dist/index.css')
  cp.sync('./src/theme.css', './dist/theme.css')
})()
