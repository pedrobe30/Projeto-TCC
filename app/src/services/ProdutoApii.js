import api from './api'; 
import apiCategorias from './apiCategorias';

class ProdutoService {
  // Get all products
  async getAllProdutos() {
    try {
      const response = await apiCategorias.get('/Produto');
      return {
        status: true,
        dados: response.data.dados || response.data,
        mensagem: 'Produtos carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return {
        status: false,
        dados: [],
        mensagem: error.response?.data?.mensagem || 'Erro ao carregar produtos'
      };
    }
  }

  // Get products filtered by category - This is the key method for your feature
  async getProdutosByCategoria(categoriaId) {
    try {
      // This endpoint should match your backend route
      const response = await apiCategorias.get(`/Produto/categoria/${categoriaId}`);
      return {
        status: true,
        dados: response.data.dados || response.data,
        mensagem: 'Produtos da categoria carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return {
        status: false,
        dados: [],
        mensagem: error.response?.data?.mensagem || 'Erro ao carregar produtos da categoria'
      };
    }
  }

  // Get single product by ID
  async getProdutoById(id) {
    try {
      const response = await apiCategorias.get(`/Produto/${id}`);
      return {
        status: true,
        dados: response.data.dados || response.data,
        mensagem: 'Produto carregado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return {
        status: false,
        dados: null,
        mensagem: error.response?.data?.mensagem || 'Erro ao carregar produto'
      };
    }
  }


}

// Export a singleton instance
export const produtoService = new ProdutoService();