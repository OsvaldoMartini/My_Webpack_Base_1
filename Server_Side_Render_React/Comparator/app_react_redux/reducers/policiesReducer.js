//number = [1,2,3]
//(3) [1, 2, 3]
//number.filter(num=> num!== 1)
//(2) [2, 3]
const policiesReducer = (listOfPolicies = [], action) => {
  if (action.type === 'CREATE_POLICY') {
    return [...listOfPolicies, action.payload.name];
  } else if (action.type === 'DELETE_POLICY') {
    return listOfPolicies.filter(name => name !== action.payload.name);
  }
  return listOfPolicies;
};
