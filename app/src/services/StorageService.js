import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Detecta se está rodando no web browser
const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined');

class StorageService {
  async setItem(key, value) {
    try {
      if (isWeb && typeof window !== 'undefined' && window.localStorage) {
        // No browser, usa localStorage
        localStorage.setItem(key, value);
      } else {
        // No app mobile, usa AsyncStorage
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      if (isWeb && typeof window !== 'undefined' && window.localStorage) {
        // No browser, usa localStorage
        return localStorage.getItem(key);
      } else {
        // No app mobile, usa AsyncStorage
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Erro ao buscar ${key}:`, error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      if (isWeb && typeof window !== 'undefined' && window.localStorage) {
        // No browser, usa localStorage
        localStorage.removeItem(key);
      } else {
        // No app mobile, usa AsyncStorage
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
      throw error;
    }
  }

  async clear() {
    try {
      if (isWeb && typeof window !== 'undefined' && window.localStorage) {
        // No browser, limpa localStorage
        localStorage.clear();
      } else {
        // No app mobile, limpa AsyncStorage
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  }

  // Métodos específicos para token
  async saveToken(token) {
    return this.setItem('token', token);
  }

  async getToken() {
    return this.getItem('token');
  }

  async removeToken() {
    return this.removeItem('token');
  }

  // Verifica se token existe
  async hasToken() {
    const token = await this.getToken();
    return token !== null && token !== '';
  }
}

export default new StorageService();