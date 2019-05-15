import React from 'react';
import ReactDOM from 'react-dom';

import LeftFacetsApiRequest from './components/LeftFacetsApiRequest';

ReactDOM.render(
  <LeftFacetsApiRequest baseURL="http://localhost:57677" UrlToSearch="/MapGlobal/LayerItems" />
  , document.querySelector('.container'));
