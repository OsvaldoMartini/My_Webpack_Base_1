const express = require('express');
const webpackMiddleware = require('webpack-dev-middleware'); //For Intercept incoming request and hand it off to webpack
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(webpackMiddleware(webpack(webpackConfig)));
}

app.listen(3050, () => console.log('Listening port: 3050'));
