// app/src/pages/Login/SelecaoUsuario.tsx (ATUALIZADO)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserSelectionScreen: React.FC = () => {
  const navigation = useNavigation();

  const navigateToAlunoLogin = () => navigation.navigate('Login'); 
  const navigateToAdminCadastro = () => navigation.navigate('CadostroAdm');

  return (
    <LinearGradient
      colors={['#3f0d0d', '#941313']} // <<< GRADIENTE ATUALIZADO >>>
      style={styles.container}
    >
      <SafeAreaView style={styles.contentWrapper}>
        <Image
          source={require('../../assets/Vestetec-removebg-preview.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Escolha seu perfil para continuar</Text>

        <TouchableOpacity 
            style={[styles.button, styles.alunoButton]} // <<< ESTILO ATUALIZADO >>>
            onPress={navigateToAlunoLogin} 
            activeOpacity={0.8}
        >
          <Icon name="school" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Sou Aluno</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.button, styles.adminButton]} // <<< ESTILO ATUALIZADO >>>
            onPress={navigateToAdminCadastro} 
            activeOpacity={0.8}
        >
          <Icon name="admin-panel-settings" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Sou Administrador</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  alunoButton: {
    backgroundColor: '#FFA726', // Cor Laranja Vibrante
  },
  adminButton: {
    backgroundColor: '#4A90E2', // Cor Azul Primário
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UserSelectionScreen;