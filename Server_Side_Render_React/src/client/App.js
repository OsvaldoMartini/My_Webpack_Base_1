import React from 'react';
import { renderRoutes } from 'react-router-config';
import Header from './components/Header';
import { fetchCurrentUser } from './actions';
/**
|--------------------------------------------------
| We are going to pass any routes that were matched during the match route's process
| as a prop called 'routes' Destructured properly
| 'route have a 'colletion of components we need to render inside of the App
|--------------------------------------------------
*/
const App = ({ route }) => {
  return (
    <div>
      <Header />
      {renderRoutes(route.routes)}
    </div>
  );
};

export default {
  component: App,
  loadData: ({ dispatch }) => dispatch(fetchCurrentUser())
};
