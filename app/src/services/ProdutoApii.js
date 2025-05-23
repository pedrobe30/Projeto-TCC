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

  // // Add new product
  // async addProduto(produto) {
  //   try {
  //     const response = await api.post('/Produtos', produto);
  //     return {
  //       status: true,
  //       dados: response.data.dados || response.data,
  //       mensagem: 'Produto adicionado com sucesso'
  //     };
  //   } catch (error) {
  //     console.error('Erro ao adicionar produto:', error);
  //     return {
  //       status: false,
  //       dados: null,
  //       mensagem: error.response?.data?.mensagem || 'Erro ao adicionar produto'
  //     };
  //   }
  // }

  // // Update existing product
  // async updateProduto(id, produto) {
  //   try {
  //     const response = await api.put(`/Produtos/${id}`, produto);
  //     return {
  //       status: true,
  //       dados: response.data.dados || response.data,
  //       mensagem: 'Produto atualizado com sucesso'
  //     };
  //   } catch (error) {
  //     console.error('Erro ao atualizar produto:', error);
  //     return {
  //       status: false,
  //       dados: null,
  //       mensagem: error.response?.data?.mensagem || 'Erro ao atualizar produto'
  //     };
  //   }
  // }

  // // Delete product
  // async deleteProduto(id) {
  //   try {
  //     const response = await api.delete(`/Produtos/${id}`);
  //     return {
  //       status: true,
  //       dados: response.data.dados || true,
  //       mensagem: 'Produto removido com sucesso'
  //     };
  //   } catch (error) {
  //     console.error('Erro ao remover produto:', error);
  //     return {
  //       status: false,
  //       dados: false,
  //       mensagem: error.response?.data?.mensagem || 'Erro ao remover produto'
  //     };
  //   }
  // }
}

// Export a singleton instance
export const produtoService = new ProdutoService();