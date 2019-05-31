/**
|--------------------------------------------------
| Configure Store for Production
|--------------------------------------------------
*/
import { createStore, applyMiddleware, compose } from 'redux';

//Takecare about the Asynchronous call for the action creators
import thunk from 'redux-thunk';

// Reducers Entry Point
import rootReducer from '../client/reducers';

// Middleware you want to use in production:
const enhancer = applyMiddleware(thunk); //(p1, p2, p3)

export default function configureStore(initialState) {
  console.log('DevTool Going through Production');

  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  return createStore(rootReducer, initialState, enhancer);
}
