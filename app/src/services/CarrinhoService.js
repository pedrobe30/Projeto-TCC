import StorageService from './StorageService';

const CART_KEY = 'cart_items';

class CarrinhoService {
  constructor() {
    this.itens = [];
    this.listeners = [];
    // Carrega itens persistidos
    this._loadFromStorage();
  }

  // Carregar dados do AsyncStorage
  async _loadFromStorage() {
    try {
      const saved = await StorageService.getItem(CART_KEY);
      if (saved) {
        this.itens = JSON.parse(saved);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[CarrinhoService] Falha ao carregar carrinho:', error);
    }
  }

  // Salvar dados no AsyncStorage
  async _saveToStorage() {
    try {
      await StorageService.setItem(CART_KEY, JSON.stringify(this.itens));
    } catch (error) {
      console.error('[CarrinhoService] Falha ao salvar carrinho:', error);
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
    // Sincroniza após notificar
    this._saveToStorage();
  }

  adicionarItem(produto, quantidade = 1, tamanho) {
    const itemExistente = this.itens.find(item => 
      item.idProd === produto.idProd && item.tamanho === (tamanho || null)
    );

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      this.itens.push({ ...produto, quantidade, tamanho: tamanho || null });
    }

    this.notifyListeners();
  }

  removerItem(produtoId, tamanho) {
    this.itens = this.itens.filter(item => 
      !(item.idProd === produtoId && item.tamanho === (tamanho || null))
    );
    this.notifyListeners();
  }

  atualizarQuantidade(produtoId, novaQuantidade, tamanho) {
    if (novaQuantidade <= 0) {
      this.removerItem(produtoId, tamanho);
      return;
    }
    const item = this.itens.find(item => 
      item.idProd === produtoId && item.tamanho === (tamanho || null)
    );
    if (item) {
      item.quantidade = novaQuantidade;
      this.notifyListeners();
    }
  }

  obterItens() {
    return [...this.itens];
  }

  calcularTotal() {
    return this.itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0);
  }

  limparCarrinho() {
    this.itens = [];
    this.notifyListeners();
  }

  obterQuantidadeTotal() {
    return this.itens.reduce((sum, i) => sum + i.quantidade, 0);
  }

  produtoNoCarrinho(produtoId, tamanho) {
    return this.itens.some(item => 
      item.idProd === produtoId && item.tamanho === (tamanho || null)
    );
  }

  obterQuantidadeProduto(produtoId, tamanho) {
    const item = this.itens.find(item => 
      item.idProd === produtoId && item.tamanho === (tamanho || null)
    );
    return item ? item.quantidade : 0;
  }
}

export const carrinhoService = new CarrinhoService();
