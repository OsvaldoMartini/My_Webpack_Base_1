import React from 'react';
//import { Route } from 'react-router-dom';
import Home from './components/Home';
import UsersList from './components/UsersList';

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
export default [
    {
        path: '/',
        component: Home,
        exact: true
    },
    {
        path: '/users',
        component: UsersList
    },
    {
        path: '/Hi',
        component: () => 'Hi'
    }
];