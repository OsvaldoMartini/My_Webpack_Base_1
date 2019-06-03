/**
|--------------------------------------------------
| Combine all Different Reducers together
|--------------------------------------------------
*/
import { combineReducers } from 'redux';
import usersReducer from './usersReducer';
import adminReducer from './adminsReducer';
import authReducer from './authReducer';

const rootReducer = combineReducers({
  users: usersReducer,
  admins: adminReducer,
  auth: authReducer
});

export default rootReducer;
