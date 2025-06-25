// app/src/services/LoginAdmService.js
import axios from 'axios';

// Configure sua URL base aqui
const API_BASE_URL = 'http://10.0.0.168:5260'; // Ajuste conforme necessário
const AUTH_API_URL = `${API_BASE_URL}/api/Auth`;

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

        console.log('[LoginAdmService] Resposta completa:', response.data);
        
        // A resposta do backend já vem com a estrutura correta
        // Vamos extrair o token da resposta (assumindo que vem no campo 'token')
        const responseData = response.data;
        
        if (responseData && responseData.token) {
            return {
                success: true,
                token: responseData.token,
                data: {
                    idAdm: responseData.idAdm,
                    email: responseData.email,
                    nome: responseData.nome,
                    idEmpresa: responseData.idEmpresa,
                    nomeEmpresa: responseData.nomeEmpresa,
                    dataLogin: responseData.dataLogin
                },
                message: responseData.message || 'Login realizado com sucesso'
            };
        } else {
            // Se não tem token na resposta, talvez seja uma estrutura diferente
            // Vamos adaptar para o que o frontend espera
            return {
                success: false,
                message: responseData.message || 'Token não encontrado na resposta'
            };
        }
    } catch (error) {
        console.error('[LoginAdmService] Erro no login:', error);
        
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || 'Erro ao fazer login.';
            throw new Error(errorMessage);
        } else {
            throw new Error('Erro de rede ou servidor indisponível.');
        }
    }
};

export const validateAdminToken = async (token) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/validate-token`, token, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro na validação do token:', error);
        throw error;
    }
};

export const validateAdminTokenFromHeader = async (token) => {
    try {
        const response = await axios.get(`${AUTH_API_URL}/validate-token`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro na validação do token via header:', error);
        throw error;
    }
};

export const refreshAdminToken = async (token) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/refresh-token`, token, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro ao renovar token:', error);
        throw error;
    }
};

export const logoutAdmin = async (token) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/logout`, token, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro no logout:', error);
        throw error;
    }
};

export const logoutAdminFromHeader = async (token) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/logout-header`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro no logout via header:', error);
        throw error;
    }
};

export const getCurrentAdmin = async (token) => {
    try {
        const response = await axios.get(`${AUTH_API_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro ao obter dados do admin:', error);
        throw error;
    }
};

export const checkAdminToken = async (token) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/check-token`, token, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro ao verificar token:', error);
        throw error;
    }
};

export const alterarSenhaAdmin = async (token, senhaAtual, novaSenha) => {
    try {
        const response = await axios.put(`${AUTH_API_URL}/alterar-senha`, {
            senhaAtual,
            novaSenha
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro ao alterar senha:', error);
        throw error;
    }
};

export const esqueciSenhaAdmin = async (email, codigoPreciso, novaSenha) => {
    try {
        const response = await axios.put(`${AUTH_API_URL}/esqueci-senha`, {
            email,
            codigoPreciso,
            novaSenha
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('[LoginAdmService] Erro ao redefinir senha:', error);
        throw error;
    }
};