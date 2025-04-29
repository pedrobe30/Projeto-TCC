import React, { useState } from 'react';
import { SafeAreaView, View, TextInput, Button, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { verificarCodigo, reenviarCodigo } from '../../services/authService';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';


export default function CodeVerification() {
  const navigation = useNavigation();
 type RouteParams = {
  CodeVerification: {
    email: string;
  };
 };

  const route = useRoute<RouteProp<RouteParams, 'CodeVerification'>>();
   const { email } = route.params;

  const [code, setCode] = useState('');

  const handleVerify = async () => {
    try {
      const { status, Mensagem, Dados } = await verificarCodigo({ Email: email, Codigo: code });
      if (Dados) {
        Alert.alert('Sucesso', Mensagem);
        navigation.navigate('Login');
      } else {
        Alert.alert('Erro', Mensagem);
      }
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const handleResend = async () => {
    try {
      const { status, Mensagem } = await reenviarCodigo(email);
      if (status) {
        Alert.alert('Sucesso', 'Código reenviado! Verifique seu e-mail.');
      } else {
        Alert.alert('Erro', Mensagem);
      }
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verificação de Código</Text>
      <Text style={styles.subtitle}>Código enviado para: {email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o código"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />
      <Button title="Verificar" onPress={handleVerify} />
      <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
        <Text style={styles.resendText}>Reenviar código</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 4, marginBottom: 16 },
  resendContainer: { marginTop: 16, alignItems: 'center' },
  resendText: { color: '#007bff', fontSize: 16 }
});
