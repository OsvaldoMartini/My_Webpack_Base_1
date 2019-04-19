// State argument is no application state, only state for this
// This Reducer is responsible for
// The State here as argument is a little bit more nebulous
// So reducers are only ever called when an action occurs
//All reducers get two arguments
//The current "State" And "Action"
// Piece of ES6 syntax (Do Not Return 'UNDEFINED')  state = null
export default function(state = null, action) {
    switch(action.type){
        case 'BOOK_SELECTED': 
        return action.payload;
    }
    return state;
}