/**
|--------------------------------------------------
| Combine all Different Reducers together
|--------------------------------------------------
*/
import { combineReducers } from 'redux';
import usersReducer from './usersReducer';
import adminReducer from './adminsReducer';

export default combineReducers({
  users: usersReducer,
  admins: adminReducer
});
