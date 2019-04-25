const path = require('path');  // require in ES5 syntax
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js'); //It need interely name file

const config = {
    // Inform webpack that we're building a bundle
    // for nodeJS, rather than for the browser
    target: 'node',

    // Tell webpack the root file of our 
    // server application
    entry: './src/index.js',

    // Tell webpack whre to put the output file
    // that is generated
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build') // Two Underscores
    }
}

module.exports = merge(baseConfig, config);