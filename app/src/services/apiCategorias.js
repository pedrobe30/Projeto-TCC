import axios from "axios";

const API_URL = 'http://10.0.0.168:5260/api';

const apiCategorias = axios.create({
    baseURL: API_URL,
    headers: {"Content-Type": 'application/json'}
}); 

export default apiCategorias;