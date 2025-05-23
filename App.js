import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Autenticacao from './app/src/pages/Autenticacao';
import Login from './app/src/pages/Login';
import Home from './app/src/pages/Home';
import Perfil from './app/src/pages/Perfil/Index';
import VerificationPage from './app/src/pages/Autenticacao/codeverify';
import ProductListScreen from './app/src/pages/Produtos';
import Categoria from './app/src/pages/Home/Categorias';
import FilteredProductListScreen  from './app/src/pages/Produtos/ProdutosFiltrados'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Categoria"> 
        <Stack.Screen name="Autenticacao" component={Autenticacao} options={{headerShow: false}}/>
        <Stack.Screen name='Login' component={Login} options={{headerShow: false}}/>
        <Stack.Screen name='Home' component={Home} options={{headerShow: false}}/>
        <Stack.Screen name='VerificationPage' component={VerificationPage}  options={{headerShown: false}}/>
        <Stack.Screen name='Perfil' component={Perfil}  options={{ headerShown: false}}/> 
        <Stack.Screen name='Produtos' component={ProductListScreen} 
         options={{ headerShown: false }}
         />
          <Stack.Screen name='Categoria' component={Categoria} options={{headerShown: false}}/> 
          <Stack.Screen name="FilteredProductList" component={FilteredProductListScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
