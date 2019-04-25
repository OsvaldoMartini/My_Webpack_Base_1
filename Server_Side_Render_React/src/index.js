//Isomorphic Java Script / Universal Javascript
import express from 'express';
import renderer from './helpers/renderer';

//const express = require('express');
const app = express();

//const React = require('react');
//const renderToString = require('react-dom/server').renderToString;
//const Home = require('./client/components/home').default;

// ## This tells express that it needs to treat that public directory as a static or public directory that is
// ## available o the outside world
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send(renderer());
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});


//  Building:
//  npm run dev:build:server

//  Running:
//  node build/bundle.js