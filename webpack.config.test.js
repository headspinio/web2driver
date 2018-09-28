const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './test/index.js',
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
      }
    ]
  }
};
