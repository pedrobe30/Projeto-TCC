  // app/src/services/StorageService.js
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { Platform } from 'react-native';
  import { jwtDecode } from 'jwt-decode';

  const isWeb = Platform.OS === 'web';

  const ADMIN_TOKEN_KEY = 'admin_token';
  const ADMIN_DATA_KEY = 'admin_data';

  class StorageService {
    async setItem(key, value) {
      try {
        console.log(`[STORAGE] Salvando ${key}:`, value);
        if (isWeb) {
          localStorage.setItem(key, value);
        } else {
          await AsyncStorage.setItem(key, value);
        }
      } catch (error) {
        console.error(`Erro ao salvar ${key}:`, error);
        throw error;
      }
    }

    async getItem(key) {
      try {
        let value;
        if (isWeb) {
          value = localStorage.getItem(key);
        } else {
          value = await AsyncStorage.getItem(key);
        }
        console.log(`[STORAGE] Recuperando ${key}:`, value);
        return value;
      } catch (error) {
        console.error(`Erro ao buscar ${key}:`, error);
        return null;
      }
    }

    async removeItem(key) {
      try {
        console.log(`[STORAGE] Removendo ${key}`);
        if (isWeb) {
          localStorage.removeItem(key);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch (error) {
        console.error(`Erro ao remover ${key}:`, error);
        throw error;
      }
    }

    async saveToken(token) {
      return this.setItem('token', token);
    }

    async getToken() {
      return this.getItem('token');
    }

    async removeToken() {
      return this.removeItem('token');
    }

    // Método para limpar todos os dados do usuário
    async clearUserData() {
      try {
        const keys = ['token', 'idAluno', 'idEscola', 'userData', 'userEmail', 'userName'];
        await Promise.all(keys.map(key => this.removeItem(key)));
        console.log('[STORAGE] Dados do usuário limpos');
      } catch (error) {
        console.error('[STORAGE] Erro ao limpar dados do usuário:', error);
      }
    }


    async getUserData() {
      try {
        console.log('[STORAGE] Iniciando getUserData...');
        
        const token = await this.getToken();
        if (!token) {
          console.log('[STORAGE] Token não encontrado');
          return null;
        }
        
        // Decodifica o token como objeto genérico para evitar erros de tipagem
        const decodedToken = jwtDecode(token);
        console.log('[STORAGE] DECODED TOKEN COMPLETO:', JSON.stringify(decodedToken, null, 2));
        
        // PRIORIDADE 1: Busca o ID do aluno em múltiplas possibilidades
        let idAluno = null;
        const possiveisIdAluno = [
          'IdAluno', 'idAluno', 'nameid', 'sub', 'id', 'userId', 'user_id', 
          'UserId', 'ID', 'Id', 'IDALUNO', 'aluno_id', 'AlunoId', 'studentId'
        ];
        
        for (const campo of possiveisIdAluno) {
          if (decodedToken[campo] && decodedToken[campo] !== '') {
            idAluno = decodedToken[campo];
            console.log(`[STORAGE] idAluno encontrado em '${campo}':`, idAluno);
            break;
          }
        }
        
        // Se não encontrou no token, tenta no storage
        if (!idAluno) {
          const idAlunoStorage = await this.getItem('idAluno');
          if (idAlunoStorage) {
            idAluno = idAlunoStorage;
            console.log('[STORAGE] idAluno obtido do storage:', idAluno);
          }
        }
        
        // PRIORIDADE 2: Busca o ID da escola em múltiplas possibilidades
        let idEscola = null;
        const possiveisIdEscola = [
          'IdEscola', 'idEscola', 'IdEsc', 'idEsc', 'schoolId', 'school_id', 
          'SchoolId', 'IDESCOLA', 'escola_id', 'EscolaId', 'escolaId',
          'institution_id', 'institutionId', 'org_id', 'orgId', 'Escola', 'escola'
        ];
        
        for (const campo of possiveisIdEscola) {
          if (decodedToken[campo] && decodedToken[campo] !== '') {
            idEscola = decodedToken[campo];
            console.log(`[STORAGE] idEscola encontrado em '${campo}':`, idEscola);
            break;
          }
        }
        
        // Se não encontrou no token, tenta no storage
        if (!idEscola) {
          const idEscolaStorage = await this.getItem('idEscola');
          if (idEscolaStorage) {
            idEscola = idEscolaStorage;
            console.log('[STORAGE] idEscola obtido do storage:', idEscola);
          }
        }
        
        // PRIORIDADE 3: Busca outros dados do usuário
        let email = null;
        const possiveisEmail = ['email', 'Email', 'EMAIL', 'emailAddress', 'mail', 'userEmail'];
        for (const campo of possiveisEmail) {
          if (decodedToken[campo] && decodedToken[campo] !== '') {
            email = decodedToken[campo];
            console.log(`[STORAGE] email encontrado em '${campo}':`, email);
            break;
          }
        }
        
        if (!email) {
          email = await this.getItem('userEmail');
        }
        
        let nome = null;
        const possiveisNome = ['nome', 'Nome', 'name', 'Name', 'fullName', 'userName', 'displayName'];
        for (const campo of possiveisNome) {
          if (decodedToken[campo] && decodedToken[campo] !== '') {
            nome = decodedToken[campo];
            console.log(`[STORAGE] nome encontrado em '${campo}':`, nome);
            break;
          }
        }
        
        if (!nome) {
          nome = await this.getItem('userName');
        }

        // MONTA O OBJETO DE DADOS DO USUÁRIO
        const userData = {
          idAluno: idAluno ? idAluno.toString() : null,
          idEscola: idEscola ? idEscola.toString() : null,
          email: email || '',
          nome: nome || 'Usuário',
          token: token,
          decodedToken: decodedToken // Mantém o token completo para debug
        };

        console.log('[STORAGE] userData final montado:', JSON.stringify(userData, null, 2));
        
        // VALIDAÇÃO CRÍTICA: Verifica se pelo menos o idAluno foi encontrado
        if (!userData.idAluno) {
          console.error('[STORAGE] ERRO CRÍTICO: ID do aluno não encontrado no token nem no storage');
          console.error('[STORAGE] Campos disponíveis no token:', Object.keys(decodedToken));
          
          // Tenta uma última estratégia: busca qualquer campo numérico que possa ser o ID
          const camposNumericos = Object.keys(decodedToken).filter(key => {
            const valor = decodedToken[key];
            return typeof valor === 'number' || (typeof valor === 'string' && !isNaN(parseInt(valor, 10)));
          });
          
          console.log('[STORAGE] Campos numéricos disponíveis:', camposNumericos);
          
          if (camposNumericos.length > 0) {
            const primeiroNumerico = camposNumericos[0];
            userData.idAluno = decodedToken[primeiroNumerico].toString();
            console.log(`[STORAGE] Usando campo numérico '${primeiroNumerico}' como idAluno:`, userData.idAluno);
          } else {
            return null;
          }
        }

        // ESTRATÉGIA ADICIONAL PARA idEscola: Se ainda não tem, tenta extrair de outros lugares
        if (!userData.idEscola) {
          console.log('[STORAGE] Tentando estratégias adicionais para idEscola...');
          
          // Verifica se há dados de usuário salvos anteriormente
          try {
            const userDataSalvo = await this.getItem('userData');
            if (userDataSalvo) {
              const parsedUserData = JSON.parse(userDataSalvo);
              if (parsedUserData.idEscola) {
                userData.idEscola = parsedUserData.idEscola;
                console.log('[STORAGE] idEscola obtido de userData salvo:', userData.idEscola);
              }
            }
          } catch (e) {
            console.log('[STORAGE] Não foi possível recuperar userData salvo');
          }
        }

        return userData;
      } catch (error) {
        console.error('[STORAGE] Erro crítico ao obter dados do usuário:', error);
        return null;
      }
    }

    // Método para salvar dados completos do usuário
    async saveUserData(userData) {
      try {
        await this.setItem('userData', JSON.stringify(userData));
        
        // Salva também dados individuais para acesso mais fácil
        if (userData.idAluno) {
          await this.setItem('idAluno', userData.idAluno.toString());
        }
        if (userData.idEscola) {
          await this.setItem('idEscola', userData.idEscola.toString());
        }
        if (userData.email) {
          await this.setItem('userEmail', userData.email);
        }
        if (userData.nome) {
          await this.setItem('userName', userData.nome);
        }
        
        console.log('[STORAGE] Dados do usuário salvos completamente');
      } catch (error) {
        console.error('[STORAGE] Erro ao salvar dados do usuário:', error);
        throw error;
      }
    }

     async saveAdminToken(token) {
    return this.setItem(ADMIN_TOKEN_KEY, token);
  }

  async getAdminToken() {
    return this.getItem(ADMIN_TOKEN_KEY);
  }

  async removeAdminToken() {
    return this.removeItem(ADMIN_TOKEN_KEY);
  }
  
  async saveAdminData(data) {
    return this.setItem(ADMIN_DATA_KEY, JSON.stringify(data));
  }

  async getAdminData() {
    const data = await this.getItem(ADMIN_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  async removeAdminData() {
    return this.removeItem(ADMIN_DATA_KEY);
  }
  
  async isAdminTokenValid() {
    try {
      const token = await this.getAdminToken();
      if (!token) return false;

      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp && decoded.exp < currentTime) {
        await this.removeAdminToken(); // Limpa token expirado
        await this.removeAdminData();
        return false;
      }
      return true;
    } catch (error) {
      console.error('[STORAGE] Erro ao validar token de admin:', error);
      return false;
    }
  }

    // Método para verificar se o token é válido
    async isTokenValid() {
      try {
        const token = await this.getToken();
        if (!token) {
          return false;
        }

        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Verifica se o token expirou
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('[STORAGE] Token expirado');
          await this.clearUserData();
          return false;
        }

        return true;
      } catch (error) {
        console.error('[STORAGE] Erro ao validar token:', error);
        return false;
      }
    }

    // Método para obter informações específicas do token
    async getTokenInfo() {
      try {
        const token = await this.getToken();
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
          claims: decoded
        };
      } catch (error) {
        console.error('[STORAGE] Erro ao obter informações do token:', error);
        return null;
      }
    }

    // Método melhorado para atualizar idEscola
    async updateIdEscola(idEscola) {
      try {
        const id = parseInt(idEscola, 10);
        if (isNaN(id) || id <= 0) {
          throw new Error('ID da escola deve ser um número válido maior que zero.');
        }
        
        await this.setItem('idEscola', id.toString());
        
        // Atualiza também nos dados completos do usuário
        try {
          const userData = await this.getUserData();
          if (userData) {
            userData.idEscola = id.toString();
            await this.saveUserData(userData);
          }
        } catch (updateError) {
          console.warn('[STORAGE] Não foi possível atualizar userData:', updateError);
        }
        
        console.log('[STORAGE] idEscola atualizado com sucesso:', id);
      } catch (error) {
        console.error('[STORAGE] Erro ao atualizar idEscola:', error);
        throw error;
      }
    }

    // Método para debug - lista todas as chaves salvas
    async getAllKeys() {
      try {
        let keys;
        if (isWeb) {
          keys = Object.keys(localStorage);
        } else {
          keys = await AsyncStorage.getAllKeys();
        }
        console.log('[STORAGE] Todas as chaves:', keys);
        return keys;
      } catch (error) {
        console.error('[STORAGE] Erro ao obter chaves:', error);
        return [];
      }
    }

    // Método para debug - mostra todos os dados salvos
    async debugStorage() {
      try {
        const keys = await this.getAllKeys();
        const data = {};
        
        for (const key of keys) {
          data[key] = await this.getItem(key);
        }
        
        console.log('[STORAGE] DEBUG - Todos os dados:', data);
        return data;
      } catch (error) {
        console.error('[STORAGE] Erro no debug:', error);
        return {};
      }
    }

    // Método para forçar refresh dos dados do usuário
    async refreshUserData() {
      try {
        console.log('[STORAGE] Atualizando dados do usuário...');
        const userData = await this.getUserData();
        
        if (userData) {
          await this.saveUserData(userData);
          console.log('[STORAGE] Dados do usuário atualizados com sucesso');
          return userData;
        }
        
        return null;
      } catch (error) {
        console.error('[STORAGE] Erro ao atualizar dados do usuário:', error);
        return null;
      }
    }

    // Método para obter apenas o idEscola de forma robusta
    async getIdEscola() {
      try {
        // Primeiro tenta do storage direto
        let idEscola = await this.getItem('idEscola');
        
        if (!idEscola) {
          // Se não tem no storage, tenta extrair dos dados do usuário
          const userData = await this.getUserData();
          if (userData && userData.idEscola) {
            idEscola = userData.idEscola;
            // Salva no storage para próximas consultas
            await this.setItem('idEscola', idEscola);
          }
        }
        
        return idEscola ? parseInt(idEscola, 10) : null;
      } catch (error) {
        console.error('[STORAGE] Erro ao obter idEscola:', error);
        return null;
      }
    }

    // Método para obter apenas o idAluno de forma robusta
    async getIdAluno() {
      try {
        // Primeiro tenta do storage direto
        let idAluno = await this.getItem('idAluno');
        
        if (!idAluno) {
          // Se não tem no storage, tenta extrair dos dados do usuário
          const userData = await this.getUserData();
          if (userData && userData.idAluno) {
            idAluno = userData.idAluno;
            // Salva no storage para próximas consultas
            await this.setItem('idAluno', idAluno);
          }
        }
        
        return idAluno ? parseInt(idAluno, 10) : null;
      } catch (error) {
        console.error('[STORAGE] Erro ao obter idAluno:', error);
        return null;
      }
    }

    // Método para validar se os dados essenciais estão presentes
    async validateUserData() {
      try {
        const userData = await this.getUserData();
        
        if (!userData) {
          return { isValid: false, missing: ['userData'] };
        }
        
        const missing = [];
        
        if (!userData.idAluno) missing.push('idAluno');
        if (!userData.idEscola) missing.push('idEscola');
        if (!userData.token) missing.push('token');
        
        return {
          isValid: missing.length === 0,
          missing: missing,
          userData: userData
        };
      } catch (error) {
        console.error('[STORAGE] Erro ao validar dados do usuário:', error);
        return { isValid: false, missing: ['error'], error: error.message };
      }
    }
  }

  export default new StorageService();