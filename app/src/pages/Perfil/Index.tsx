import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


export default function Perfil() {  
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={80} color="#fff" />
        </View>
        <Text style={styles.greeting}>OLÁ, "nome do aluno"</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Meu Carrinho</Text>
          <Ionicons name="cart-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Minhas Encomendas</Text>
          <MaterialIcons name="inventory" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Fale Conosco</Text>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Sair</Text>
          <Ionicons name="exit-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          //onPress={() => navigation.navigate('Home')} // Navega para a tela Home
        >
          <Ionicons name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          //onPress={() => navigation.navigate('Categoria')} // Navega para a tela Categoria
        >
          <Ionicons name="grid-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E57373',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#C62828',
  },
  profileIcon: {
    marginBottom: 10,
  },
  greeting: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  menu: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFCDD2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#C62828',
    paddingVertical: 10,
  },
  footerButton: {
    alignItems: 'center',
  },
});