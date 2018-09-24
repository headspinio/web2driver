const webpack = require('webpack');
const path = require('path');
let plugins = [];

plugins.push(
  new webpack.IgnorePlugin(/source-map-support/)
);

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
  },
  plugins
};
