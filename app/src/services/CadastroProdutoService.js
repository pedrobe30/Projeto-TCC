import apiCategorias from './apiCategorias';

class CadastroProdutoService {
  
  // Criar novo produto
  async criarProduto(dadosProduto) {
    try {
      const formData = new FormData();
      
      // Adicionar dados do produto
      formData.append('Preco', dadosProduto.preco.toString());
      formData.append('IdCategoria', dadosProduto.idCategoria.toString());
      formData.append('IdModelo', dadosProduto.idModelo.toString());
      formData.append('IdTecido', dadosProduto.idTecido.toString());
      formData.append('Descricao', dadosProduto.descricao || '');
      
      // Serializar tamanhos e quantidades para JSON
      const tamanhosJson = JSON.stringify(dadosProduto.tamanhosQuantidades);
      formData.append('TamanhosQuantidadesJson', tamanhosJson);
      
      // Adicionar imagem se fornecida
      if (dadosProduto.imagem) {
        const imageUri = dadosProduto.imagem.uri;
        const imageName = dadosProduto.imagem.name || `produto_${Date.now()}.jpg`;
        const imageType = dadosProduto.imagem.type || 'image/jpeg';
        
        formData.append('Imagem', {
          uri: imageUri,
          type: imageType,
          name: imageName,
        });
      }

      const response = await apiCategorias.post('/Produto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos
      });

      return {
        status: true,
        dados: response.data.dados,
        mensagem: response.data.mensagem || 'Produto criado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao criar produto:', error);
      
      let mensagemErro = 'Erro ao criar produto';
      
      if (error.response) {
        // Erro do servidor
        mensagemErro = error.response.data?.mensagem || 
                      error.response.data?.Mensagem || 
                      `Erro do servidor: ${error.response.status}`;
      } else if (error.request) {
        // Erro de rede
        mensagemErro = 'Erro de conexão. Verifique sua internet.';
      }

      return {
        status: false,
        dados: null,
        mensagem: mensagemErro
      };
    }
  }

  async excluirProduto(idProduto) {
    try {
      const response = await apiCategorias.delete(`/Produto/${idProduto}`);

      return {
        status: true,
        mensagem: response.data.mensagem || 'Produto excluído com sucesso'
      };

    } catch (error) {
      console.error(`Erro ao excluir produto ${idProduto}:`, error);
      let mensagemErro = 'Erro ao excluir produto';
      
      if (error.response) {
        mensagemErro = error.response.data?.mensagem || `Erro do servidor: ${error.response.status}`;
      } else if (error.request) {
        mensagemErro = 'Erro de conexão. Verifique sua internet.';
      }

      return {
        status: false,
        mensagem: mensagemErro
      };
    }
  }

  // Atualizar produto existente
  async atualizarProduto(idProduto, dadosProduto) {
    try {
      const formData = new FormData();
      
      // Adicionar dados do produto
      formData.append('Preco', dadosProduto.preco.toString());
      formData.append('IdCategoria', dadosProduto.idCategoria.toString());
      formData.append('IdModelo', dadosProduto.idModelo.toString());
      formData.append('IdTecido', dadosProduto.idTecido.toString());
      formData.append('IdStatus', dadosProduto.idStatus.toString());
      formData.append('Descricao', dadosProduto.descricao || '');
      
      // Serializar tamanhos e quantidades para JSON
      const tamanhosJson = JSON.stringify(dadosProduto.tamanhosQuantidades);
      formData.append('TamanhosQuantidadesJson', tamanhosJson);
      
      // Adicionar imagem se fornecida (opcional na atualização)
      if (dadosProduto.imagem && dadosProduto.imagem.uri) {
        const imageUri = dadosProduto.imagem.uri;
        const imageName = dadosProduto.imagem.name || `produto_${Date.now()}.jpg`;
        const imageType = dadosProduto.imagem.type || 'image/jpeg';
        
        formData.append('Imagem', {
          uri: imageUri,
          type: imageType,
          name: imageName,
        });
      }

      const response = await apiCategorias.put(`/Produto/${idProduto}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      return {
        status: true,
        dados: response.data.dados,
        mensagem: response.data.mensagem || 'Produto atualizado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      
      let mensagemErro = 'Erro ao atualizar produto';
      
      if (error.response) {
        mensagemErro = error.response.data?.mensagem || 
                      error.response.data?.Mensagem || 
                      `Erro do servidor: ${error.response.status}`;
      } else if (error.request) {
        mensagemErro = 'Erro de conexão. Verifique sua internet.';
      }

      return {
        status: false,
        dados: null,
        mensagem: mensagemErro
      };
    }
  }

  // ENDPOINTS CORRIGIDOS - Buscar categorias
  async buscarCategorias() {
    try {
      // Testando múltiplos endpoints possíveis
      let response;
      const endpointsPossiveis = [
        '/Categorias'

      ];

      for (const endpoint of endpointsPossiveis) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          response = await apiCategorias.get(endpoint);
          console.log(`Sucesso no endpoint: ${endpoint}`, response.data);
          break;
        } catch (error) {
          console.log(`Falha no endpoint ${endpoint}:`, error.response?.status);
          if (endpoint === endpointsPossiveis[endpointsPossiveis.length - 1]) {
            throw error; // Se é o último endpoint, propaga o erro
          }
        }
      }

      return {
        status: true,
        dados: response.data.dados || response.data || [],
        mensagem: 'Categorias carregadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return {
        status: false,
        dados: [],
        mensagem: `Erro ao carregar categorias: ${error.response?.status || error.message}`
      };
    }
  }

  // ENDPOINTS CORRIGIDOS - Buscar modelos
  async buscarModelos() {
    try {
      let response;
      const endpointsPossiveis = [
        '/Modelos'
      ];

      for (const endpoint of endpointsPossiveis) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          response = await apiCategorias.get(endpoint);
          console.log(`Sucesso no endpoint: ${endpoint}`, response.data);
          break;
        } catch (error) {
          console.log(`Falha no endpoint ${endpoint}:`, error.response?.status);
          if (endpoint === endpointsPossiveis[endpointsPossiveis.length - 1]) {
            throw error;
          }
        }
      }

      return {
        status: true,
        dados: response.data.dados || response.data || [],
        mensagem: 'Modelos carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
      return {
        status: false,
        dados: [],
        mensagem: `Erro ao carregar modelos: ${error.response?.status || error.message}`
      };
    }
  }

  // ENDPOINTS CORRIGIDOS - Buscar tecidos
  async buscarTecidos() {
    try {
      let response;
      const endpointsPossiveis = [
        
        '/Tecido'
        
      ];

      for (const endpoint of endpointsPossiveis) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          response = await apiCategorias.get(endpoint);
          console.log(`Sucesso no endpoint: ${endpoint}`, response.data);
          break;
        } catch (error) {
          console.log(`Falha no endpoint ${endpoint}:`, error.response?.status);
          if (endpoint === endpointsPossiveis[endpointsPossiveis.length - 1]) {
            throw error;
          }
        }
      }

      return {
        status: true,
        dados: response.data.dados || response.data || [],
        mensagem: 'Tecidos carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar tecidos:', error);
      return {
        status: false,
        dados: [],
        mensagem: `Erro ao carregar tecidos: ${error.response?.status || error.message}`
      };
    }
  }

  // Buscar status (para dropdown na edição)
  async buscarStatus() {
    try {
      let response;
      const endpointsPossiveis = [
        '/api/Status',
        '/Status',
        '/status',
        '/api/status'
      ];

      for (const endpoint of endpointsPossiveis) {
        try {
          response = await apiCategorias.get(endpoint);
          break;
        } catch (error) {
          if (endpoint === endpointsPossiveis[endpointsPossiveis.length - 1]) {
            throw error;
          }
        }
      }

      return {
        status: true,
        dados: response.data.dados || response.data || [],
        mensagem: 'Status carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      return {
        status: false,
        dados: [],
        mensagem: 'Erro ao carregar status'
      };
    }
  }

  // Teste de conectividade da API
  async testarConexao() {
    try {
      const response = await apiCategorias.get('/Produto');
      console.log('✅ Conexão com API funcionando:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Falha na conexão com API:', error.message);
      console.error('URL Base:', apiCategorias.defaults.baseURL);
      return false;
    }
  }

  // Validar dados do produto antes do envio
  validarDadosProduto(dados) {
    const erros = [];

    if (!dados.preco || dados.preco <= 0) {
      erros.push('Preço deve ser maior que zero');
    }

    if (!dados.idCategoria) {
      erros.push('Categoria é obrigatória');
    }

    if (!dados.idModelo) {
      erros.push('Modelo é obrigatório');
    }

    if (!dados.idTecido) {
      erros.push('Tecido é obrigatório');
    }

    if (!dados.tamanhosQuantidades || dados.tamanhosQuantidades.length === 0) {
      erros.push('Pelo menos um tamanho com quantidade deve ser informado');
    }

    // Validar tamanhos e quantidades
    if (dados.tamanhosQuantidades) {
      dados.tamanhosQuantidades.forEach((item, index) => {
        if (!item.tamanho || item.tamanho.trim() === '') {
          erros.push(`Tamanho ${index + 1} não pode estar vazio`);
        }
        if (item.quantidade < 0) {
          erros.push(`Quantidade do tamanho ${item.tamanho} não pode ser negativa`);
        }
      });
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Formatar dados para envio
  formatarDadosParaEnvio(dados) {
    return {
      preco: parseFloat(dados.preco),
      idCategoria: parseInt(dados.idCategoria),
      idModelo: parseInt(dados.idModelo),
      idTecido: parseInt(dados.idTecido),
      idStatus: dados.idStatus ? parseInt(dados.idStatus) : undefined,
      descricao: dados.descricao || '',
      imagem: dados.imagem,
      tamanhosQuantidades: dados.tamanhosQuantidades.map(item => ({
        tamanho: item.tamanho.trim().toUpperCase(),
        quantidade: parseInt(item.quantidade) || 0
      }))
    };
  }
}

// Export singleton instance
export const cadastroProdutoService = new CadastroProdutoService();