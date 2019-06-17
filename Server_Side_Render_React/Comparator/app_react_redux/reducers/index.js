/**
|--------------------------------------------------
| Combine all Different Reducers together
|--------------------------------------------------
*/
// Node
//import accountingReducer from './accountingReducer.js';
//import claimHistoryReducer from './claimHistoryReducer';
//import policiesReducer from './policiesReducer';

// Plain Javascript
//const accountingReducer = require('./accountingReducer.js');
// const claimHistoryReducer = require('./claimHistoryReducer');
// const policiesReducer = require('./policiesReducer');

const { combineReducers } = Redux;

const ourDepartments = combineReducers({
  accounting: accountingReducer,
  claimHistory: claimHistoryReducer,
  policies: policiesReducer
});

const store = Redux.createStore(ourDepartments);

store.dispatch(createPolicy('Alex', 20));
store.dispatch(createPolicy('Jim', 30));
store.dispatch(createPolicy('Bob', 40));

store.dispatch(createClaim('Bob', 120));

console.log(store.getState());
