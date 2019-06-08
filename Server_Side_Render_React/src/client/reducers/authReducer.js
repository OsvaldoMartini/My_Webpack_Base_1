/**
|--------------------------------------------------
| Reducer from Authentication User 
|--------------------------------------------------
*/
import { FETCH_CURRENT_USER } from '../actions';

export default function(state = null, action) {
  switch (action.type) {
    case FETCH_CURRENT_USER:
      return action.payload.data || false;
    default:
      return state;
  }
}

//this can retur 3(three) values
//  state = null
//  state = false
//  state = action.payload.data
