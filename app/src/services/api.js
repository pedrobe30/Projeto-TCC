import axios from 'axios';

const API_URL = 'http://10.0.0.168:5260/api/Aluno';

export const api_img = 'http://10.0.0.168:5260'

const api = axios.create({
    baseURL: API_URL,
    headers: {"Content-Type": 'application/json'}
});

export default api;