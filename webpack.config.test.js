const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: ['@babel/polyfill', './test/index.js'],
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
  },
  module: {
    rules: [
      {
        test: /test.*\.js$/,
        use: 'mocha-loader',
        exclude: /node_modules/
      },
      {
      test: /.m?js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        }
      }
    }
    ]
  }
};
