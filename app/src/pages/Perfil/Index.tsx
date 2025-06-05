import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FooterNav from '../../services/FooterNav'; // Import your FooterNav component

export default function Perfil() {  
  const navigation = useNavigation();
  const route = useRoute(); // pega a rota atual

  return (
    <View style={styles.container}>
      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Meu Carrinho</Text>
          <Ionicons name="cart-outline" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Minhas Encomendas</Text>
          <MaterialIcons name="inventory" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Fale Conosco</Text>
          <Ionicons name="help-circle-outline" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Sair</Text>
          <Ionicons name="exit-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Footer Navigation com Perfil incluído */}
      <FooterNav />
      </View>
  );
}


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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#8C1111',
    paddingVertical: 10,
    borderRadius: 30,
    width: '80%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 50,
    width: 45,
    height: 45,
  },
});