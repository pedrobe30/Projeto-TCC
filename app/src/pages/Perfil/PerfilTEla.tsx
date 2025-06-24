// app/src/pages/Perfil/PerfilTEla.tsx

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FooterNav from '../../services/FooterNav';
import { logout } from '../../services/LoginService'; // <-- 1. Importe a função de logout

export default function Perfil() {  
  const navigation = useNavigation();

  const irParaEncomendas = () => {
    navigation.navigate('Encomenda');
  };

  const irParaCarrinho = () => {
    navigation.navigate('Carrinho');
  };

  // 2. Função de logout CORRIGIDA E MELHORADA
  const handleLogout = async () => {
    await logout(); // Limpa o token do Storage
    // Reseta a navegação para o fluxo de autenticação
    navigation.reset({
      index: 0,
      routes: [{ name: 'Autenticacao' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* ... o resto do seu JSX permanece o mesmo ... */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={irParaCarrinho}>
          <Text style={styles.menuText}>Meu Carrinho</Text>
          <Ionicons name="cart-outline" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={irParaEncomendas}>
          <Text style={styles.menuText}>Minhas Encomendas</Text>
          <MaterialIcons name="inventory" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Fale Conosco</Text>
          <Ionicons name="help-circle-outline" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuText}>Sair</Text>
          <Ionicons name="exit-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <FooterNav />
    </View>
  );
}

// ... seus estilos permanecem os mesmos ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  menu: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 100,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 40,
    marginBottom: 50,
    borderColor: '#fff',
    borderWidth: 3,
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
  },
});