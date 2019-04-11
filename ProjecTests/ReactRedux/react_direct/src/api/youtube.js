import axios from '../plugins/axios.js';

const KEY = 'AIzaSyCphzAQ2QLeu-mNSCYRiyydozqKlCXsEnw'; //martini.de.architect@gmail.com developers google api

export default axios.create ({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
        part: 'snippet',
        maxResults: 5,
        key: KEY
    }
});