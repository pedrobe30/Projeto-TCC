import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Autenticacao from './app/src/pages/Autenticacao';
import Login from './app/src/pages/Login';
import Home from './app/src/pages/Home';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Autenticacao">
        <Stack.Screen name="Autenticacao" component={Autenticacao} />
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='Home' component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
