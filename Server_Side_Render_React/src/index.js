//Isomorphic Java Script / Universal Javascript
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Home from './client/components/home';

//const express = require('express');
const app = express();

//const React = require('react');
//const renderToString = require('react-dom/server').renderToString;
//const Home = require('./client/components/home').default;

// ## This tells express that it needs to treat that public directory as a static or public directory that is
// ## available o the outside world
app.use(express.static('public'));

app.get('/', (req, res) => {
    const content = renderToString(<Home />);

    // ## Underneath a tine little HTML. I'll snifft it (farejar)
    const html = `
    <html>
        <head></head>
        <body>
            <div id="root">${content}</div>
            <script src="bundle.js"</script>
        </body>
    </html>
    `;

    res.send(html);
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});


//  Building:
//  npm run dev:build:server

//  Running:
//  node build/bundle.js