import axios from "axios";

const API_URL = 'https://localhost:7024/api';

const apiCategorias = axios.create({
    baseURL: API_URL,
    headers: {"Content-Type": 'application/json'}
}); 

export default apiCategorias;