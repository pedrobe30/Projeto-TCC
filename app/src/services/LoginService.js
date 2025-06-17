import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';


export const apiClient = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
 
  // Se retornar 401, você pode forçar logout:
  if (response.status === 401) {
    await AsyncStorage.removeItem('token');
    // navegar para login, se disponível o navigation aqui ou emitir evento global
  }
  return response.json();
};
