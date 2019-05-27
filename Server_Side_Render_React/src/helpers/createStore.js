import { createStore, applyMiddleware } from 'redux';

//Takecare about the Asynchronous call for the action creators
import thunk from 'redux-thunk';

import reducers from '../client/reducers'; //Getting all the Combined Reducers for the Creation of the Store

export default () => {
  const store = createStore(reducers, {}, applyMiddleware(thunk));

  return store;
};
