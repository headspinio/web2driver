const webpack = require('webpack');
const _ = require('lodash');
const path = require('path');
const base = require('./webpack.config.base');

const testConfig = _.cloneDeep(base);

testConfig.entry[testConfig.entry.length - 1] = './test/index.js';
testConfig.mode = 'development';
testConfig.devtool = 'inline-source-map';
testConfig.output = {
  filename: 'test.js',
  path: path.resolve(__dirname, 'dist')
};
testConfig.module.rules.unshift({
  test: /test.*\.js$/,
  use: 'mocha-loader',
  exclude: /node_modules/
});

module.exports = testConfig;
