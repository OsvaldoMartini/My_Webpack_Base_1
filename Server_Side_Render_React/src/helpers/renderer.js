// this file is going to house a function that will simply render our react up and return it as a string
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { Helmet } from 'react-helmet';
import Routes from '../client/Routes';
//import DevToolsAsDock from '../../DevTools/DevToolsAsDock';
import serialize from 'serialize-javascript';

export default (req, store, context) => {
  console.log('Rendering in Server Side');

  const content = renderToString(
    <Provider store={store}>
      {/* <div> */}
      <StaticRouter location={req.path} context={context}>
        <div>{renderRoutes(Routes)}</div>
        {/* <Routes/> */}
      </StaticRouter>
      {/* <DevToolsAsDock /> */}
      {/* </div> */}
    </Provider>
  );

  const helmet = Helmet.renderStatic();

  // ## Underneath a tine little HTML. I'll snifft it (farejar)
  return `
    <html>
        <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        <link rel="stylesheet" href="/css/main.css">
        </head>
        <body>
            <div id="root">${content}</div>
            <script>
            window=INITIAL_STATE = ${serialize(store.getState())}
            </script>
            <script src="bundle.js"></script>
        </body>
    </html>
    `;
};
