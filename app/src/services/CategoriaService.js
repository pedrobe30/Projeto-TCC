import apiCategorias from './apiCategorias'; // Reutiliza a instância do Axios

class CategoriaService {
  constructor() {
    this.baseUrl = '/Categorias';
  }

  async getAll() {
    const response = await apiCategorias.get(this.baseUrl);
    return response.data;
  }

  async create(nomeCategoria) {
    const response = await apiCategorias.post(this.baseUrl, { categoria: nomeCategoria });
    return response.data;
  }

  async update(id, nomeCategoria) {
    const response = await apiCategorias.put(`${this.baseUrl}/${id}`, { categoria: nomeCategoria });
    return response.data;
  }

  async delete(id) {
    const response = await apiCategorias.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const categoriaService = new CategoriaService();