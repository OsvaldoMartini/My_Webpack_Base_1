import axios from 'axios';

const API_KEY = 'e6b5ae2998d50eb8dc414bef80eef5bf';
//Using Back Ticks  ES6 Syntax
const ROOT_URL = `http://api.openweathermap.org/data/2.5/forecast?q=London,us&appid=${API_KEY}`;

// Keeping our ACTION TYPES consistent between our ACTION CREATORS and REDUCERS
// We can just jave single canonica source of action type right here
export const FETCH_WEATHER = 'FETCH_WEATHER';

export function fetchWeather() {
    const url = `${ROOT_URL}&q=${city},us`;
    const request = axios.get(url);

    return {
        type: FETCH_WEATHER,
        payload: request
    }
}