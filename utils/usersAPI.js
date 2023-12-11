import axios from 'axios';

const userHttp = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'referer': 'user-api-v1.0',
    },
    credentials: true
})

export { userHttp }