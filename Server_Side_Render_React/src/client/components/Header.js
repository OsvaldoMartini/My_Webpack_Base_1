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

  const authButton = auth ? (
    <a href="/api/logout">Logout</a>
  ) : (
    <a href="/api/auth/google">Login</a>
  );

  return (
    <div>
      <Link to="/">Main Menu - MapBox</Link>
      <div>
        <Link to="/users">Users</Link>
        <Link to="/admins">Admins</Link>
        {authButton}
      </div>
    </div>
  );
};

// Now We have should be Receiving the 'auth' as props
function mapStateToProps({ auth }) {
  return { auth: auth };
}

// This is sending the 'auth' to the 'Header' as 'Props'
export default connect(mapStateToProps)(Header);
