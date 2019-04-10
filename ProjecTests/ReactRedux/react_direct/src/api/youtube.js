import axios from '../plugins/axios.js';

const KEY = 'AIzaSyCL_-ee9MYvoHQGUROpyNRQZ9zlbY6mZCY';

export default axios.create ({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
        part: 'snippet',
        maxResults: 5,
        key: KEY
    }
});