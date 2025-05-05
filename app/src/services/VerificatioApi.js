import axios from 'axios';

const verificationApi = axios.create({
    baseURL: 'http://localhost:5260/api/Verificacao',
    headers: { 'Content-Type': 'application/json'}
});

export default verificationApi