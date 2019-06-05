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
    <nav className="nav-wrapper">
      <div>
        <Link to="/" className="brand-logo">
          Main Menu
        </Link>
        <ul className="right">
          <li>
            <Link to="/users">Users</Link>
          </li>
          <li>
            <Link to="/admins">Admins</Link>
          </li>
          <li>{authButton}</li>
        </ul>
      </div>
    </nav>
  );
};

// Now We have should be Receiving the 'auth' as props
function mapStateToProps({ auth }) {
  return { auth: auth };
}

// This is sending the 'auth' to the 'Header' as 'Props'
export default connect(mapStateToProps)(Header);
