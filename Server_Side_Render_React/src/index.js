//Isomorphic Java Script / Universal Javascript
import 'babel-polyfill';
import express from 'express';
import { matchRoutes } from 'react-router-config';
import Routes from './client/Routes';
import renderer from './helpers/renderer';
//import createStore from './helpers/createStore';
import configureStore from './store/configureStore';
//const express = require('express');
const app = express();

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
  //const store = createStore();
  const store = configureStore();

  // Some logic to initialize
  // and load data into the Store
  // List of Routes and Path That The User Want to Access
  // "matchRoutes" It's going to look at whatever route the user is trying to visit and
  // then it's going to return an array of components that are about to be rendered

  // lets console.log this
  console.log(matchRoutes(Routes, req.path));

  // Mapping matchRoutes
  const promises = matchRoutes(Routes, req.path).map(({ route }) => {
    //We Are Doing some Destructuring Here
    return route.loadData ? route.loadData(store) : null;
  });

  console.log(promises);

  Promise.all(promises).then(() => {
    // Finnaly CAll the Server Side Render
    res.send(renderer(req, store));
  });
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});

//  Building:
//  npm run dev:build:server

//  Running:
//  node build/bundle.js
