// App.js

import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StorageService from './app/src/services/StorageService';
import { isTokenValid } from './app/src/services/LoginService';

// Importe a nova tela de seleção de usuário
import UserSelectionScreen from './app/src/pages/Inicializacao/SelecaoUsuario'; // Ajuste o caminho se necessário
import TelaLoginAdm from './app/src/pages/Administradores/TelaLoginAdm'
// ... (importações das suas telas existentes)
import Autenticacao from './app/src/pages/Autenticacao';
import Login from './app/src/pages/Login/LoginTela';
import Home from './app/src/pages/Home/index';
import Perfil from './app/src/pages/Perfil/PerfilTEla';
import VerificationPage from './app/src/pages/Autenticacao/codeverify';
import ProductListScreen from './app/src/pages/Produtos/TelaProdutoLista';
import FilteredProductListScreen from './app/src/pages/Produtos/ProdutosFiltrados';
import Categorias from './app/src/pages/Categorias';
import ProductDetailScreen from './app/src/pages/ProdutoEspcifico/TelaProdutoEspecifico';
import EncomendaRealizada from './app/src/pages/Carrinho/EncomendaRealizada';
import FaleConosco from './app/src/pages/Carrinho/faleConosco';
import CarrinhoScreen from './app/src/pages/Carrinho/CarrinhoTela';
import EncomendasScreen from './app/src/pages/ItensEncomendados/EncomendaTela';
import TelaCadastroAdm from './app/src/pages/Administradores/TelaCadastroAdm'
import TelaCadastroProduto from './app/src/pages/CasdastroProduto/TelaCadastroProduto';
import TelaListandoProduto from './app/src/pages/Visualizandoprodutos/TelaListandoProduto'; // Verifique o caminho
import TelaAtualizar from './app/src/pages/Visualizandoprodutos/TelaAtualizar'; //
import TelaListandoEncomendasAdm from './app/src/pages/AdminEncomedas/TelaListandoEncomendasAdm'
import TelaCategorias from './app/src/pages/Especificacoes/TelaCategorias';
import TelaModelos from './app/src/pages/Especificacoes/TelaModelos';
import TelaTecidos from './app/src/pages/Especificacoes/TelaTecidos'
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Importe no topo
import AdminDrawerNavigator from './app/src/navigation/AdminDrawerNavigator'; 

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const isAdminLoggedIn = await StorageService.isAdminTokenValid();
        if (isAdminLoggedIn) {
          setInitialRoute('AdminPanel');
          return; // Encerra a verificação e define a rota
        }

        const isAlunoLoggedIn = await StorageService.isTokenValid();
        if (isAlunoLoggedIn) {
          setInitialRoute('Home');
          return; // Encerra a verificação e define a rota
        }

        setInitialRoute('UserSelection');
      
      } catch (error) {
        console.error('Erro ao inicializar o app:', error);
        setInitialRoute('UserSelection')
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
        // Definindo UserSelectionScreen como a rota inicial para que o usuário escolha o perfil primeiro
        initialRouteName="UserSelection"
      >
        {/* Nova tela de seleção de usuário */}
        <Stack.Screen
          name="UserSelection"
          component={UserSelectionScreen}
          options={{ headerShown: false }}
        />
        {/* Suas telas existentes para o fluxo não autenticado */}
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
        
        {/* Suas telas existentes para o fluxo autenticado */}
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
        {/* Tela de Encomendas */}
        <Stack.Screen
          name="Encomenda"
          component={EncomendasScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="CadostroAdm"
          component={TelaCadastroAdm}
          options={{ headerShown: false }}
          />

          <Stack.Screen // Adicione esta tela
          name="LoginAdm" 
          component={TelaLoginAdm}
          options={{ headerShown: false }}
        />

        <Stack.Screen
        name='CadastroProduto'
        component={TelaCadastroProduto}
        options={{headerShown: false}}
        />

         <Stack.Screen
          name="TelaListandoProduto"
          component={TelaListandoProduto}
          options={{ title: 'Gerenciar Produtos' }} // Um título no header fica profissional
        />
        <Stack.Screen
          name="TelaAtualizar"
          component={TelaAtualizar}
          options={{ title: 'Editar Produto' }}
        />
          <Stack.Screen
          name="AdminEncomendas"
          component={TelaListandoEncomendasAdm}
          options={{ headerShown: false }} // O header customizado já está na tela
        />

        <Stack.Screen
          name="AdminCategorias"
          component={TelaCategorias}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminModelos"
          component={TelaModelos}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminTecidos"
          component={TelaTecidos}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
            name="AdminPanel" // Este é o nome para navegar para TODO o painel admin
            component={AdminDrawerNavigator} 
          />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
