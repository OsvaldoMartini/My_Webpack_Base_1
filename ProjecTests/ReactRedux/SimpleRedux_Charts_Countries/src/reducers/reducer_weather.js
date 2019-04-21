import { FETCH_WEATHER } from '../actions/index';
//Expecting Array state = [] Initialization
export default function (state = [], action) {
    console.log('Action Received', action);
    switch (action.type) {
        case (FETCH_WEATHER):
            //We only have the concept of one searchable city one active city at a time
            //TODO: THIS DO NOT COLLECT CITIES OVER TIME 
            //return [action.payload.data];  //Test only not create a list or searcheable, just one 

            // ### SUBLE TRAPS DON'T DO IT !!!!!
            // ### THIS LINE OF CODE IS OPENING UP A HUGE CAN OF WORMS  => "... state.push(action ...."
            // THIS IS MUTATING THE ARRAY NEVER DO IT IT INSIDE OF REDUX USE "...CONCAT..."
            //return state.push(action.payload.data); (SUBLE TRAP)



            // THIS IS TOPIC OF STATE AND ROCK COMPONENT
            // => THE TWO KNOW WAYS TO DO IT IS UNDERNIF
            // => this return new version of the OLD  STATE array
            //TODO: THIS COLLECT CITIES OVER TIME 
            //return state.concat([action.payload.data]);  //THIS IS CORRECT

            //  OR 
            // => other approach this end Up with Kind of array [city,city,city,.....] and Not [city, [city, city]]
            //TODO: THIS COLLECT CITIES OVER TIME 
            return [action.payload.data, ...state];  //THIS IS CORRECT

    }
    return state;
}


// ####      REDUCER - PROMISSE         ####    //
//                                              //
//         MIDDLEWARE     BETWEEN               //
//                                              //
//        featchWeather -> reducer_weather      //

//Reducer-Promise It's llok at specifically the PAYLOAD property
// If the PAYLOAD is a promise, Redux Promise stops the action entirely.
// And Once the request fisinhes IT DISPATCHES a New Action of the Same Type,Of the RESOLVED REQUEST.
// It Creates a New Action the Same Type Expected with the Result of the Request