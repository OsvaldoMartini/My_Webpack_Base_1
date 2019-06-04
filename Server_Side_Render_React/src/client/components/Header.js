/**
|--------------------------------------------------
| Header Component
| With Lilnk to Navigate between the App
|--------------------------------------------------
*/
import React from 'react';
//Link tag to have the ability to Navigae
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

const Header = ({ auth }) => {
  console.log('My auth status is', auth);

  return (
    <div>
      <Link to="/">Main Menu - MapBox</Link>
    </div>
  );
};

// Now We have should be Receiving the 'auth' as props
function mapStateToProps({ auth }) {
  return { auth: auth };
}

// This is sending the 'auth' to the 'Header' as 'Props'
export default connect(mapStateToProps)(Header);
