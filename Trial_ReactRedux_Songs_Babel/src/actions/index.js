//Action creator
export const selectSong = song => {
    //Returnan action
    return {
        type: 'SONG_SELECTED',  //REMINDER: the "TYPE" keyword IS MANDATORY
        payload: song           //REMINDER: the "PAYLOAD" keyword IS NOT MANDATORY
    };
};

//export WITHOUT the keyworld "Default" it means is imported by {selecSong}  with "Brackets"