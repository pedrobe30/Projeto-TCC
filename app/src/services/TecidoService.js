import apiCategorias from './apiCategorias';

class TecidoService {
  constructor() {
    this.baseUrl = '/Tecido';
  }

  async getAll() {
    const response = await apiCategorias.get(this.baseUrl);
    return response.data;
  }

  async create(nomeTecido) {
    const response = await apiCategorias.post(this.baseUrl, { tipoTecido: nomeTecido });
    return response.data;
  }

  async update(id, nomeTecido) {
    const response = await apiCategorias.put(`${this.baseUrl}/${id}`, { tipoTecido: nomeTecido });
    return response.data;
  }

  async delete(id) {
    const response = await apiCategorias.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const tecidoService = new TecidoService();