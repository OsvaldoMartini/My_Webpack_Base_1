// Startup point for the client side application
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/home';

console.log('Hi there!');

// Hydrate instead of render
//ReactDOM.render(<Home />, document.querySelector('#root'));
ReactDOM.hydrate(<Home />, document.querySelector('#root'));