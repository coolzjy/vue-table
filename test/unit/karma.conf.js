var path = require('path')
var webpackConfig = require('../../build/webpack.dev.conf')
var webpack = require('webpack')

delete webpackConfig.entry
webpackConfig.devtool = 'inline-source-map'

module.exports = function (config) {
  config.set({
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    frameworks: ['mocha', 'chai', 'sinon'],
    browsers: ['PhantomJS'],
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      dir: path.join(__dirname, './coverage'),
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
