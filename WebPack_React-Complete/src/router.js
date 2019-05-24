import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import Home from './components/Home';
import ArtistMain from './components/artists/ArtistMain';
import ArtistDetail from './components/artists/ArtistDetail';
import ArtistCreate from './components/artists/ArtistCreate';
import ArtistEdit from './components/artists/ArtistEdit';

//Rewritten "Route" as 'Plain' Javascript routes
//Translating JSX to plain javascript
const componentsRoutes={
  component:Home,
  path: '/',
  indexRoutes:{ component: ArtistMain},
  childRouts: [{
    path: 'artist/new'
    getComponent(location, cb) {//The Maig Here is: We eant to Asynchronouslu load up our component asynchronously
    //The Strategy here is to place our System.import call to dynamically load up the component 
    //And then after loaded (once is Fetched) it up we will call cb with the component that we just loaded 
      System.import('./components/artists/ArtistCreate').then(module => cb())
    }
  }]
};

const Routes = () => {
  return (
    <Router history={hashHistory}>
      <Route path="/" component={Home}>
        <IndexRoute component={ArtistMain} />
        <Route path="artists/new" component={ArtistCreate} />
        <Route path="artists/:id" component={ArtistDetail} />
        <Route path="artists/:id/edit" component={ArtistEdit} />
      </Route>
    </Router>
  );
};

export default Routes;
