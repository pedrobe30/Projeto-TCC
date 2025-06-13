// CarrinhoService.js

class CarrinhoService {
    constructor() {
      this.itens = [];
      this.listeners = [];
    }
  
    // Adicionar listener para mudanças no carrinho
    addListener(callback) {
      this.listeners.push(callback);
    }
  
    // Remover listener
    removeListener(callback) {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    }
  
    // Notificar listeners sobre mudanças
    notifyListeners() {
      this.listeners.forEach(callback => callback());
    }
  
    // Adicionar item ao carrinho
    adicionarItem(produto, quantidade = 1, tamanho) {
      const chaveItem = tamanho 
        ? `${produto.idProd}-${tamanho}` 
        : produto.idProd.toString();
      
      const itemExistente = this.itens.find(item => {
        if (tamanho) {
          return item.idProd === produto.idProd && item.tamanho === tamanho;
        }
        return item.idProd === produto.idProd;
      });
      
      if (itemExistente) {
        itemExistente.quantidade += quantidade;
      } else {
        this.itens.push({
          ...produto,
          quantidade: quantidade,
          tamanho: tamanho
        });
      }
      
      this.notifyListeners();
    }
  
    // Remover item do carrinho
    removerItem(produtoId, tamanho) {
      this.itens = this.itens.filter(item => {
        if (tamanho) {
          return !(item.idProd === produtoId && item.tamanho === tamanho);
        }
        return item.idProd !== produtoId;
      });
      
      this.notifyListeners();
    }
  
    // Atualizar quantidade
    atualizarQuantidade(produtoId, novaQuantidade, tamanho) {
      if (novaQuantidade <= 0) {
        this.removerItem(produtoId, tamanho);
        return;
      }
  
      const item = this.itens.find(item => {
        if (tamanho) {
          return item.idProd === produtoId && item.tamanho === tamanho;
        }
        return item.idProd === produtoId;
      });
      
      if (item) {
        item.quantidade = novaQuantidade;
        this.notifyListeners();
      }
    }
  
    // Obter todos os itens
    obterItens() {
      return [...this.itens];
    }
  
    // Calcular total
    calcularTotal() {
      return this.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }
  
    // Limpar carrinho
    limparCarrinho() {
      this.itens = [];
      this.notifyListeners();
    }
  
    // Obter quantidade total de itens
    obterQuantidadeTotal() {
      return this.itens.reduce((total, item) => total + item.quantidade, 0);
    }
  
    // Verificar se produto está no carrinho
    produtoNoCarrinho(produtoId, tamanho) {
      return this.itens.some(item => {
        if (tamanho) {
          return item.idProd === produtoId && item.tamanho === tamanho;
        }
        return item.idProd === produtoId;
      });
    }
  
    // Obter quantidade de um produto específico
    obterQuantidadeProduto(produtoId, tamanho) {
      const item = this.itens.find(item => {
        if (tamanho) {
          return item.idProd === produtoId && item.tamanho === tamanho;
        }
        return item.idProd === produtoId;
      });
      
      return item ? item.quantidade : 0;
    }
  }
  
  // Instância singleton do serviço
  export const carrinhoService = new CarrinhoService();
  