console.clear();

const createPolicy = (name, amout) => {
  return {
    type: 'CREATE_POLICY',
      payload: {
        name: name,  
        amount: amount 
      }
  }
}

const deletePolicy = (name) => {
    return {
        type: DELETE_POLICY,
        payload: {
            names: name
        }
    }
}