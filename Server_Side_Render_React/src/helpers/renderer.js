// this file is going to house a function that will simply render our react up and return it as a string
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import Routes from '../client/Routes';
// import DevToolsAsDock from '../../DevTools/DevToolsAsDock';

export default (req, store) => {
  console.log('Rendering in Server Side');

  const content = renderToString(
    <Provider store={store}>
      <div>
        <StaticRouter location={req.path} context={{}}>
          <div>{renderRoutes(Routes)}</div>
        </StaticRouter>
        {/* <DevToolsAsDock /> */}
      </div>
    </Provider>
  );

  // ## Underneath a tine little HTML. I'll snifft it (farejar)
  return `
    <html>
        <head></head>
        <body>
            <div id="root">${content}</div>
            <script src="bundle.js"></script>
        </body>
    </html>
    `;
};
