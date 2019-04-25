const path = require('path');  // require in ES5 syntax
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js'); //It need interely name file

//module.exports = {
const config = {
    // Tell webpack the root file of our 
    // server application
    entry: './src/client/client.js',

    // Tell webpack whre to put the output file
    // that is generated
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public') // Two Underscores  
    }
}

module.exports = merge(baseConfig, config);