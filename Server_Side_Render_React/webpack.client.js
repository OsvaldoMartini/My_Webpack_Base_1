const path = require('path');  // require ir ES5 syntax

module.exports = {
    // Tell webpack the root file of our 
    // server application
    entry: './src/client/client.js',

    // Tell webpack whre to put the output file
    // that is generated
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public') // Two Underscores  
    },

    // Tell webpack to run babel on every file it runs through
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [                  // Rules That Babel use to Transpile code
                        'react',                // It Takes all JSX files to normal javascript function calls
                        'stage-0',              // To habdle some async code that we're going to write later on
                        ['env', {               // "env" is Master preset that webpack uses it Says run All rules
                            targets:            // of the latest Two versions of all popular browsers
                                { browsers: ['last 2 versions'] }
                        }]

                    ]
                }
            }
        ]
    }

}