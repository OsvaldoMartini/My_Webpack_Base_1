import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import FirstButton from '../components/FirstButton.jsx';
import SecondButton from '../components/SecondButton.jsx';
import Avatar from '../components/AvatarTest.jsx';

ReactDOM.render(<App />, document.getElementById('root'));

ReactDOM.render(<FirstButton />, document.getElementById('firstButton'));
ReactDOM.render(<SecondButton />, document.getElementById('secondButton'));
ReactDOM.render(<Avatar />, document.getElementById('avatar'));