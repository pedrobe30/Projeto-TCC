// FooterNavigation.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function FooterNavigation() {
  const navigation = useNavigation();
  const route = useRoute();

  const buttons = [
    { name: 'Home', icon: 'home-outline', label: 'Home' },
    { name: 'Categoria', icon: 'grid-outline', label: 'Categoria' },
    { name: 'Perfil', icon: 'person-circle-outline', label: 'Perfil' },
  ];

  // Definindo a cor do footer de acordo com a tela
  const footerBackgroundColor = route.name === 'Home' ? '#fff' : '#000';
  const iconActiveColor = route.name === 'Home' ? '#000' : '#fff'; // A cor do ícone ativo dentro do botão
  const iconInactiveColor = route.name === 'Home' ? '#FF0000' : '#FF0000'; // Cor do ícone inativo

  return (
    <View style={[styles.footer, { backgroundColor: footerBackgroundColor }]}>
      {buttons.map((btn, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.footerButton,
            route.name === btn.name && styles.activeButton,
          ]}
          onPress={() => navigation.navigate(btn.name)}
        >
          <Ionicons
            name={btn.icon}
            size={24}
            color={route.name === btn.name ? iconActiveColor : iconInactiveColor}
          />
          {route.name === btn.name && (
            <Text style={[styles.label, { color: iconActiveColor }]}>
              {btn.label}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    //borderRadius: 30,
    width: '110%',
    alignSelf: 'center',
    //position: 'absolute',
    //bottom: 20,
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  activeButton: {
    backgroundColor: '#FF0000',
    width: 100,
    borderRadius: 25,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  label: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
});