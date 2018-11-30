const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: ['@babel/polyfill', './test/index.js'],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
  },
  module: {
    rules: [{
      test: /.m?js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        }
      }
    }]
  }
};
