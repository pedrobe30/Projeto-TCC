import axios from "axios";

const loginApi = axios.create({
    baseURL: 'http://localhost:5260/api/Login',
    headers: { 'Content-Type': 'application/json'}
});

export default loginApi