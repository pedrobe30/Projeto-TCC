import apiCategorias from './apiCategorias';

class ModeloService {
  constructor() {
    this.baseUrl = '/Modelos';
  }

  async getAll() {
    const response = await apiCategorias.get(this.baseUrl);
    return response.data;
  }

  async create(nomeModelo) {
    const response = await apiCategorias.post(this.baseUrl, { modelo: nomeModelo });
    return response.data;
  }

  async update(id, nomeModelo) {
    const response = await apiCategorias.put(`${this.baseUrl}/${id}`, { modelo: nomeModelo });
    return response.data;
  }

  async delete(id) {
    const response = await apiCategorias.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const modeloService = new ModeloService();