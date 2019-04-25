// this file is going to house a function that will simply render our react up and return it as a string
import React from 'react';
import { renderToString } from 'react-dom/server';
import Home from '../client/components/Home';

export default () => {
    const content = renderToString(<Home />);

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

}
