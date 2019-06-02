import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUsers } from '../actions';

class UsersList extends Component {
  componentDidMount() {
    // Commented just to figure out the flow of the Data Load Initialy
    this.props.fetchUsers();
  }

  renderUsers() {
    return this.props.users.map(user => {
      return <li key={user.id}>{user.name}</li>;
    });
  }

  render() {
    return (
      <div>
        Here's big list of Users
        <ul>{this.renderUsers()}</ul>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { users: state.users };
}

// The Store is being used here!
// This is ONLY FOR THE SERVER SIDE RENDER
// I am Calling Store.Dispatch Directly
function loadData(store) {
  console.log("UserList says: I'm trying to load some data");
  return store.dispatch(fetchUsers());
}

// Named Export
export { loadData };

//Regular Reduxe Call
//mapStateToProps
export default connect(
  mapStateToProps,
  { fetchUsers }
)(UsersList);
