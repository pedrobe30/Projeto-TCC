import axios from 'axios';

const verificationApi = axios.create({
    baseURL: 'http://10.0.0.168:5260/api/Verificacao',
    headers: { 'Content-Type': 'application/json'}
});

export default verificationApi