import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

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
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // decodificar o token para checar expiração
          const { exp } = jwtDecode(token);
          const now = Math.floor(Date.now() / 1000);
          if (exp && exp > now) {
            // token ainda válido
            setUserToken(token);
          } else {
            // token expirado: remover e tratar como não autenticado
            await AsyncStorage.removeItem('token');
            setUserToken(null);
          }
        } else {
          setUserToken(null);
        }
      } catch (err) {
        console.error('Erro ao verificar token:', err);
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    // Enquanto verifica, mostrar indicador simples; pode estilizar conforme desejar
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
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
