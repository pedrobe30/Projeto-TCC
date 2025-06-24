// app/src/services/AdminEncomendaService.js
import EncomendaApi from './EncomendaApi';

class AdminEncomendaService {
  constructor() {
    this.baseUrl = '/admin/EncomendaControllerAdm';
  }

  /**
   * Obtém todas as encomendas com base nos filtros fornecidos.
   */
  async obterTodasEncomendas(filtros = {}) {
    try {
      // ->>> CORREÇÃO DEFINITIVA APLICADA AQUI <<<-
      // Em vez de passar um objeto de parâmetros, vamos construir a query string manualmente
      // para garantir que o backend receba o parâmetro 'Status' da forma correta.
      let queryString = '';
      if (filtros.Status) {
        // A função encodeURIComponent garante que o status seja enviado de forma segura na URL.
        queryString = `?Status=${encodeURIComponent(filtros.Status)}`;
      } else {
        // Se por algum motivo esta função for chamada sem filtros, lançamos um erro claro.
        // Isso força a lógica do app a sempre prover um status, como o backend exige.
        throw new Error("A função obterTodasEncomendas deve ser chamada com um filtro de Status.");
      }

      // A chamada agora usa a URL com a query string já montada.
      const response = await EncomendaApi.get(`${this.baseUrl}${queryString}`);

      return response.data.data || [];

    } catch (error) {
      console.error('Erro ao obter todas as encomendas (Admin):', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Não foi possível buscar as encomendas.');
    }
  }

  /**
   * Obtém os detalhes completos de uma encomenda específica.
   */
  async obterDetalhesEncomenda(idEncomenda) {
    try {
      const response = await EncomendaApi.get(`${this.baseUrl}/${idEncomenda}`);
      return response.data.data;
    } catch (error)      {
      console.error(`Erro ao obter detalhes da encomenda ${idEncomenda}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Não foi possível buscar os detalhes da encomenda.');
    }
  }

  /**
   * Atualiza o status de uma encomenda.
   */
  async atualizarStatus(idEncomenda, novoStatus) {
    try {
      const dto = { IdEncomenda: idEncomenda, NovoStatus: novoStatus };
      const response = await EncomendaApi.put(`${this.baseUrl}/status`, dto);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status da encomenda ${idEncomenda}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Não foi possível atualizar o status.');
    }
  }

  /**
   * Obtém estatísticas, como a contagem de encomendas por status.
   */
  async obterEstatisticas() {
    try {
      const response = await EncomendaApi.get(`${this.baseUrl}/estatisticas`);
      // ATUALIZAÇÃO: Renomeia a chave 'Processando' para 'Confirmada' se ela existir.
      const estatisticas = response.data.data;
      if (estatisticas && estatisticas['Processando']) {
          estatisticas['Confirmada'] = estatisticas['Processando'];
          delete estatisticas['Processando'];
      }
      return estatisticas || {};
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error.response?.data || error.message);
      return {};
    }
  }

  // Funções de formatação
  formatarStatus(status) {
    if (!status) return { text: 'Indefinido', color: '#95a5a6', icon: 'help-outline' };

    // Padroniza a string de entrada para a comparação
    const statusNormalizado = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Mapeamento de status, com a alteração de 'Processando' para 'Confirmada'
    const statusMap = {
      'Pendente': { text: 'Pendente', color: '#f39c12', icon: 'time-outline' },
      'Confirmada': { text: 'Confirmada', color: '#3498db', icon: 'shield-checkmark-outline' }, // <- MUDANÇA
      'Processando': { text: 'Confirmada', color: '#3498db', icon: 'shield-checkmark-outline' }, // <- MANTÉM COMPATIBILIDADE
      'Enviado': { text: 'Enviado', color: '#9b59b6', icon: 'airplane-outline' },
      'Entregue': { text: 'Entregue', color: '#27ae60', icon: 'checkmark-circle-outline' },
      'Cancelada': { text: 'Cancelado', color: '#e74c3c', icon: 'close-circle-outline' },
    };
    return statusMap[statusNormalizado] || { text: statusNormalizado, color: '#95a5a6', icon: 'help-outline' };
  }

  formatarData(data) {
    try {
      return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch {
      return 'Data inválida';
    }
  }
}

export const adminEncomendaService = new AdminEncomendaService();