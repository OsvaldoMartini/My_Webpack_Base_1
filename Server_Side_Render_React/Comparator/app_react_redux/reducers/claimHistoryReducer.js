const claimHistoryReducer = function(oldListOfClaims = [], action) {
  if (action.type === 'CREATE_CLAIM') {
    return [...oldListOfClaims, action.payload];
  }
  return oldListOfClaims;
};
