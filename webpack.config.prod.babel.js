import { optimize } from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import path from 'path';

const config = require('./package.json');
const envVars = ["NODE_ENV"];

let { UglifyJsPlugin, DedupePlugin, CommonsChunkPlugin, OccurrenceOrderPlugin } = optimize;

const vendor = [
  "angular",
  "lodash",
  "angular-sanitize",
  "angular-animate"];

const uglifyConf = {
  sourceMap: false,
  compress: {
    dead_code: true,
    sequences: true,
    conditionals: true,
    booleans: true,
    loops: true,
    unused: true,
    hoist_funs: true,
    hoist_vars: true,
    if_return: true,
    join_vars: true,
    collapse_vars: true,
    drop_console: false,
    drop_debugger: true,
    warnings: false
  }
};

const commmonsConf = {
  name: "vendor",
  minChunk: Infinity
};

const htmlConf = {
  title: config.name,
  template: path.join(__dirname, "client/index.html"),
  inject: true
};

const styleLoad = [
  //ExtractTextPlugin.loader({remove: true, extract: true, omit:1}),
  ExtractTextPlugin.loader({ remove: true, extract: true, omit: 1 }),
  'style',
  'css?importLoaders=1',
  'font-loader?format[]=truetype&format[]=woff&format[]=embedded-opentype'
];

module.exports = {
  debug: false,

  entry: {
    app: [path.join(__dirname, 'client/app/bootstrap.js')],
    vendor
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'ng-annotate!babel' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.scss$/, loaders: [ ...styleLoad, 'sass'] },
      { test: /\.css$/, loaders: styleLoad },
      { test: /\.(jpe?g|png|gif|svg)$/i, loader: 'file?hash=sha512&digest=hex&name=[hash].[ext]' },
      { test: /\.json$/, loaders: ["json-loader"]}
    ]
  },
  plugins: [
    new WebpackMd5Hash(),
    new ExtractTextPlugin('style.css', '[name].[contenthash].css'),
    new HtmlWebpackPlugin(htmlConf),
    new CommonsChunkPlugin(commmonsConf),
    new DedupePlugin(),
    new OccurrenceOrderPlugin(),
    new UglifyJsPlugin(uglifyConf)
  ]
};
