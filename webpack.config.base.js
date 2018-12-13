const path = require('path');

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
  },
  resolve: {
    symlinks: false,
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
    module: "empty",
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
