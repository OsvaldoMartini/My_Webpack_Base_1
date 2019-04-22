import axios from "../../plugins/axios.js";

export default axios.create({
    baseURL: 'https://api.unsplash.com',
    headers: {
        Authorization: 'Client-ID 43d68399a648aab9b8b72502c3feddddabbc9399d2d5f0cdd2df7a284d27c64f'
    }
});