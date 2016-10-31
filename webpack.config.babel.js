import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

const config = require('./package.json');

const stylesLoaders = [
  'style',
  'css?importLoaders=1',
  'font-loader?format[]=truetype&format[]=woff&format[]=embedded-opentype'
];

module.exports = {
  debug: true,

  entry: {
    app: [path.join(__dirname, "client/app/bootstrap.js")]
  },

  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },

  devtool: 'inline-source-map',

  module: {
    loaders: [
      { test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'ng-annotate' },
      { test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'babel', query: { plugins: ['transform-runtime'] } },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.scss$/, loaders: [...stylesLoaders, 'sass?sourceMap'] },
      { test: /\.css$/, loaders: stylesLoaders },
      { test: /\.(jpe?g|png|gif|svg)$/i, loader: 'file-loader?name=[name].[ext]' },
      { test: /\.json$/, loaders: ["json-loader"]}
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: config.name,
      template: path.join(__dirname, "client/index.html"), // Load a custom template
      inject: true // Inject all scripts into the body
    })
  ]
};
