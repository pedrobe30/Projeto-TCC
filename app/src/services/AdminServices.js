import axios from 'axios';

const API_URL = 'http://10.0.0.168:5260/api'; // Mude para a URL do seu backend

export const cadastrarAdmin = async (adminData) => {
    try {
        console.log('Enviando dados para:', `${API_URL}/Admin`);
        console.log('Dados:', adminData);
        
        const response = await axios.post(`${API_URL}/Admin`, adminData, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 segundos de timeout
        });
        
        console.log('Resposta do servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro completo:', error);
        
        if (error.response) {
            // O servidor respondeu com um status de erro
            console.error('Erro de resposta:', error.response.data);
            console.error('Status:', error.response.status);
            
            // Extrair mensagem de erro específica
            if (error.response.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response.data?.errors) {
                // Tratar erros de validação do ModelState
                const errorMessages = Object.values(error.response.data.errors).flat();
                throw new Error(errorMessages.join(', '));
            } else if (typeof error.response.data === 'string') {
                throw new Error(error.response.data);
            } else {
                throw new Error(`Erro do servidor: ${error.response.status}`);
            }
        } else if (error.request) {
            // A requisição foi feita mas não houve resposta
            console.error('Erro de requisição:', error.request);
            throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
            // Algo aconteceu na configuração da requisição
            console.error('Erro de configuração:', error.message);
            throw new Error(error.message || 'Erro desconhecido');
        }
    }
};

export const checkEmailExists = async (email) => {
    try {
        console.log('Verificando email:', email);
        
        const response = await axios.get(`${API_URL}/Admin/check-email/${encodeURIComponent(email)}`, {
            timeout: 5000, // 5 segundos de timeout
        });
        
        console.log('Resposta da verificação de email:', response.data);
        return response.data.emailExists;
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        
        if (error.response) {
            console.error('Erro de resposta na verificação de email:', error.response.data);
            // Se houver erro na verificação de email, retornar false para não bloquear o cadastro
            return false;
        } else if (error.request) {
            console.error('Erro de requisição na verificação de email:', error.request);
            return false;
        } else {
            console.error('Erro de configuração na verificação de email:', error.message);
            return false;
        }
    }
};