const API_KEY = 'e6b5ae2998d50eb8dc414bef80eef5bf';

// Keeping our ACTION TYPES consistent between our ACTION CREATORS and REDUCERS
// We can just jave single canonica source of action type right here
export const FETCH_WEATHER = 'FETCH_WEATHER';

export function fetchWeather() {
    return {
        type: FETCH_WEATHER
    }
}