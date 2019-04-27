import axios from 'axios';
// The FETCH_USERS is NOT SERVER SIDE rendering going on here yet
// The Rendering has be done by the CLIENT SIDE FUNCTIONS  
export const FETCH_USERS = 'fetch_users';
export const fetchUsers = () => async dispatch => {
  const res = await axios.get('http://react-ssr-api.herokuapp.com/users');

  dispatch({
    type: FETCH_USERS,
    payload: res
  })
};