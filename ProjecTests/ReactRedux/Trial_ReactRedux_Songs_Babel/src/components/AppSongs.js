import React from 'react';
//Just Sample to Import Arrow Function "export" withut the keyworld "default"
//  "selectSong" is note requested here for now
//import {selectSong} from '../actions/index.js'; //It means "imported the Named export File" selectSong
import '../components/component.js';


//import '../css/semantic-ui.css';

const add100 = (a) => {
    const oneHundred = 100;
    console.scope('Add 100 to another number');
    return add(a, oneHundred);
  };
   
  const add = (a, b) => {
    return a + b;
  };

const App = () => {
    return (
    <div>App   Songs
        
    </div>
    )
};

export default App;