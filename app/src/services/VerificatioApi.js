import axios from 'axios';

const verificationApi = axios.create({
    baseURL: 'https://localhost:7024/api/Verificacao',
    headers: { 'Content-Type': 'application/json'}
});

export default verificationApi