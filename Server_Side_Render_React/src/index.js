const express = require('express');
const app = express();

const React = require('react');
const renderToString = require('react-dom/server').renderToString;
const Home = require('./client/components/home').default;



app.get('/', (req, res) => {
    const content = renderToString(<Home />);

    res.send(content);
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});


//  Building:
//  npm run dev:build:server

//  Running:
//  node build/bundle.js