import axios from 'axios';

const API_KEY = 'e6b5ae2998d50eb8dc414bef80eef5bf';
//Using Back Ticks  ES6 Syntax
const ROOT_URL = `http://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}`;

// Keeping our ACTION TYPES consistent between our ACTION CREATORS and REDUCERS
// We can just jave single canonica source of action type right here
export const FETCH_WEATHER = 'FETCH_WEATHER';

export function fetchWeather(city) {
    const url = `${ROOT_URL}&q=${city},us`;
    const request = axios.get(url);  //Axios returns a PROMISE (The Promise don't have any data yet)

    console.log('Request:', request);

    return {
        type: FETCH_WEATHER,
        payload: request // ==>> VERY important Right HERE
    }
}

//### => REMEMBER:
        // Redux Promise is a middleware with the ability to stop or maniplate actions 
        // before they hit any reduce or whatsoever
        //Redux Promise sees this in-coming action you know as the gatekeeper
        // So It Stops the Action and it waits until the promise resolves and then it says OK I've got the resolved data.

// ####      REDUCER - PROMISSE         ####    //
//                                              //
//         MIDDLEWARE     BETWEEN               //
//                                              //
//        featchWeather -> reducer_weather      //

//Reducer-Promise It's llok at specifically the PAYLOAD property
// If the PAYLOAD is a promise, Redux Promise stops the action entirely.
// And Once the request fisinhes IT DISPATCHES a New Action of the Same Type,Of the RESOLVED REQUEST.
// It Creates a New Action the Same Type Expected with the Result of the Request