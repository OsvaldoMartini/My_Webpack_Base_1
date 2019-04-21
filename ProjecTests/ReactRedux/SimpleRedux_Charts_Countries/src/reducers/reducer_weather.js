export default function (state = null, action) {
    console.log('Action Received', action);
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