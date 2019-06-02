import { createStore, applyMiddleware } from 'redux';

//Takecare about the Asynchronous call for the action creators
import thunk from 'redux-thunk';
import axios from 'axios';
import reducers from '../client/reducers'; //Getting all the Combined Reducers for the Creation of the Store

export default req => {
  const axiosInstance = axios.create({
    baseURL: 'http://react-ssr-api.herokuapp.com',
    headers: { cookie: req.get('cookie') || '' }
  });

  const store = createStore(
    reducers,
    {},
    applyMiddleware(thunk.withExtraArgument(axiosInstance))
  );

  return store;
};
