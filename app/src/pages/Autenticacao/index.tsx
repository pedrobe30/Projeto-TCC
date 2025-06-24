import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { criarAluno } from '../../services/alunoService';
import { enviarCodigo } from '../../services/authService';
import { Picker } from '@react-native-picker/picker';

// Função para buscar escolas da API
const fetchEscolas = async () => {
  try {
    const response = await fetch('http://10.0.0.168:5260/api/Escola');
    if (!response.ok) {
      throw new Error('Erro ao buscar escolas');
    }
    const data = await response.json();
    const formattedData = data.map(escola => {
      const escolaId = escola.idEsc || escola.IdEsc || escola.id_escola;
      return {
        IdEsc: escolaId ? escolaId.toString() : '',
        nome_esc: escola.nome_esc || escola.NomeEsc || ''
      };
    });
    console.log('Escolas formatadas:', formattedData);
    return formattedData;
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    return [];
  }
};

// Schema de validação do formulário
const schema = yup.object({
  Nome: yup.string().required('Informe seu nome'),
  email: yup.string().email('Email inválido').required('Informe seu email'),
  senha: yup.string()
    .min(6, 'No mínimo 6 dígitos')
    .matches(/\d/, 'Um número pelo menos')
    .required('Informe sua senha'),
  rm: yup.string()
    .required('Informe seu RM')
    .matches(/^\d+$/, 'RM aceita apenas números')
    .length(5, "Deve conter 5 números"),
  escola: yup.string().required('Selecione uma escola')
});

export default function Cad() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Para dimensionar a imagem proporcionalmente
  const windowWidth = Dimensions.get('window').width;
  // Define largura da imagem como 70% da largura da tela, mas no máximo 300
  const imageWidth = Math.min(windowWidth * 0.7, 300);

  useEffect(() => {
    const loadEscolas = async () => {
      try {
        const escolasData = await fetchEscolas();
        setEscolas(escolasData);
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        Alert.alert('Erro', 'Não foi possível carregar a lista de escolas.');
      } finally {
        setLoading(false);
      }
    };
    loadEscolas();
  }, []);

  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      Nome: '',
      email: '',
      senha: '',
      rm: '',
      escola: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log('Dados do formulário:', data);
      if (!data.escola || data.escola === "NaN" || data.escola === "undefined") {
        Alert.alert('Erro', 'Por favor, selecione uma escola válida.');
        return;
      }
      console.log('Chamando criarAluno…');
      const resultado = await criarAluno({
        NomeAlu: data.Nome,
        Rm: data.rm,
        EmailAlu: data.email,
        SenhaAlu: data.senha,
        IdEsc: data.escola
      });
      console.log('Resultado criação aluno:', resultado);
      if (!resultado.status) {
        Alert.alert('Erro', resultado.Mensagem || 'Erro ao cadastrar aluno.');
        return;
      }
      if (resultado.status) {
        navigation.navigate('VerificationPage', { email: data.email });
      } else {
        Alert.alert('Aviso', resultado.Mensagem || 'Erro ao enviar código de verificação.');
      }
    } catch (error) {
      console.error('Erro no onSubmit:', error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao processar sua solicitação.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Imagem */}
          <View style={styles.logo}>
            <Image
              source={require('../../assets/Vestetec-removebg-preview.png')}
              style={{ width: imageWidth, height: imageWidth * 0.3, resizeMode: 'contain' }}
            />
          </View>

          {/* Container do formulário */}
          <View style={styles.minicontainer}>
            {/* Campo Nome */}
            <Controller
              control={control}
              name="Nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Nome"
                  onBlur={onBlur}
                />
              )}
            />
            {errors.Nome && <Text style={styles.error}>{errors.Nome.message}</Text>}

            {/* Campo RM */}
            <Controller
              control={control}
              name="rm"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  placeholder="RM"
                  keyboardType="numeric"
                  onBlur={onBlur}
                />
              )}
            />
            {errors.rm && <Text style={styles.error}>{errors.rm.message}</Text>}

            {/* Campo Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Email"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

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
                    placeholder="Crie sua Senha"
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
                      size={24}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.senha && <Text style={styles.error}>{errors.senha.message}</Text>}

            {/* Campo Escola (Dropdown) */}
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#740000" />
                <Text style={styles.loaderText}>Carregando escolas...</Text>
              </View>
            ) : (
              <>
                <Controller
                  control={control}
                  name="escola"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => {
                          console.log('Escola selecionada:', itemValue);
                          if (itemValue && itemValue !== "NaN") {
                            onChange(itemValue);
                            setValue('escola', itemValue, { shouldValidate: true });
                          }
                        }}
                        style={styles.picker}
                        dropdownIconColor="#390000"
                      >
                        <Picker.Item
                          label="Selecione uma escola"
                          value=""
                          style={styles.pickerPlaceholder}
                        />
                        {escolas.map((escola, index) => (
                          <Picker.Item
                            key={index}
                            label={escola.nome_esc}
                            value={escola.IdEsc}
                            style={styles.pickerItem}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
                <Text style={styles.debugInfo}>
                  Escola selecionada: {getValues().escola || 'nenhuma'}
                </Text>
              </>
            )}
            {errors.escola && <Text style={styles.error}>{errors.escola.message}</Text>}

            {/* Botão de Enviar */}
            <TouchableOpacity
              style={styles.btn}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <LinearGradient
                colors={["#740000", "#000000"]}
                style={styles.button}
              >
                <Text style={styles.txtBtn}>Cadastrar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Link para Login */}
          <View style={styles.conta}>
            <Text style={styles.txtConta}>Já possui uma conta?</Text>
            <TouchableOpacity
              style={styles.btnlogin}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.txtlogin}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#340000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  minicontainer: {
    backgroundColor: 'white',
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    // se quiser sombra:
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // elevation: 2,
  },
  input: {
    marginVertical: 6,
    backgroundColor: '#c7c7c7',
    height: 44,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#390000',
    fontSize: 14,
    paddingLeft: 12,
  },
  pickerContainer: {
    marginVertical: 6,
    backgroundColor: '#c7c7c7',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#390000',
    overflow: 'hidden'
  },
  picker: {
    height: 44,
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: '#888',
  },
  loaderContainer: {
    marginVertical: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666'
  },
  inputContainer: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: Platform.OS === 'ios' ? 12 : 10,
    zIndex: 1
  },
  error: {
    color: '#ce2340',
    alignSelf: 'flex-start',
    marginLeft: 4,
    fontSize: 13,
    marginTop: -4,
    marginBottom: 4
  },
  debugInfo: {
    color: '#666',
    alignSelf: 'center',
    fontSize: 12,
    marginBottom: 6
  },
  btn: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden'
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtBtn: {
    color: 'white',
    fontSize: 18,
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
    height: 44,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  txtlogin: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
