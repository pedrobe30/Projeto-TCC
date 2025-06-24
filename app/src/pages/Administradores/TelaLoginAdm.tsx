// app/src/pages/Administradores/TelaLoginAdm.tsx (ATUALIZADO E FUNCIONAL)
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, TextInput,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { loginAdmin } from '../../services/LoginAdmService';
import StorageService from '../../services/StorageService'; // Importe o serviço de storage

const TelaLoginAdm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [emailError, setEmailError] = useState('');
    const [senhaError, setSenhaError] = useState('');

    const validateForm = () => {
        let isValid = true;
        setEmailError('');
        setSenhaError('');
        if (!email) {
            setEmailError('Email é obrigatório');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Formato de email inválido');
            isValid = false;
        }
        if (!senha) {
            setSenhaError('Senha é obrigatória');
            isValid = false;
        }
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await loginAdmin(email, senha);
            
            // <<< LÓGICA DE TOKEN ADICIONADA >>>
            if (response && response.token && response.data) {
                // Salva o token e os dados do admin
                await StorageService.saveAdminToken(response.token);
                await StorageService.saveAdminData(response.data);
                
                Alert.alert('Sucesso', 'Login realizado com sucesso!');
                
                // Redefine a navegação para o painel de admin, impedindo o "voltar" para o login
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminPanel' }],
                });
            } else {
                throw new Error(response.message || 'Resposta inválida do servidor.');
            }
        } catch (error: any) {
            Alert.alert('Erro no Login', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.kbContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Image
                    source={require('../../assets/Vestetec-removebg-preview.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Login do Administrador</Text>

                <View style={[styles.inputContainer, emailError ? styles.inputErrorBorder : null]}>
                    <Icon name="email" size={22} color={emailError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#8E8E93"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <View style={[styles.inputContainer, senhaError ? styles.inputErrorBorder : null]}>
                    <Icon name="lock" size={22} color={senhaError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor="#8E8E93"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                    />
                </View>
                {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('CadostroAdm')}
                >
                    <Text style={styles.linkButtonText}>Não tem uma conta? Cadastre-se</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Estilos já refinados anteriormente
const styles = StyleSheet.create({
    kbContainer: { flex: 1, backgroundColor: '#1C1C23' },
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    logo: { width: 150, height: 150, marginBottom: 30, resizeMode: 'contain' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#E53935', marginBottom: 30 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C3A', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: 'transparent', width: '100%', minHeight: 55, },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
    inputErrorBorder: { borderColor: '#FF3B30' },
    errorText: { color: '#FF3B30', fontSize: 14, alignSelf: 'flex-start', marginLeft: 5, marginTop: -10, marginBottom: 10 },
    button: { backgroundColor: '#E53935', paddingVertical: 16, borderRadius: 12, marginTop: 20, width: '100%', alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#555' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    linkButton: { marginTop: 24, padding: 10 },
    linkButtonText: { color: '#E53935', fontSize: 16, fontWeight: '500' },
});

export default TelaLoginAdm;