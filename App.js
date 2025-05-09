import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Autenticacao from './app/src/pages/Autenticacao';
import Login from './app/src/pages/Login';
import Home from './app/src/pages/Home';
import Perfil from './app/src/pages/Perfil/Index';
import VerificationPage from './app/src/pages/Autenticacao/codeverify';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Perfil"> 
        <Stack.Screen name="Autenticacao" component={Autenticacao} />
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='Home' component={Home} />
        <Stack.Screen name='VerificationPage' component={VerificationPage} />
        <Stack.Screen name='Perfil' component={Perfil} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
