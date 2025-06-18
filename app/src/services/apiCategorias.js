import axios from "axios";

const API_URL = 'http://172.18.101.2:7024/api';

const apiCategorias = axios.create({
    baseURL: API_URL,
    headers: {"Content-Type": 'application/json'}
}); 

export default apiCategorias;