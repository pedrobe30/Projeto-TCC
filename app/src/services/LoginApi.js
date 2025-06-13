import axios from "axios";

const loginApi = axios.create({
    baseURL: 'https://localhost:7024/api/Login',
    headers: { 'Content-Type': 'application/json'}
});

export default loginApi