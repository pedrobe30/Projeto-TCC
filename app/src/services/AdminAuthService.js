// app/src/services/AdminAuthService.js
import { jwtDecode } from 'jwt-decode';
import StorageService from './StorageService';
import { 
    validateAdminTokenFromHeader, 
    refreshAdminToken, 
    logoutAdminFromHeader,
    getCurrentAdmin,
    checkAdminToken 
} from './LoginAdmService';

class AdminAuthService {
    // Fazer requisições autenticadas para admin
    async apiClientAdmin(endpoint, options = {}) {
        const token = await StorageService.getAdminToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(endpoint, {
                ...options,
                headers,
            });

            // Se retornar 401, tenta renovar o token
            if (response.status === 401) {
                const refreshResult = await this.tryRefreshAdminToken();
                if (refreshResult) {
                    // Tenta novamente com o novo token
                    const newToken = await StorageService.getAdminToken();
                    const newHeaders = {
                        ...headers,
                        Authorization: `Bearer ${newToken}`,
                    };
                    
                    const retryResponse = await fetch(endpoint, {
                        ...options,
                        headers: newHeaders,
                    });

                    if (!retryResponse.ok) {
                        throw new Error(`HTTP error! status: ${retryResponse.status}`);
                    }

                    return retryResponse.json();
                } else {
                    // Se não conseguiu renovar, faz logout
                    await this.logoutAdmin();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('[AdminAuthService] Erro na requisição:', error);
            throw error;
        }
    }

    // Verificar se o token de admin ainda é válido
    async isAdminTokenValid() {
        try {
            const token = await StorageService.getAdminToken();
            
            if (!token) {
                console.log('[AdminAuthService] Token de admin não encontrado');
                return false;
            }

            // Primeiro, verifica localmente se o token expirou
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp && decoded.exp < currentTime) {
                    console.log('[AdminAuthService] Token de admin expirado localmente');
                    await StorageService.removeAdminToken();
                    await StorageService.removeAdminData();
                    return false;
                }
            } catch (decodeError) {
                console.error('[AdminAuthService] Erro ao decodificar token:', decodeError);
                await StorageService.removeAdminToken();
                await StorageService.removeAdminData();
                return false;
            }

            // Verifica com o servidor
            try {
                const result = await checkAdminToken(token);
                if (result && result.isValid) {
                    return true;
                } else {
                    console.log('[AdminAuthService] Token inválido no servidor');
                    await StorageService.removeAdminToken();
                    await StorageService.removeAdminData();
                    return false;
                }
            } catch (serverError) {
                console.error('[AdminAuthService] Erro ao verificar token no servidor:', serverError);
                // Se houve erro de rede, considera válido se não expirou localmente
                return true;
            }
        } catch (error) {
            console.error('[AdminAuthService] Erro ao validar token de admin:', error);
            return false;
        }
    }

    // Tentar renovar o token de admin
    async tryRefreshAdminToken() {
        try {
            const currentToken = await StorageService.getAdminToken();
            if (!currentToken) {
                console.log('[AdminAuthService] Não há token para renovar');
                return false;
            }

            const refreshResult = await refreshAdminToken(currentToken);
            
            if (refreshResult && refreshResult.token) {
                await StorageService.saveAdminToken(refreshResult.token);
                
                // Atualiza os dados do admin se disponível
                if (refreshResult.data) {
                    await StorageService.saveAdminData(refreshResult.data);
                }
                
                console.log('[AdminAuthService] Token renovado com sucesso');
                return true;
            } else {
                console.log('[AdminAuthService] Falha ao renovar token');
                return false;
            }
        } catch (error) {
            console.error('[AdminAuthService] Erro ao renovar token:', error);
            return false;
        }
    }

    // Fazer logout do admin
    async logoutAdmin() {
        try {
            const token = await StorageService.getAdminToken();
            
            if (token) {
                try {
                    await logoutAdminFromHeader(token);
                } catch (logoutError) {
                    console.warn('[AdminAuthService] Erro ao fazer logout no servidor:', logoutError);
                    // Continua com a limpeza local mesmo se der erro no servidor
                }
            }

            // Limpa dados locais
            await StorageService.removeAdminToken();
            await StorageService.removeAdminData();
            
            console.log('[AdminAuthService] Logout de admin realizado');
        } catch (error) {
            console.error('[AdminAuthService] Erro ao fazer logout:', error);
            // Mesmo com erro, tenta limpar os dados locais
            try {
                await StorageService.removeAdminToken();
                await StorageService.removeAdminData();
            } catch (cleanupError) {
                console.error('[AdminAuthService] Erro ao limpar dados locais:', cleanupError);
            }
        }
    }

    // Obter dados do admin atual
    async getCurrentAdminData() {
        try {
            const token = await StorageService.getAdminToken();
            if (!token) {
                return null;
            }

            // Primeiro tenta obter dos dados salvos localmente
            const localData = await StorageService.getAdminData();
            
            // Se não tem dados locais ou são muito antigos, busca do servidor
            if (!localData) {
                try {
                    const serverData = await getCurrentAdmin(token);
                    if (serverData) {
                        await StorageService.saveAdminData(serverData);
                        return serverData;
                    }
                } catch (serverError) {
                    console.warn('[AdminAuthService] Erro ao buscar dados do servidor:', serverError);
                }
            }

            return localData;
        } catch (error) {
            console.error('[AdminAuthService] Erro ao obter dados do admin:', error);
            return null;
        }
    }

    // Obter informações do token decodificado
    async getAdminTokenInfo() {
        try {
            const token = await StorageService.getAdminToken();
            if (!token) {
                return null;
            }

            const decoded = jwtDecode(token);
            return {
                issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
                expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
                issuer: decoded.iss,
                subject: decoded.sub,
                audience: decoded.aud,
                adminId: decoded.AdminId || decoded.adminId || decoded.id || decoded.sub,
                email: decoded.email || decoded.Email,
                nome: decoded.nome || decoded.Nome || decoded.name,
                role: decoded.role || decoded.Role,
                claims: decoded
            };
        } catch (error) {
            console.error('[AdminAuthService] Erro ao obter informações do token:', error);
            return null;
        }
    }

    // Verificar se o admin tem uma role específica
    async hasAdminRole(requiredRole = 'Admin') {
        try {
            const tokenInfo = await this.getAdminTokenInfo();
            if (!tokenInfo) {
                return false;
            }

            const userRole = tokenInfo.role || tokenInfo.claims?.role || tokenInfo.claims?.Role;
            return userRole === requiredRole;
        } catch (error) {
            console.error('[AdminAuthService] Erro ao verificar role:', error);
            return false;
        }
    }

    // Validar se a sessão de admin está ativa
    async validateAdminSession() {
        try {
            const isValid = await this.isAdminTokenValid();
            if (!isValid) {
                await this.logoutAdmin();
                return false;
            }

            const adminData = await this.getCurrentAdminData();
            return adminData !== null;
        } catch (error) {
            console.error('[AdminAuthService] Erro ao validar sessão de admin:', error);
            return false;
        }
    }

    // Método utilitário para debug
    async debugAdminAuth() {
        try {
            const token = await StorageService.getAdminToken();
            const adminData = await StorageService.getAdminData();
            const tokenInfo = await this.getAdminTokenInfo();
            const isValid = await this.isAdminTokenValid();

            console.log('[AdminAuthService] DEBUG INFO:', {
                hasToken: !!token,
                hasAdminData: !!adminData,
                tokenInfo,
                isValid,
                adminData
            });

            return {
                hasToken: !!token,
                hasAdminData: !!adminData,
                tokenInfo,
                isValid,
                adminData
            };
        } catch (error) {
            console.error('[AdminAuthService] Erro no debug:', error);
            return null;
        }
    }
}

export default new AdminAuthService();