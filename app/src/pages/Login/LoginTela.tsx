// LoginTela.tsx
import React, { useState } from 'react';
import { Text, View, SafeAreaView, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../../services/authService';
import StorageService from '../../services/StorageService';
import { isTokenValid } from '../../services/LoginService';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Informe seu email'),
  senha: yup.string().required('Informe sua senha')
});

export default function Login() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', senha: '' }
  });

  useFocusEffect(
    React.useCallback(() => {
      const checkExistingAuth = async () => {
        try {
          setIsCheckingAuth(true);
          const tokenValid = await isTokenValid();
          if (tokenValid) {
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
        } finally {
          setIsCheckingAuth(false);
        }
      };
      checkExistingAuth();
    }, [navigation])
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const resultado = await login({ email: data.email, senha: data.senha });
      if (resultado && resultado.status && resultado.dados) {
        await StorageService.saveToken(resultado.dados);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        Alert.alert('Erro no Login', resultado?.mensagem || 'Credenciais inválidas. Verifique seu email e senha.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao fazer login. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <LinearGradient colors={['#340000', '#1A0000']} style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Verificando...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A0000' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <LinearGradient colors={['#340000', '#1A0000']} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.container}>
            <Image
              source={require('../../assets/Vestetec-removebg-preview.png')}
              style={styles.logo}
            />
            <View style={styles.formContainer}>
              <Text style={styles.title}>Bem-vindo de volta!</Text>
              
              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Email"
                      placeholderTextColor="#888"
                      keyboardType="email-address"
                      onBlur={onBlur}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  )}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email?.message}</Text>}

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="senha"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { flex: 1 }, errors.senha && styles.inputError]}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Senha"
                      placeholderTextColor="#888"
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={24} color="#888" />
                </TouchableOpacity>
              </View>
              {errors.senha && <Text style={styles.errorText}>{errors.senha?.message}</Text>}
              
              <TouchableOpacity disabled={isLoading}>
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isLoading} style={styles.loginButton}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Ainda não tem uma conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Autenticacao')} disabled={isLoading}>
                <Text style={styles.signupLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 18, marginTop: 12 },
  gradient: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 250,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    height: 50,
    color: '#333',
    fontSize: 16,
    flex: 1,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginLeft: 8,
    marginTop: -12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#A30101',
    textAlign: 'right',
    marginBottom: 24,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#A30101',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    height: 55,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 32,
    alignItems: 'center',
  },
  signupText: {
    color: '#ccc',
    fontSize: 14,
  },
  signupLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});