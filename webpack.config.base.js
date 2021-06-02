const path = require('path');

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs',
      name: 'Web2Driver',
    },
  },
  resolve: {
    symlinks: false,
    alias: {
      process: "process/browser",
    },
    fallback: {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      module: false,
      util: false,
      path: false,
      crypto: false,
      https: false,
      http: false,
      assert: false,
      stream: false,
      buffer: false,
      zlib: false,
    },
  },
  node: {
    global: true,
  },
  // uncomment to turn minification off
  //optimization: {
    //minimize: false,
  //},
  module: {
    rules: [{
      test: /.m?js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      }
    }]
  }
};
