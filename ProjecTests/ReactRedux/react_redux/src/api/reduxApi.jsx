console.clear();

//  Actions (Forms!) 

const createPolicy = (name, amount) => {
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
        type: 'DELETE_POLICY',
        payload: {
          name: name
        }
    }
}

const createClaim = (name, amountOfMoneyToCollect) => {
    return {
        type: 'CREATE_CLAIM',
        payload: {
            name: name,
            amountOfMoneyToCollect: amountOfMoneyToCollect
        }
    }
}

//  Every single "Creator" returns a plain javascript object which refer to as an action 
//  And an action has a "type" and "payload"
