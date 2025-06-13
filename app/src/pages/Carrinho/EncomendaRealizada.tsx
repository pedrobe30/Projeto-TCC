import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function EncomendaRealizada() {
  return (
    <View style={styles.container}>
      {/* Logo centralizado no topo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/Vestetec-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Botão de fechar fixado no canto superior direito */}
      <TouchableOpacity 
        onPress={() => Alert.alert('Fechar', 'Aqui você pode fechar ou voltar')} 
        style={styles.closeButton}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      >
        <AntDesign name="close" size={32} color="black" />
      </TouchableOpacity>

      {/* Ícone de visto e texto centralizados */}
      <View style={styles.checkContainer}>
        <View style={styles.checkBackground}>
          <AntDesign name="check" size={120} color="#fff" />
        </View>
        <Text style={styles.successText}>Encomenda Realizada Com Sucesso</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  logo: {
    width: 190,
    height: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  checkContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#28a745', // verde
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
