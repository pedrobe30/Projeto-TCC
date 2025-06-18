import axios from "axios";

const loginApi = axios.create({
    baseURL: 'http://172.18.101.2:7024/api/Login',
    headers: { 'Content-Type': 'application/json'}
});

export default loginApi