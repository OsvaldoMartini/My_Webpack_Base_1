//Isomorphic Java Script / Universal Javascript
import 'babel-polyfill';
import express from 'express';

import { matchRoutes } from 'react-router-config';
import proxy from 'express-http-proxy';
import Routes from './client/Routes';

import renderer from './helpers/renderer';

// Two Ways Create Store
import createStore from './helpers/createStore';

// To Be used with DevTools
//import configureStore from './store/configureStore';

//const express = require('express');
const app = express();

// Above all other Middlewares low level proxy
// Set up as Middleware Before all other Middlewares
// Any route whatsoever or any request that tries toa ccess a route '/api'
// Will be automatically sent off o this domain
app.use(
  '/api',
  proxy('http://react-ssr-api.herokuapp.com', {
    proxyReqOptDecorator(opts) {
      // Just Set this for the Current Course in this App
      // Just to give as easy way to handle with Google Auth process
      // And don't run some security erros with the Google waterflow (that's all)
      // This say's after the Login process forward me back to "localhost:3000"
      opts.headers['x-forwarded-host'] = 'localhost:3000';
      return opts;
    }
  })
);

//const React = require('react');
//const renderToString = require('react-dom/server').renderToString;
//const Home = require('./client/components/home').default;

app.use(express.static('public'));

// ## This tells express that it needs to treat that public directory as a static or public directory that is
// ## available o the outside world
// The BrowserRouter (Not The StaticRouter) BrowserRouter Has the ability to look directly at our browser's address bar to figure out what the current path is, and what set
// of components it needs to show on the screen.
// The StaticRouter however, needs to be told exactly what the current path is that it needs to consider.
// So for us, we need to somehow communicate the current path that the user is trying to access to the StaticRouter, So that StaticRouter knows what set of components it should show on the screen.
// The current path that it need to consider is contained in the original request object that express passed out to our Router Handler inside the JSX File.
// The "(req)" inside of "...app.get('/', (req, res) ..." This request ("..req..") contains the URL that the user is trying to access.

//Passing the " req " inside of the render as argument
app.get('*', (req, res) => {
  // Redux - Server Side Set-Up

  // including all Request in our Store that also contains the cookies
  const store = createStore(req);
  //to Be Used with DevTools
  //const store = configureStore();

  // Some logic to initialize
  // and load data into the Store
  // List of Routes and Path That The User Want to Access
  // "matchRoutes" It's going to look at whatever route the user is trying to visit and
  // then it's going to return an array of components that are about to be rendered

  // lets console.log the MatchRoutes
  console.log(matchRoutes(Routes, req.path));

  // Mapping matchRoutes
  //We Are Doing some Destructuring Here ({route})
  const promises = matchRoutes(Routes, req.path)
    .map(({ route }) => {
      return route.loadData ? route.loadData(store) : null;
    })
    .map(promise => {
      if (promise) {
        return new Promise((resolve, reject) => {
          // No matter what we always going to resolve the inner promise
          promise.then(resolve).catch(resolve);
        });
      }
    });

  console.log(promises);

  Promise.all(promises).then(() => {
    //Creating a Context

    const context = {};

    // Finnaly Call the Server Side Render
    const content = renderer(req, store, context);

    // Seeing what's happen when we render a redirect tag
    // while rendering our application on the server side
    console.log('Context:', context);
    // When ios Defined an URL inside of the Context it will be Redirect Autmomatically
    if (context.url) {
      return res.redirect(301, context.url);
    }

    if (context.notFound) {
      res.status(404);
    }

    // Sending the Response Back
    res.send(content);
  });
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});

//  Building:
//  npm run dev:build:server

//  Running:
//  node build/bundle.js
