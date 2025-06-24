import axios from "axios";

const Encomenda_URL = 'http://10.0.0.168:5260/api'
const EncomendaApi = axios.create({
    baseURL: Encomenda_URL,
    headers: { 'Content-Type': 'application/json'}
});

export default EncomendaApi