// api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5260/api';

// Crie uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Serviço específico para produtos
export const produtoService = {
  // Obter todos os produtos
  getAllProdutos: async () => {
    try {
      const response = await api.get('/Produto');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

};

export default api;