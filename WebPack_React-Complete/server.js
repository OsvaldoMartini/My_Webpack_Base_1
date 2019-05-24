const express = require('express');

const app = express();

//Servers Routes...
app.get('/hello', (req, res) => res.send({ hi: 'there' }));

if (process.env.NODE_ENV !== 'production') {
  const webpackMiddleware = require('webpack-dev-middleware'); //For Intercept incoming request and hand it off to webpack
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config.js');
  app.use(webpackMiddleware(webpack(webpackConfig)));
} else {
  app.use(express.static('dist'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

//AWS and Heroku it Not Allow to Specific the Port here
//But they will want you to bind to a port specified by the server

app.listen(process.env.PORT || 3050, () => console.log('Listening port: 3050'));
