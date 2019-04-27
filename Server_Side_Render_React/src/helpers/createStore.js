import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'; //Takecare about the Asynchronous call for the action creators

export default () => {
    const store = createStore(reducers, {}, applyMiddleware(thunk));

    return store;
}