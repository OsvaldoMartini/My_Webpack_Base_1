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
  indexRoute:{ component: ArtistMain},
  childRoutes: [
    {
    path: 'artist/new'
    getComponent(location, cb) {//The Maig Here is: We eant to Asynchronouslu load up our component asynchronously
    //The Strategy here is to place our System.import call to dynamically load up the component 
    //And then after loaded (once is Fetched) it up we will call the "cb" calback function with the modle that just got loaded 
    // The two big Gotchas in this Splitting Process 
    // cb(First Agrument is Expecting error, Second Expect Results)
    // Cb(null,) => We are assuming that we don't have an error to pass => "He Loaded the Module, everything is good!!!"
    //The Second Module is the entire Javascript module and the actual code is available on "module.default" 
    System.import('./components/artists/ArtistCreate').then(module => cb(null, module.default));
    }
  }
]
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
