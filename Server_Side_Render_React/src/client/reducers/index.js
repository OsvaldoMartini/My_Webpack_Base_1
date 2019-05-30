/**
|--------------------------------------------------
| Combine all Different Reducers together
|--------------------------------------------------
*/
import { combineReducers } from 'redux';
import usersReducer from './usersReducer';
import adminReducer from './adminsReducer';

const rootReducer = combineReducers({
  users: usersReducer,
  admins: adminReducer
});

export default rootReducer;
