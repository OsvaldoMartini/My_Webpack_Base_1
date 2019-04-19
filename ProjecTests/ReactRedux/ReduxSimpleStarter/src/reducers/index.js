import { combineReducers } from 'redux';
import BooksReducer from './reducer_books';

const rootReducer = combineReducers({
//  state: (state = {}) => state
  books: BooksReducer
});

export default rootReducer;
