/**
|--------------------------------------------------
| Dev - With No Persist State
| Configure Store for Development with "store enhancer"
|--------------------------------------------------
*/
import { createStore, applyMiddleware, compose } from 'redux';

//Takecare about the Asynchronous call for the action creators
import thunk from 'redux-thunk';

import rootReducer from '../client/reducers';

import DevToolsAsDock from '../../DevTools/DevToolsAsDock';

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(thunk), //(d1, d2, d3)
  // Required! Enable Redux DevTools with the monitors you chose
  DevToolsAsDock.instrument()
);

export default function configureStore(initialState) {
  console.log('DevTool Going through Development');

  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/reactjs/redux/releases/tag/v3.1.0
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../client/reducers', () =>
      store.replaceReducer(
        require('../client/reducers') /*.default if you use Babel 6+ */
      )
    );
  }

  return store;
}
