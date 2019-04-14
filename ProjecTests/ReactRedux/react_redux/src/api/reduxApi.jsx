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

/** ####  REDUCERS  ###    */

//  Reducers (Departments!) 

const claimsHistory = (oldListOfClaims, action) => {
    if (action.type === 'CREATE_CLAIM'){
      //WE CARE ABOUT THIS ACTION (fomr!)
      //[... get allthe records inside there (ES2015)
      //And Add to a New Brand Array  !! Verry Important
      //REDUX Is all writTe Correctly BY ALWAYS CREATING NEW ARRAYS
      // oldListOfClaims.push(action.payload); //It Modifies the current array
      
      return [...oldListOfClaims, action.payload]
    }
    
    //we don't care the acrion (form!)
    return oldListOfClaims
  };