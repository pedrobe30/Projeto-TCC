// app/src/services/AlunoService.js
import api from './api';
import StorageService from './StorageService';

export async function criarAluno({ NomeAlu, Rm, EmailAlu, SenhaAlu, IdEsc }) {
  try {
    const response = await api.post('/CriarAluno', {
      NomeAlu,
      Rm,
      EmailAlu,
      SenhaAlu,
      IdEsc,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.Mensagem || 'Erro no servidor');
    } else {
      throw new Error('Não foi possível conectar-se à API');
    }
  }
}

export async function obterPerfilAluno(idAluno) {
  try {
    console.log('[ALUNO_SERVICE] Buscando perfil para idAluno:', idAluno);
    
    // 1) Recupera token salvo
    const token = await StorageService.getToken();
    if (!token) {
      throw new Error('Token não encontrado. Faça login novamente.');
    }
    
    console.log('[ALUNO_SERVICE] Token encontrado, fazendo requisição...');
    
    // Lista de possíveis endpoints para tentar
    const possiveisEndpoints = [
      `/Aluno/${idAluno}`,
      `/aluno/${idAluno}`,
      `/Alunos/${idAluno}`,
      `/alunos/${idAluno}`,
      `/api/Aluno/${idAluno}`,
      `/api/aluno/${idAluno}`,
      `/Usuario/${idAluno}`,
      `/usuario/${idAluno}`,
      `/Perfil/${idAluno}`,
      `/perfil/${idAluno}`
    ];
    
    let ultimoErro = null;
    
    // Tenta cada endpoint até encontrar um que funcione
    for (const endpoint of possiveisEndpoints) {
      try {
        console.log(`[ALUNO_SERVICE] Tentando endpoint: ${endpoint}`);
        
        const response = await api.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('[ALUNO_SERVICE] Resposta da API recebida:', {
          status: response.status,
          data: response.data,
          endpoint: endpoint
        });
        
        // Suporta tanto response.data.data quanto response.data
        const perfil = response.data.data || response.data;
        console.log('[ALUNO_SERVICE] Perfil processado:', perfil);
        
        // Se chegou até aqui, o endpoint funcionou
        return perfil;
        
      } catch (endpointError) {
        console.log(`[ALUNO_SERVICE] Endpoint ${endpoint} falhou:`, {
          status: endpointError.response?.status,
          message: endpointError.message
        });
        ultimoErro = endpointError;
        
        // Se não for 404, pode ser um erro mais sério, então para de tentar
        if (endpointError.response?.status && endpointError.response.status !== 404) {
          break;
        }
        
        // Continua tentando outros endpoints
        continue;
      }
    }
    
    // Se chegou até aqui, nenhum endpoint funcionou
    throw ultimoErro || new Error('Nenhum endpoint de perfil funcionou');
    
  } catch (error) {
    console.error('[ALUNO_SERVICE] Erro ao obter perfil:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response) {
      // Erro HTTP com resposta do servidor
      const status = error.response.status;
      const message = error.response.data?.Mensagem || error.response.data?.message;
      
      if (status === 401) {
        throw new Error('Token expirado ou inválido. Faça login novamente.');
      } else if (status === 404) {
        // Em vez de lançar erro, retorna um objeto vazio ou com dados básicos
        console.warn('[ALUNO_SERVICE] Perfil não encontrado, retornando dados básicos');
        
        // Tenta extrair dados básicos do token como fallback
        try {
          const { jwtDecode } = require('jwt-decode');
          const token = await StorageService.getToken();
          const decoded = jwtDecode(token);
          
          return {
            IdAluno: idAluno,
            IdEsc: decoded.IdEsc || decoded.idEscola || decoded.schoolId || null,
            NomeAlu: decoded.nome || decoded.name || 'Usuário',
            EmailAlu: decoded.email || '',
            // Outros campos que possam existir no token
            ...decoded
          };
        } catch (tokenError) {
          console.error('[ALUNO_SERVICE] Erro ao extrair dados do token:', tokenError);
          throw new Error('Perfil do aluno não encontrado e não foi possível extrair dados do token.');
        }
      } else if (status === 403) {
        throw new Error('Acesso negado. Verifique suas permissões.');
      } else {
        throw new Error(message || `Erro do servidor (${status})`);
      }
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outros erros
      throw new Error(error.message || 'Erro inesperado ao obter perfil do aluno');
    }
  }
}

// Nova função para verificar se o endpoint de perfil está disponível
export async function verificarEndpointPerfil(idAluno) {
  const token = await StorageService.getToken();
  if (!token) return null;
  
  const possiveisEndpoints = [
    `/Aluno/${idAluno}`,
    `/aluno/${idAluno}`,
    `/Alunos/${idAluno}`,
    `/api/Aluno/${idAluno}`,
    `/Usuario/${idAluno}`,
    `/Perfil/${idAluno}`
  ];
  
  for (const endpoint of possiveisEndpoints) {
    try {
      const response = await api.head(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        console.log(`[ALUNO_SERVICE] Endpoint funcionando: ${endpoint}`);
        return endpoint;
      }
    } catch (error) {
      continue;
    }
  }
  
  return null;
}