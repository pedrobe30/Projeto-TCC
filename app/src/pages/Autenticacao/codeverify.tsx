import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { verificarCodigo, reenviarCodigo } from '../../services/authService';

// VerificationScreen component receives email and navigation from previous screen
const VerificationPage = ({ route, navigation }) => {
  // Extract email from route params
  const email = route.params?.email || ''
  
  // State variables
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  
  // Create refs for each input field to enable auto-focus functionality
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Timer for resend cooldown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle input changes and auto-focus to next field
  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;
    
    // Update the code state
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Auto-focus logic
    if (text.length === 1 && index < code.length - 1) {
      // Move to next input
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace key press to move to previous input
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputRefs[index - 1].current.focus();
    }
  };

  

  // Verify the code with API
  const verifyCode = async () => {
    // Check if code is complete
    if (code.some(digit => digit === '')) {
      setError('Por Favor, Digite o Codigo Inteiro');
      return;
    }

    setLoading(true);
    try {
      // Call API with combined code and email
      const completeCode = code.join('');
      console.log('Verificando com:', { Codigo: completeCode, Email: email });
      const response = await verificarCodigo({ 
        Codigo: completeCode, 
        Email: email 
      });
      console.log('>>> resposta de verificarCodigo:', response);
      
      // Check response from API
      if (response.status === true) {
        // Navigate to login screen on success
        navigation.navigate('Login', { email });
      } else {
        setError(response.Mensagem || 'codigo Incorreto');
      }
    } catch (error) {
      setError(error.message || 'Error na verificacao de codigo');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code functionality
  const handleResendCode = async () => {
    setLoading(true);
    setResendDisabled(true);
    
    try {
      const response = await reenviarCodigo(email);
      if (response.status) {
        // Start countdown after successful resend
        setCountdown(60);
        Alert.alert('Codigo Enviado', 'Um novo codigo de verificação foi enviado para seu e-mail');
      } else {
        setError(response.Mensagem || 'falha ao reenviar codigo');
        setResendDisabled(false);
      }
    } catch (error) {
      setError(error.message || 'Error ao reenviar codigo');
      setResendDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Verificação de Conta</Text>
          
          <Text style={styles.subtitle}>
            Digite os 6 numeros enviado para {email}
          </Text>
          
          {/* Code input fields */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : {},
                  error ? styles.codeInputError : {}
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          
          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          {/* Verify button */}
          <TouchableOpacity 
            style={styles.verifyButton} 
            onPress={verifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verificar Codigo</Text>
            )}
          </TouchableOpacity>
          
          {/* Resend code option */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Não recebeu seu codigo? </Text>
            {resendDisabled ? (
              <Text style={styles.countdownText}>Resend in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                <Text style={styles.resendLink}>Reenviar codigo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 32,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    width: 50,
    height: 60,
    backgroundColor: '#F9F9F9',
  },
  codeInputFilled: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF4FF',
  },
  codeInputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    color: '#666666',
    fontSize: 14,
  },
  resendLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  countdownText: {
    color: '#999999',
    fontSize: 14,
  },
});

export default VerificationPage;