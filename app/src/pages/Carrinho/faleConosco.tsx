import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';

export default function FaleConosco() {
  return (
    <View style={styles.container}>

      <View style={styles.topContainer}>
        <Text style={styles.title}>Fale Conosco!</Text>

        <View style={styles.scannerContainer}>
          <Image
            source={require('../../assets/qrcode.png')}  // Altere para o caminho correto
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL('https://seulink.com')}
      >
        <Text style={styles.buttonText}>Alguma Dúvida?</Text>

        {/* Linha dentro do botão */}
        <View style={styles.line} />
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 80,
  },
  scannerContainer: {
    width: 250,
    height: 250,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    marginBottom: 4,  // espaço entre o texto e a linha
  },
  line: {
    width: '80%',
    height: 1,
    backgroundColor: '#000',
  },
});
