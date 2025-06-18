import { jwtDecode } from 'jwt-decode';
import StorageService from './StorageService';

export const apiClient = async (endpoint, options = {}) => {
  const token = await StorageService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Se retornar 401, remove o token e força logout
    if (response.status === 401) {
      await StorageService.removeToken();
      // Você pode emitir um evento global ou navegar para login aqui
      // Se tiver navigation disponível, pode fazer o logout
      throw new Error('Token expirado. Faça login novamente.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Função para verificar se o token ainda é válido
export const isTokenValid = async () => {
  try {
    const token = await StorageService.getToken();
    
    if (!token) return false;

    // Decodifica o token para verificar expiração
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Verifica se o token expirou
    if (decoded.exp < currentTime) {
      await StorageService.removeToken();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    await StorageService.removeToken();
    return false;
  }
};

// Função para fazer logout
export const logout = async () => {
  try {
    await StorageService.removeToken();
    // Aqui você pode adicionar outras limpezas necessárias
    console.log('Logout realizado com sucesso');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};