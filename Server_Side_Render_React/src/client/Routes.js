import React from 'react';
//import { Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
//import UsersList, { loadData } from './components/UsersList';
import UsersListPage from './pages/UsersListPage';

// Exact Prop I want to show this route if the URL is exactly the path "Slash"
// export default () => {
//     return (
//         <div>
//             <Route exact path="/" component={Home} />
//             <Route path="/hi" component={() => 'Hi'} />
//             <Route path="/users" component={UsersList} />
//         </div>
//     );
// }

// New Way to Route wih (Router-ReactConfig)
// React-Router-Config
// it will help Us to figure Out hat set of components are about to be rendered. Give some Particular URL
export default [
  {
    ...HomePage, //ES2016 Syntax (some spread syntax)
    path: '/',
    //component: Home,
    exact: true
  },
  {
    //loadData: loadData, //ES2015 Systax => Or Just Type loadData, => But end of the day it will be expanded like so 'loadData: loadData'
    ...UsersListPage,
    path: '/users'
    //component: UsersListPage
  },
  {
    path: '/Hi',
    component: () => 'Hi'
  },
  {
    path: '/MapBox',
    component: () => 'MapBox'
  },
  {
    path: '/images',
    component: () => 'Images'
  },
  {
    path: '/Admins',
    component: () => 'Admins'
  }
];
