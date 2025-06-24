import api from './api'; 
import apiCategorias from './apiCategorias';

class ProdutoService {
  // Get all products
  async getAllProdutos() {
    try {
      const response = await apiCategorias.get('/Produto');
      
      // Processar os dados para adicionar quantEstoque calculado
      const produtosProcessados = this.processarProdutos(response.data.dados || response.data);
      
      return {
        status: true,
        dados: produtosProcessados,
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

  // Get products filtered by category
  async getProdutosByCategoria(categoriaId) {
    try {
      const response = await apiCategorias.get(`/Produto/categoria/${categoriaId}`);
      
      // Processar os dados para adicionar quantEstoque calculado
      const produtosProcessados = this.processarProdutos(response.data.dados || response.data);
      
      return {
        status: true,
        dados: produtosProcessados,
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
      
      // Processar o produto individual
      const produto = response.data.dados || response.data;
      const produtoProcessado = this.processarProduto(produto);
      
      return {
        status: true,
        dados: produtoProcessado,
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

  // Método auxiliar para processar array de produtos
  processarProdutos(produtos) {
    if (!Array.isArray(produtos)) {
      return [];
    }
    
    return produtos.map(produto => this.processarProduto(produto));
  }

  // Método auxiliar para processar um produto individual
  processarProduto(produto) {
    if (!produto) return null;
    
    // Calcular quantidade total em estoque
    let quantEstoque = 0;
    if (produto.tamanhosQuantidades && Array.isArray(produto.tamanhosQuantidades)) {
      quantEstoque = produto.tamanhosQuantidades.reduce((total, item) => {
        return total + (item.quantidade || 0);
      }, 0);
    }
    
    // Obter tamanhos disponíveis
    const tamanhosDisponiveis = produto.tamanhosQuantidades 
      ? produto.tamanhosQuantidades
          .filter(item => item.quantidade > 0)
          .map(item => item.tamanho)
      : [];
    
    // Retornar produto com propriedades adicionais para compatibilidade
    return {
      ...produto,
      quantEstoque, // Adicionar quantidade total para compatibilidade com frontend
      tamanhosDisponiveis, // Adicionar tamanhos disponíveis
      // Manter nomes em camelCase para compatibilidade
      categoriaNome: produto.categoriaNome,
      modeloNome: produto.modeloNome,
      tecidoNome: produto.tecidoNome,
      statusNome: produto.statusNome,
      imgUrl: produto.imgUrl,
      preco: produto.preco,
      idProd: produto.idProd,
      idCategoria: produto.idCategoria,
      idModelo: produto.idModelo,
      idTecido: produto.idTecido,
      idStatus: produto.idStatus,
      descricao: produto.descricao
    };
  }

  // Método para obter estoque de um tamanho específico
  obterEstoquePorTamanho(produto, tamanho) {
    if (!produto.tamanhosQuantidades || !Array.isArray(produto.tamanhosQuantidades)) {
      return 0;
    }
    
    const itemEstoque = produto.tamanhosQuantidades.find(
      item => item.tamanho && item.tamanho.toUpperCase() === tamanho.toUpperCase()
    );
    
    return itemEstoque ? itemEstoque.quantidade : 0;
  }

  // Método para verificar se um tamanho está disponível
  tamanhoDisponivel(produto, tamanho) {
    return this.obterEstoquePorTamanho(produto, tamanho) > 0;
  }

  // Método para obter todos os tamanhos com suas quantidades
  obterTamanhosComQuantidades(produto) {
    if (!produto.tamanhosQuantidades || !Array.isArray(produto.tamanhosQuantidades)) {
      return [];
    }
    
    return produto.tamanhosQuantidades.map(item => ({
      tamanho: item.tamanho,
      quantidade: item.quantidade,
      disponivel: item.quantidade > 0
    }));
  }
}

// Export a singleton instance
export const produtoService = new ProdutoService();