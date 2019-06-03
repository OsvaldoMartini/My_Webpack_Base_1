/**
|--------------------------------------------------
| Header Component
| With Lilnk to Navigate between the App
|--------------------------------------------------
*/
import React from 'react';
//Link tag to have the ability to Navigae
import { Link } from 'react-router-dom';

export default () => {
  return (
    <div>
      <Link to="/">Main Menu - MapBox</Link>
    </div>
  );
};
