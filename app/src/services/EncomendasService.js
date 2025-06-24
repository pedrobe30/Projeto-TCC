// app/src/services/EncomendasService.js

import EncomendaApi from './EncomendaApi';
import StorageService from './StorageService';

class EncomendaService {
  constructor() {
    this.baseUrl = '/Encomenda';
  }

  async criarEncomenda(itensCarrinho) {
    console.log('[DEBUG] Iniciando criarEncomenda...');
    
    const userData = await StorageService.getUserData();
    console.log('[DEBUG] userData obtido:', userData);
    
    if (!userData || !userData.idAluno) {
      throw new Error('Dados do usuário não encontrados. Faça login novamente.');
    }

    // Estratégia mais robusta para obter idEscola
    let idEscola = await this.obterIdEscola(userData);
    console.log('[DEBUG] idEscola final obtido:', idEscola);

    if (!idEscola) {
      // Se não conseguiu obter idEscola, tenta estratégias alternativas
      idEscola = await this.tentarEstrategiasAlternativasIdEscola(userData);
      console.log('[DEBUG] idEscola obtido com estratégias alternativas:', idEscola);
    }

    if (!idEscola) {
      // Como último recurso, permite que o usuário informe manualmente
      console.error('[DEBUG] Todas as tentativas de obter idEscola falharam');
      throw new Error('ESCOLA_NAO_IDENTIFICADA'); // Erro específico para o frontend tratar
    }

    if (!itensCarrinho || itensCarrinho.length === 0) {
      throw new Error('O carrinho está vazio.');
    }

    // Monta o DTO esperado pelo backend
    const criarEncomendaDto = {
      IdAluno: parseInt(userData.idAluno, 10),
      IdEscola: parseInt(idEscola, 10),
      Itens: itensCarrinho.map(item => ({
        IdProduto: item.idProd,
        Quantidade: item.quantidade,
        Tamanho: item.tamanho || null
      }))
    };

    console.log('[DEBUG] DTO final para envio:', JSON.stringify(criarEncomendaDto, null, 2));

    try {
      // Observe o wrapper 'criarEncomendaDto' exigido pelo Swagger
      const response = await EncomendaApi.post(this.baseUrl,  criarEncomendaDto );
      console.log('[DEBUG] Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error('[DEBUG] Erro ao criar encomenda:', error.response?.data || error.message);
      // Se vierem erros de validação, lança mensagem mais completa
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : error.response?.data?.message;
      throw new Error(msg || 'Ocorreu um erro ao processar sua encomenda.');
    }
  }

  // Método separado para obter idEscola de forma mais robusta
  async obterIdEscola(userData) {
    console.log('[DEBUG] Iniciando obterIdEscola...');
    
    // 1. Tenta obter do userData
    let idEscola = userData.idEscola;
    console.log('[DEBUG] idEscola do userData:', idEscola);
    
    if (idEscola && !isNaN(parseInt(idEscola, 10))) {
      return parseInt(idEscola, 10);
    }

    // 2. Tenta buscar no storage
    try {
      const idEscolaStorage = await StorageService.getItem('idEscola');
      console.log('[DEBUG] idEscola do storage:', idEscolaStorage);
      if (idEscolaStorage && !isNaN(parseInt(idEscolaStorage, 10))) {
        idEscola = parseInt(idEscolaStorage, 10);
        return idEscola;
      }
    } catch (storageError) {
      console.warn('[DEBUG] Erro ao buscar idEscola no storage:', storageError);
    }

    // 3. Tenta buscar do token decodificado (todas as possibilidades)
    try {
      const token = await StorageService.getToken();
      if (token) {
        const { jwtDecode } = require('jwt-decode');
        const decoded = jwtDecode(token);
        console.log('[DEBUG] Token decodificado completo:', JSON.stringify(decoded, null, 2));
        
        // Lista extensa de possíveis campos para idEscola
        const camposEscola = [
          'idEscola', 'IdEscola', 'IdEsc', 'idEsc', 'schoolId', 'school_id', 
          'SchoolId', 'IDESCOLA', 'escola_id', 'EscolaId', 'escolaId',
          'institution_id', 'institutionId', 'org_id', 'orgId'
        ];
        
        for (const campo of camposEscola) {
          if (decoded[campo] && !isNaN(parseInt(decoded[campo], 10))) {
            idEscola = parseInt(decoded[campo], 10);
            console.log(`[DEBUG] idEscola encontrado no token (${campo}):`, idEscola);
            
            // Salva no storage para futuras consultas
            await StorageService.setItem('idEscola', idEscola.toString());
            return idEscola;
          }
        }
      }
    } catch (tokenError) {
      console.warn('[DEBUG] Erro ao decodificar token:', tokenError);
    }

    // 4. Tenta buscar o perfil do aluno (com tratamento melhorado)
    try {
      console.log('[DEBUG] Tentando buscar perfil do aluno...');
      const { obterPerfilAluno } = require('./alunoService');
      const perfil = await obterPerfilAluno(parseInt(userData.idAluno, 10));
      console.log('[DEBUG] Perfil do aluno completo:', JSON.stringify(perfil, null, 2));
      
      // Lista extensa de possíveis campos para idEscola no perfil
      const camposEscolaPerfil = [
        'IdEsc', 'idEsc', 'idEscola', 'IdEscola', 'schoolId', 'school_id',
        'SchoolId', 'IDESCOLA', 'escola_id', 'EscolaId', 'escolaId',
        'institution_id', 'institutionId', 'org_id', 'orgId', 'Escola', 'escola'
      ];
      
      for (const campo of camposEscolaPerfil) {
        if (perfil[campo] && !isNaN(parseInt(perfil[campo], 10))) {
          idEscola = parseInt(perfil[campo], 10);
          console.log(`[DEBUG] idEscola encontrado no perfil (${campo}):`, idEscola);
          
          // Salva no storage para futuras consultas
          await StorageService.setItem('idEscola', idEscola.toString());
          return idEscola;
        }
      }
      
      // Se perfil tem dados mas sem idEscola numérico, verifica se há objetos aninhados
      if (perfil.escola && typeof perfil.escola === 'object') {
        const escolaObj = perfil.escola;
        for (const campo of ['id', 'Id', 'ID', 'idEscola', 'IdEscola']) {
          if (escolaObj[campo] && !isNaN(parseInt(escolaObj[campo], 10))) {
            idEscola = parseInt(escolaObj[campo], 10);
            console.log(`[DEBUG] idEscola encontrado no objeto escola (${campo}):`, idEscola);
            await StorageService.setItem('idEscola', idEscola.toString());
            return idEscola;
          }
        }
      }
      
    } catch (perfilError) {
      console.error('[DEBUG] Erro ao buscar perfil do aluno:', perfilError);
      // Não é mais um erro fatal - continua tentando outras estratégias
    }

    // 5. Se chegou até aqui, não conseguiu obter idEscola
    console.error('[DEBUG] Não foi possível obter idEscola de nenhuma fonte padrão');
    return null;
  }

  // Estratégias alternativas quando as convencionais falham
  async tentarEstrategiasAlternativasIdEscola(userData) {
    console.log('[DEBUG] Iniciando estratégias alternativas...');
    
    try {
      // 1. Tenta listar escolas e ver se há uma padrão
      const escolasPossiveis = await this.tentarListarEscolas();
      if (escolasPossiveis && escolasPossiveis.length === 1) {
        console.log('[DEBUG] Apenas uma escola disponível:', escolasPossiveis[0]);
        const idEscola = escolasPossiveis[0].id || escolasPossiveis[0].Id || escolasPossiveis[0].idEscola;
        if (idEscola) {
          await StorageService.setItem('idEscola', idEscola.toString());
          return parseInt(idEscola, 10);
        }
      }
      
      // 2. Tenta usar um ID padrão comum (se a aplicação usa)
      const idEscolaPadrao = await this.verificarIdEscolaPadrao();
      if (idEscolaPadrao) {
        console.log('[DEBUG] Usando idEscola padrão:', idEscolaPadrao);
        await StorageService.setItem('idEscola', idEscolaPadrao.toString());
        return parseInt(idEscolaPadrao, 10);
      }
      
      // 3. Verifica se há algum padrão nos dados salvos de outras sessões
      const dadosHistorico = await this.verificarHistoricoIdEscola();
      if (dadosHistorico) {
        console.log('[DEBUG] Usando idEscola do histórico:', dadosHistorico);
        await StorageService.setItem('idEscola', dadosHistorico.toString());
        return parseInt(dadosHistorico, 10);
      }
      
    } catch (error) {
      console.error('[DEBUG] Erro nas estratégias alternativas:', error);
    }
    
    return null;
  }

  async tentarListarEscolas() {
    try {
      // Tenta diferentes endpoints para listar escolas
      const endpoints = ['/Escolas', '/escolas', '/Escola', '/escola', '/api/escolas'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await EncomendaApi.get(endpoint);
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          }
        } catch (e) {
          continue;
        }
      }
    } catch (error) {
      console.log('[DEBUG] Não foi possível listar escolas');
    }
    return null;
  }

  async verificarIdEscolaPadrao() {
    // Se a aplicação tem um padrão conhecido, pode retornar aqui
    // Por exemplo, se sempre usa idEscola = 1 para a escola principal
    const padroesPossiveis = [1, 2, 100]; // IDs comuns
    
    for (const id of padroesPossiveis) {
      try {
        // Tenta validar se o ID existe fazendo uma consulta rápida
        const response = await EncomendaApi.get(`/Escola/${id}`);
        if (response.status === 200) {
          console.log(`[DEBUG] ID escola padrão válido encontrado: ${id}`);
          return id;
        }
      } catch (e) {
        continue;
      }
    }
    
    return null;
  }

  async verificarHistoricoIdEscola() {
    try {
      // Verifica se há encomendas anteriores e extrai o idEscola delas
      const userData = await StorageService.getUserData();
      if (userData && userData.idAluno) {
        const response = await EncomendaApi.get(`${this.baseUrl}/aluno/${userData.idAluno}`);
        if (response.data && response.data.length > 0) {
          const primeiraEncomenda = response.data[0];
          const idEscola = primeiraEncomenda.IdEscola || primeiraEncomenda.idEscola;
          if (idEscola) {
            console.log('[DEBUG] idEscola encontrado no histórico de encomendas:', idEscola);
            return parseInt(idEscola, 10);
          }
        }
      }
    } catch (error) {
      console.log('[DEBUG] Não foi possível verificar histórico');
    }
    return null;
  }

  async obterEncomendasAluno() {
  // 1) Busca os dados do usuário (contém idAluno)
  const userData = await StorageService.getUserData();
  if (!userData || !userData.idAluno) {
    throw new Error('Dados do usuário não encontrados. Faça login novamente.');
  }

  try {
    // 2) Chama o endpoint de listagem
    const response = await EncomendaApi.get(
      `${this.baseUrl}/aluno/${userData.idAluno}`
    );

    // 3) Inspeciona o objeto completo
    console.log('▶ Response completo:', response.data);

    // 4) Retorna somente o array de encomendas
    return response.data.data;
  } catch (error) {
    console.error(
      'Erro ao obter encomendas:',
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Não foi possível buscar encomendas.'
    );
  }
}

  async obterDetalhesEncomenda(idEncomenda) {
    const userData = await StorageService.getUserData();
    if (!userData || !userData.idAluno) {
      throw new Error('Dados do usuário não encontrados. Faça login novamente.');
    }

    try {
      const response = await EncomendaApi.get(
       `${this.baseUrl}/${idEncomenda}/aluno/${userData.idAluno}`
     );
     // response.data == { success: true, data: { …detalhes… } }
     return response.data.data;
      
    } catch (error) {
      console.error('Erro ao obter detalhes da encomenda:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Não foi possível buscar detalhes da encomenda.');
    }
  }

  async cancelarEncomenda(idEncomenda) {
    const userData = await StorageService.getUserData();
    if (!userData || !userData.idAluno) {
      throw new Error('Dados do usuário não encontrados. Faça login novamente.');
    }

    try {
      const response = await EncomendaApi.put(
        `${this.baseUrl}/${idEncomenda}/cancelar`,
        { idAluno: userData.idAluno }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar encomenda:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Não foi possível cancelar a encomenda.');
    }
  }

  // Método para permitir que o usuário defina manualmente o idEscola
  async definirIdEscolaManualmente(idEscola) {
    try {
      const id = parseInt(idEscola, 10);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID da escola deve ser um número válido maior que zero.');
      }
      
      await StorageService.setItem('idEscola', id.toString());
      console.log('[DEBUG] idEscola definido manualmente:', id);
      return id;
    } catch (error) {
      console.error('[DEBUG] Erro ao definir idEscola manualmente:', error);
      throw error;
    }
  }

  // Métodos de formatação (mantidos como estavam)
  formatarStatus(status) {
    const statusMap = {
      'Pendente': { text: 'Pendente', color: '#f39c12', icon: 'time-outline' },
      'Processando': { text: 'Processando', color: '#3498db', icon: 'refresh-outline' },
      'Enviado': { text: 'Enviado', color: '#9b59b6', icon: 'airplane-outline' },
      'Entregue': { text: 'Entregue', color: '#27ae60', icon: 'checkmark-circle-outline' },
      'Cancelado': { text: 'Cancelado', color: '#e74c3c', icon: 'close-circle-outline' }
    };
    return statusMap[status] || { text: status, color: '#95a5a6', icon: 'help-outline' };
  }

  podeSerCancelada(status) {
    return ['Pendente', 'Processando'].includes(status);
  }

  formatarData(data) {
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return data;
    }
  }

  calcularDiasParaEntrega(dataEntrega) {
    try {
      const hoje = new Date();
      const entrega = new Date(dataEntrega);
      const diffTime = entrega - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Vencido';
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Amanhã';
      return `Em ${diffDays} dias`;
    } catch (error) {
      return 'Data inválida';
    }
  }
}

export const encomendaService = new EncomendaService();