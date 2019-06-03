import React from 'react';
import { renderRoutes } from 'react-router-config';

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
      <h1>I am a header</h1>
      {renderRoutes(route.routes)}
    </div>
  );
};

export default {
  component: App
};
