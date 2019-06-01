import { combineReducers } from 'redux';

//Reducer for Static List
const songsReducer = () => {
    return [
        {title:'No Scrubs', duration: '4:05'},
        {title:'Macarena', duration:'2:30'},
        {title:'All Star', duration: '3:15'},
        {title:'IWant it That Way', duration:'1:45'}
    ];
};

//Reducer for Selected Song
//We May Have more the only one action per Reducer
const selectedSongReducer = (selectedSong = null, action) => {
    if (action.type === 'SONG_SELECTED') {
        return action.payload;
    }
    return selectedSong;
};


export default combineReducers({
    songs: songsReducer,
    selectedSong: selectedSongReducer
})


// All right so believe it or not:
// That is pretty much it for the strictly redux side of things
// We've got our reducers put together and we've got our action creator singular put together