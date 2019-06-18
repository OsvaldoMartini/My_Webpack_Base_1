import React, { Component } from 'react';
import ReactDom from 'react-dom';
import App, { color, country } from './componentes/App';

console.log(React.version);

console.log(color, country);
ReactDom.render(<App tyme="time">Olas</App>, document.getElementById('root'));
