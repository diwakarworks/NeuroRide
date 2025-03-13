import axios from "axios ";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const instance = axios.create({
    baseUrl : API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default instance;