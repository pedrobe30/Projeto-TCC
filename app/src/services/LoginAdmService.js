// app/src/services/LoginAdmService.js
import axios from 'axios';
import { API_BASE_URL } from './config'; // Você precisará definir esta constante

const AUTH_API_URL = `${API_BASE_URL}/Auth`; // Ajuste o endpoint se necessário

export const loginAdmin = async (email, senha) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/login`, {
            email,
            senha,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Erro ao fazer login.');
        } else {
            throw new Error('Erro de rede ou servidor indisponível.');
        }
    }
};

// Você pode adicionar outras funções relacionadas a autenticação de admin aqui, se precisar
// Ex: export const forgotPasswordAdmin = async (email, codigoPreciso, novaSenha) => { ... }