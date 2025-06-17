import React, { useState } from 'react';
import { Text, View, SafeAreaView, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';



// Schema de validação do formulário
const schema = yup.object({
  email: yup.string().email('Email inválido').required('Informe seu email'),
  senha: yup.string().required('Informe sua senha')
});

export default function Login() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Configuração do React Hook Form com validação Yup
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      senha: ''
    }
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      console.log('Dados do formulário:', data); // Debug log
      
      // Chama o endpoint de login
      const resultado = await login({
        email: data.email,
        senha: data.senha
      });

      console.log('Resultado login:', resultado); // Debug log

      if (resultado && resultado.status) {
        const token = resultado.Dados
        try {
          await AsyncStorage.setItem('token', token)
        } catch (e) {
          console.error('Erro salvando token', e)
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home'}]
        })
      } else {
        Alert.alert('Erro', resultado?.Mensagem || 'Credenciais inválidas. Verifique seu email e senha.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
      
          
          {/* Logo */}
          <View style={styles.logo}>
            <Image
              source={require('../../assets/Vestetec-removebg-preview.png')}
              style={styles.image}
            />
          </View>
          
          {/* Container do formulário */}
          <View style={styles.minicontainer}>
            <Text style={styles.texto}>
              Bem-vindo de volta!
            </Text>

            {/* Campo Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  placeholder="     Email"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && <Text style={styles.error}>{errors.email?.message}</Text>}

            {/* Campo Senha */}
            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    onChangeText={onChange}
                    value={value}
                    placeholder="     Senha"
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.icon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye' : 'eye-off'} 
                      size={34} 
                      color="black" 
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.senha && <Text style={styles.error}>{errors.senha?.message}</Text>}

            {/* Esqueci minha senha */}
            <TouchableOpacity
              // style={styles.forgotPassword}
            //  onPress={() => navigation.navigate('RecuperarSenha')}
            >
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            {/* Botão de Login */}
            <TouchableOpacity 
              style={styles.btn}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#740000", "#000000"]}
                style={styles.button}
              >
                <Text style={styles.txtBtn}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Link para Cadastro */}
          <View style={styles.conta}>
            <Text style={styles.txtConta}>Ainda não tem uma conta?</Text>
            <TouchableOpacity 
              style={styles.btnlogin} 
              onPress={() => navigation.navigate('Autenticacao')}
            >
              <Text style={styles.txtlogin}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#340000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bemvindo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bv: {
    height: 100,
    width: 320,
    zIndex: 4,
    top: -30
  },
  minicontainer: {
    backgroundColor: 'white',
    width: 360,
    height: 'auto',
    paddingVertical: 20,
    zIndex: 1
  },
  image: {
    width: 360,
    zIndex: 2,
    left: 7
  },
  logo: {
    height: 61,
    zIndex: 3
  },
  texto: {
    marginTop: 20,
    margin: 49,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center'
  },
  input: {
    margin: 10,
    backgroundColor: '#c7c7c7',
    height: 40,
    marginBottom: 14,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#390000',
    fontSize: 14,
    paddingLeft: 15
  },
  inputContainer: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    right: 20,
    top: 13,
    zIndex: 1
  },
  error: {
    color: '#ce2340',
    alignSelf: 'flex-start',
    marginLeft: 15,
    fontSize: 14,
    marginTop: -10,
    marginBottom: 5
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginRight: 15,
    marginTop: 5,
    marginBottom: 15
  },
  forgotPasswordText: {
    color: '#740000',
    fontSize: 14,
    fontWeight: '500'
  },
  btn: {
    width: 320,
    height: 70,
    alignSelf: 'center',
    marginTop: 24,
    borderRadius: 10,
  },
  button: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  txtBtn: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold'
  },
  conta: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  txtConta: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnlogin: {
    backgroundColor: 'black',
    width: 120,
    height: 50,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  txtlogin: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});