import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import FirstButton from '../components/FirstButton.jsx';
import SecondButton from '../components/SecondButton.jsx';
import Avatar from '../components/AvatarTest.jsx';
import CalendarDate from '../components/CalendarDate.jsx';
import Product from '../components/ProductList.jsx';
import ItemFather from '../components/ItemFather.jsx';
import ParentPlanet from '../components/ParentPlanet.jsx';

ReactDOM.render(<App />, document.getElementById('root'));

ReactDOM.render(<Product />, document.getElementById('product'));

ReactDOM.render(<FirstButton />, document.getElementById('firstButton'));
ReactDOM.render(<SecondButton />, document.getElementById('secondButton'));
ReactDOM.render(<Avatar />, document.getElementById('avatar'));
ReactDOM.render(<CalendarDate />, document.getElementById('calendarDate'));
ReactDOM.render(<ItemFather />, document.getElementById('dynamicItems'));
ReactDOM.render(<ParentPlanet />, document.getElementById('planet'));
