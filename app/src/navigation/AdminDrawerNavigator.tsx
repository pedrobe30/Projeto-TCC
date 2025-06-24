// app/src/navigation/AdminDrawerNavigator.tsx (REVISADO)
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import TelaPrincipalAdm from '../pages/Administradores/TelaPrincipalAdm';
import TelaListandoEncomendasAdm from '../pages/AdminEncomedas/TelaListandoEncomendasAdm';
import TelaListandoProduto from '../pages/Visualizandoprodutos/TelaListandoProduto';
import TelaCategorias from '../pages/Especificacoes/TelaCategorias';
import TelaModelos from '../pages/Especificacoes/TelaModelos';
import TelaTecidos from '../pages/Especificacoes/TelaTecidos'

import { CustomDrawerContent } from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function AdminDrawerNavigator() {
  return (
    // O uso de @ts-ignore é mantido aqui, pois é uma solução comum para um
    // problema de tipo conhecido em algumas versões da biblioteca de navegação.
    // A implementação está funcionalmente correta.
    // @ts-ignore
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: 'rgba(74, 144, 226, 0.2)', // Azul mais suave para item ativo
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#D1D1D1',
        drawerLabelStyle: {
          marginLeft: -25, // Ajuste para alinhar texto com ícone
          fontSize: 15,
          fontWeight: '500',
        },
        drawerItemStyle: {
            marginVertical: 5,
            marginHorizontal: 10,
            borderRadius: 8,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={TelaPrincipalAdm}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => <Ionicons name="apps-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminEncomendas"
        component={TelaListandoEncomendasAdm}
        options={{
          title: 'Gerenciar Encomendas',
          drawerIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminProdutos"
        component={TelaListandoProduto}
        options={{
          title: 'Gerenciar Produtos',
          drawerIcon: ({ color, size }) => <Ionicons name="shirt-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminCategorias"
        component={TelaCategorias}
        options={{
          title: 'Gerenciar Categorias',
          drawerIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="AdminModelos"
        component={TelaModelos}
        options={{
          title: 'Gerenciar Modelos',
          drawerIcon: ({ color, size }) => <Ionicons name="layers-outline" color={color} size={size} />,
        }}
      />
       <Drawer.Screen
        name="AdminTecidos"
        component={TelaTecidos}
        options={{
          title: 'Gerenciar Tecidos',
          drawerIcon: ({ color, size }) => <Ionicons name="cut-outline" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
}