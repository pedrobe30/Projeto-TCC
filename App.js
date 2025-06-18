import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StorageService from './app/src/services/StorageService';
import { isTokenValid } from './app/src/services/LoginService';

import Autenticacao from './app/src/pages/Autenticacao';
import Login from './app/src/pages/Login/index';
import Home from './app/src/pages/Home/index';
import Perfil from './app/src/pages/Perfil/Index';
import VerificationPage from './app/src/pages/Autenticacao/codeverify';
import ProductListScreen from './app/src/pages/Produtos';
import FilteredProductListScreen from './app/src/pages/Produtos/ProdutosFiltrados';
import Categorias from './app/src/pages/Categorias';
import ProductDetailScreen from './app/src/pages/ProdutoEspcifico';
import EncomendaRealizada from './app/src/pages/Carrinho/EncomendaRealizada';
import FaleConosco from './app/src/pages/Carrinho/faleConosco';
import CarrinhoScreen from './app/src/pages/Carrinho';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Usa o mesmo método de verificação do LoginService
        const tokenValid = await isTokenValid();
        
        if (tokenValid) {
          const token = await StorageService.getToken();
          setUserToken(token);
        } else {
          setUserToken(null);
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#740000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={userToken ? 'Home' : 'Autenticacao'}
      >
        {/* Fluxo de não autenticado */}
        <Stack.Screen
          name="Autenticacao"
          component={Autenticacao}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerificationPage"
          component={VerificationPage}
          options={{ headerShown: false }}
        />
        {/* Fluxo autenticado */}
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Produtos"
          component={ProductListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Categoria"
          component={Categorias}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FilteredProductList"
          component={FilteredProductListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Carrinho"
          component={CarrinhoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EncomendaRealizada"
          component={EncomendaRealizada}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Ajuda"
          component={FaleConosco}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}