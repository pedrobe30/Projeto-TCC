import axios from "axios";

const loginApi = axios.create({
    baseURL: 'http://10.0.0.168:5260/api/Login',
    headers: { 'Content-Type': 'application/json'}
});

export default loginApi