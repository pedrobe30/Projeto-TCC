import axios from 'axios';

const verificationApi = axios.create({
    baseURL: 'http://172.18.101.2:7024/api/Verificacao',
    headers: { 'Content-Type': 'application/json'}
});

export default verificationApi