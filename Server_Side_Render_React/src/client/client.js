// Startup point for the client side application
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { createStore, applyMiddleware } from 'redux';
//Takecare about the Asynchronous call for the action creators
import thunk from 'redux-thunk';

//import DevToolsAsDock from '../../DevTools/DevToolsAsDock';

//Provider is What Ties our Store and React side together.
//Is used to communicate data from the store to any connected components in our application
import { Provider } from 'react-redux';

// Redux - Client Side Set-Up
//import configureStore from '../store/configureStore';

import { renderRoutes } from 'react-router-config';

import axios from 'axios';

import Routes from './Routes';
import reducers from './reducers';
import '../styles/materialize.css';

const axiosInstance = axios.create({
  baseURL: '/api'
});

//const store = configureStore(window.INITIAL_STATE);
const store = createStore(
  reducers,
  window.INITIAL_STATE,
  applyMiddleware(thunk.withExtraArgument(axiosInstance))
);

console.log('Hi there!');

const contentClientSide = () => {
  console.log('Rendering in Client Side');
  console.log('Environment Prod:', process.env.NODE_ENV);

  return (
    <Provider store={store}>
      {/* <div> */}
      <BrowserRouter>
        <div>{renderRoutes(Routes)}</div>
        {/* <Routes /> */}
      </BrowserRouter>
      {/* <DevToolsAsDock /> */}
      {/* </div> */}
    </Provider>
  );
};

// Hydrate instead of render
//ReactDOM.render(<Home />, document.querySelector('#root'));
ReactDOM.hydrate(contentClientSide(store), document.querySelector('#root'));
