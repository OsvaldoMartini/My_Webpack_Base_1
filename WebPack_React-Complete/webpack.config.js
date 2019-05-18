var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const VENDOR_LIBS = [
  'faker',
  'lodash',
  'redux',
  'react-redux',
  'react-dom',
  'react-input-range',
  'redux-form',
  'redux-thunk'
];

module.exports = {
  entry: {
    bundle: './src/index.js',
    vendor: VENDOR_LIBS
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js' //name key fro the entry section
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor' // Check the Dulplications modules and pull  in and out from bundle t reduce sizes
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html' //The Devloper must the same file inside of src...Video: 36 Troubleshoting Vendor Bundles
    })
  ]
};
