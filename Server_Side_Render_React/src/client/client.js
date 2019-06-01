// Startup point for the client side application
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { createStore, applyMiddleware, compose } from 'redux';
//Takecare about the Asynchronous call for the action creators
import thunk from 'redux-thunk';

import DevToolsAsDock from '../../DevTools/DevToolsAsDock';

//Provider is What Ties our Store and React side together.
//Is used to communicate data from the store to any connected components in our application
import { Provider } from 'react-redux';

// Redux - Client Side Set-Up
import configureStore from '../store/configureStore';

import { renderRoutes } from 'react-router-config';
import Routes from './Routes';

//const store = configureStore();
const store = createStore(reducers, {}, applyMiddleware(thunk));

console.log('Hi there!');

const contentClientSide = () => {
  console.log('Rendering in Client Side');
  console.log('Environment Prod:', process.env.NODE_ENV);

  return (
    <Provider store={store}>
      <div>
        <BrowserRouter>
          <div>{renderRoutes(Routes)}</div>
        </BrowserRouter>
        <DevToolsAsDock text="Client Side Render" />
      </div>
    </Provider>
  );
};

// Hydrate instead of render
//ReactDOM.render(<Home />, document.querySelector('#root'));
ReactDOM.hydrate(contentClientSide(store), document.querySelector('#root'));
