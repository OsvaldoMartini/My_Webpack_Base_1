import React, { Component } from 'react';
import ReactDom from 'react-dom';
import App, { color, country } from './componentes/App';
import './css/index.css';

console.log(React.version);

console.log(color, country);
ReactDom.render(
  <div>
    <App />
  </div>,
  document.getElementById('root')
);
