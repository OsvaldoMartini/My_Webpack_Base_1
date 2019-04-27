import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUsers } from '../actions';

class Userlist extends Component {
    componentDidMount() {
        // Commented just to figure out the flow of the Data Load Initialy
        //this.props.fetchUsers;
    }

    renderUsers() {
        return this.props.map(user => {
            return <li key={user.id}>{user.name}</li>;
        })
    }

    render() {
        return (
            <div>
                Here's big list of Users
                <ul>{this.renderUsers}</ul>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return { users: state.users };
}
export default connect(mapStateToProps, { fetchUsers })(UsersList);