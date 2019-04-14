/*global System */
'use strict';

System.config({
    transpiler: 'plugin-babel',
    babelOptions: {
        sourceMaps: false,
        stage0: true,
        react: true
    },
    meta: { },
    paths: {
      'npm:': 'https://unpkg.com/',
      'npm_local:': '../plugins/'
    },
    map: {
      // our app is within the app folder
      app: 'app/indexSongs.js', 
      
      //"plugin-babel": 'https://unpkg.com/systemjs-plugin-babel@0.0.25/plugin-babel.js',
      "plugin-babel": 'npm_local:plugin-babel.js',
      //"systemjs-babel-build": 'https://unpkg.com/systemjs-plugin-babel@0/systemjs-babel-browser.js',
      "systemjs-babel-build": 'npm_local:systemjs-babel-browser.js',
      //"react": "npm:react@16/umd/react.development.js",
      "react": "npm_local:react.development.js",
      //"react-dom": "npm:react-dom@16/umd/react-dom.development.js",
      "react-dom": "npm_local:react-dom.development.js",
      //"prop-types": "npm:prop-types/prop-types.js",
      "prop-types": "npm_local:prop-types/prop-types.js",
      //"classnames": "npm:classnames@2.2.5",
      "classnames": "npm_local:classnames/index.js",
      "font-awesome": "npm:font-awesome@4.7.0",
      "react-scripts": "npm:react-scripts@1.0.11",
      "primereact": "npm:primereact@1.0.1/",
      //"primereact": "npm_local:"
      "babel-gen_run":"npm_local:generator-runtime.js",
      "babel-async_gen":"npm_local:asyncGenerator.js",
      "redux": "npm_local:redux.js",
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      //'https://unpkg.com/' : { defaultExtension: false },
      '../plugins/' : { defaultExtension: false },
    }
});

 
System.import('app')