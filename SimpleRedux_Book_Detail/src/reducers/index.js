import { combineReducers } from 'redux';
import BooksReducer from './reducer_books';
import ActiveBook from './reducer_active_book';



const rootReducer = combineReducers({
//  state: (state = {}) => state
  books: BooksReducer,
   // ==>  Making Sure we Hook up the Book Detail to the Redux Store
  activeBook: ActiveBook  //=> Connected with BookDetail
});

export default rootReducer;
