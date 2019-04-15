//Action creator
export const selectSong = song => {
    //Returnan action
    return {
        type: 'SONG_SELECTED',
        payload: song
    };
};

//export WITHOUT the keyworld "Default" it means is imported by {selecSong}  with "Brackets"