import React from 'react';
//Just Sample to Import Arrow Function "export" withut the keyworld "default"
//  "selectSong" is note requested here for now
//import {selectSong} from '../actions/index.js'; //It means "imported the Named export File" selectSong
import { SongList } from "./SongList.js";

const App = () => {
    return (
    <div>App Songs
        <SongList/>
    </div>
    );
};

export default App;