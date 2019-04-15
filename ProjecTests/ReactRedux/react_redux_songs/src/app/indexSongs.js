import React from 'react';
import ReactDOM from 'react-dom';

import { Provide } from 'react-redux';  //Component made up by the React-Redux library -> Component is written by convetion first letter is capital 'P'rovider
import { createStore } from 'react';    //function made up by the React library -It returns all of our applications data were state

import AppSongs from '../components/AppSongs.js';

//Underneath my App a Import the Reducers
import reducers from '../reducers/index.js';  //In case the Use of Web Pask can be write only as '../reducers'

ReactDOM.render(<AppSongs/>, document.querySelector('#root'));

// Now Our Goal is to make sure that we get that provider tag at the very top
// of our component hierarchy and
// we need to make sure that we also pass it a reference to our redux store that gets all 
// of our reducers loaded up into it