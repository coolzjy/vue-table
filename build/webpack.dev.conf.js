var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './dev/index.js',
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index.js'
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.runtime.esm.js',
      '@': path.join(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [
          path.join(__dirname, '../src'),
          path.join(__dirname, '../test')
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: path.join(__dirname, '../node_modules')
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  devServer: {
    port: 8080,
    contentBase: path.join(__dirname, './dist')
  }
}
