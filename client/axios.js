import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // This is required for sending cookies
    headers: {
        'Content-Type': 'application/json' // ensure it's JSON
    }
});

export default api;