// Startup point for the client side application
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux'; //Middleware is used to hook up any middleware that we migth be using inside of our application
import thunk from 'redux-thunk'; // Is Used to handle asynchronous action creators
import { Provider } from 'react-redux'; //Provider is What Ties our Store and React side together. Is used to communicate data from the store to any connected components in our application
import Routes from './Routes';

const store = createStore(reducers, {}, applyMiddleware(thunk));

console.log('Hi there!');

// Hydrate instead of render
//ReactDOM.render(<Home />, document.querySelector('#root'));
ReactDOM.hydrate(
    <Provider store={store}>
        <BrowserRouter>
            <Routes />
        </BrowserRouter>
    </Provider>
    , document.querySelector('#root'));