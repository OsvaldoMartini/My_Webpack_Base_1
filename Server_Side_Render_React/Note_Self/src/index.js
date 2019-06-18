import React, { Component } from 'react';
import ReactDom from 'react-dom';
import App, { color, country } from './componentes/App';

console.log(color, country);
ReactDom.render(<App />, document.getElementById('root'));
