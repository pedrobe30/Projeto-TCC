import axios from 'axios';

const API_URL = 'http://10.0.0.168:5260/api'; // Mude para a URL do seu backend

export const cadastrarAdmin = async (adminData) => {
    try {
        const response = await axios.post(`${API_URL}/Admin`, adminData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar administrador:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

export const checkEmailExists = async (email) => {
    try {
        const response = await axios.get(`${API_URL}/Admin/check-email/${email}`);
        return response.data.emailExists;
    } catch (error) {
        console.error('Erro ao verificar email:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};