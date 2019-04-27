import React from 'react';
import { Route } from 'react-router-dom';
import Home from './components/Home';

// Exact Prop I want to show this route if the URL is exactly the path "Slash"
export default () => {
    return (
        <div>
            <Route exact path="/" component={Home} />
        </div>
    );
}