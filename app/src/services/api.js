import axios from 'axios';

const API_URL = 'https://localhost:7024/api/Aluno';

export const api_img = 'https://localhost:7024'

const api = axios.create({
    baseURL: API_URL,
    headers: {"Content-Type": 'application/json'}
});

export default api;