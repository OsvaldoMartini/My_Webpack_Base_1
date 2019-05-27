// Startup point for the client side application
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

// Redux - Client Side Set-Up
//Middleware is used to hook up any middleware that we migth be using inside of our application
import { createStore, applyMiddleware } from 'redux';
// Is Used to handle asynchronous action creators
import thunk from 'redux-thunk';
//Provider is What Ties our Store and React side together.
//Is used to communicate data from the store to any connected components in our application
import { Provider } from 'react-redux';

import { renderRoutes } from 'react-router-config';
import Routes from './Routes';
import reducers from './reducers';

const store = createStore(reducers, {}, applyMiddleware(thunk));

console.log('Hi there!');

// Hydrate instead of render
//ReactDOM.render(<Home />, document.querySelector('#root'));
ReactDOM.hydrate(
  <Provider store={store}>
    <BrowserRouter>
      <div>{renderRoutes(Routes)}</div>
    </BrowserRouter>
  </Provider>,
  document.querySelector('#root')
);
