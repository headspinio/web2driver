const webpack = require('webpack');
const _ = require('lodash');
const path = require('path');
const base = require('./webpack.config.base');

const testConfig = _.cloneDeep(base);

testConfig.entry[testConfig.entry.length - 1] = './test/index.js';
testConfig.mode = 'development';
testConfig.devtool = 'inline-source-map';
testConfig.output.filename = 'test.js';
testConfig.module.rules.unshift({
  test: /test.*\.js$/,
  loader: 'mocha-loader',
  exclude: /node_modules/
});

module.exports = testConfig;
