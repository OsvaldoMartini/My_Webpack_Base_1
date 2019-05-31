import React from 'react';
import { render } from 'react-dom';
import DevToolsAsLog from './DevToolsAsLog';

const WAIT_FOR = 100;

const showDevToolsAsLog = store => {
  const popup = window.open(
    null,
    'DevToolsAsLog',
    'menubar=no,location=no,resizable=yes,scrollbars=no,status=no'
  );

  popup.location.reload();

  setTimeout(() => {
    popup.document.title = 'Redux Dev Tools';
    popup.document.write('<style>body { margin : 0; }</style>');
    popup.document.write('<div id="react-devtools-root"></div>');

    render(
      <DevToolsAsLog store={store} />,
      popup.document.getElementById('react-devtools-root')
    );
  }, WAIT_FOR);
};

export default showDevToolsAsLog;
