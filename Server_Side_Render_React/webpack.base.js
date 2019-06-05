var webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  // Tell webpack to run babel on every file it runs through
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            // Rules That Babel use to Transpile code
            'react', // It Takes all JSX files to normal javascript function calls
            'stage-0', // To habdle some async code that we're going to write later on
            [
              'env',
              {
                // "env" is Master preset that webpack uses it Says run All rules
                // of the latest Two versions of all popular browsers
                targets: { browsers: ['last 2 versions'] }
              }
            ]
          ]
        }
      },
      {
        loader: ExtractTextPlugin.extract({
          loader: 'css-loader'
        }),
        test: /\.css$/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV), //When React Boost Up it's going to look for this variable on Windows Scope
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].css'
    })
  ]
};
