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

//MAKING SURE THE REDUCERS IS BEING CALLED FOR THE VERY FIRST TIME
const claimsHistory = (oldListOfClaims = [], action) => {
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


//Reducer 'Accounting' department  
  const accounting = (bagOfMoney = 100, action) => {
    if (action.type ==='CREATE_CLAIM'){
        //When is creating new CLAIM, then we're going to return bag Of Money LESS payload.amount of money
        return bagOfMoney - action.payload.amountOfMoneyToCollect;
    } else if (action.type === 'CREATE_POLICY') {
        //When is creating new POLICY, then we're going to return bag Of Money PLUS payload.amount of money
        return bagOfMoney + action.payload.amount;
    }

    return bagOfMoney;
}


//Reducer Create Policy
const policies = (listOfPolicies = [], action) => {
    if (action.type ==='CREATE_POLICY') {
        return [...listOfPolicies,action.payload.name];
    } else if (action.type === 'DELETE_POLICY') {
        return listOfPolicies.filter(name => name !=== action.payload.name);
    }
    return listOfPolicies;
}