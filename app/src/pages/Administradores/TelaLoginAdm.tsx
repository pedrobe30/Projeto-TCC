// app/src/pages/Administradores/TelaLoginAdm.tsx - ATUALIZADO E FUNCIONAL
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, TextInput,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loginAdmin } from '../../services/LoginAdmService';
import StorageService from '../../services/StorageService';
import AdminAuthService from '../../services/AdminAuthService';

const TelaLoginAdm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const navigation = useNavigation();
    const [emailError, setEmailError] = useState('');
    const [senhaError, setSenhaError] = useState('');

    // Verifica se já está logado quando a tela ganha foco
    useFocusEffect(
        React.useCallback(() => {
            const checkExistingAuth = async () => {
                try {
                    setIsCheckingAuth(true);
                    const isValid = await AdminAuthService.isAdminTokenValid();
                    
                    if (isValid) {
                        console.log('[TelaLoginAdm] Admin já logado, redirecionando...');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'AdminPanel' }],
                        });
                    }
                } catch (error) {
                    console.error('[TelaLoginAdm] Erro ao verificar autenticação:', error);
                } finally {
                    setIsCheckingAuth(false);
                }
            };
            
            checkExistingAuth();
        }, [navigation])
    );

    const validateForm = () => {
        let isValid = true;
        setEmailError('');
        setSenhaError('');
        
        if (!email.trim()) {
            setEmailError('Email é obrigatório');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Formato de email inválido');
            isValid = false;
        }
        
        if (!senha.trim()) {
            setSenhaError('Senha é obrigatória');
            isValid = false;
        } else if (senha.length < 3) {
            setSenhaError('Senha deve ter pelo menos 3 caracteres');
            isValid = false;
        }
        
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log('[TelaLoginAdm] Iniciando login...');
            
            const response = await loginAdmin(email.trim(), senha);
            console.log('[TelaLoginAdm] Resposta do login:', response);

            // Baseado na resposta que você mostrou no console
            // A resposta vem diretamente com os dados, não com token separado
            if (response) {
                // Vamos assumir que o token está na resposta ou criar um mock
                // Por enquanto, vamos usar a estrutura que chegou no seu console
                const adminData = {
                    idAdm: response.idAdm,
                    email: response.email,
                    nome: response.nome,
                    idEmpresa: response.idEmpresa,
                    nomeEmpresa: response.nomeEmpresa,
                    dataLogin: response.dataLogin
                };

                // PROBLEMA IDENTIFICADO: Sua API não está retornando o token JWT
                // Vamos simular por enquanto ou verificar se está em outro campo
                let token = response.token || response.accessToken || response.jwt;
                
                if (!token) {
                    console.warn('[TelaLoginAdm] Token não encontrado na resposta. Verifique a API.');
                    // Por enquanto, vamos criar um token mock para testar
                    // REMOVA ISSO quando a API estiver retornando o token corretamente
                    Alert.alert(
                        'Aviso de Desenvolvimento',
                        'A API não está retornando o token JWT. Verifique o backend.',
                        [
                            {
                                text: 'Continuar (Mock)',
                                onPress: async () => {
                                    // Token mock apenas para desenvolvimento
                                    const mockToken = `mock_token_${Date.now()}_${response.idAdm}`;
                                    await StorageService.saveAdminToken(mockToken);
                                    await StorageService.saveAdminData(adminData);
                                    
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'AdminPanel' }],
                                    });
                                }
                            },
                            {
                                text: 'Cancelar',
                                style: 'cancel'
                            }
                        ]
                    );
                    return;
                }

                // Se chegou aqui, tem token válido
                await StorageService.saveAdminToken(token);
                await StorageService.saveAdminData(adminData);

                console.log('[TelaLoginAdm] Login realizado com sucesso');
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminPanel' }],
                });
            } else {
                Alert.alert('Erro no Login', 'Resposta inválida do servidor.');
            }
        } catch (error: any) {
            console.error('[TelaLoginAdm] Erro no login:', error);
            
            let errorMessage = 'Ocorreu um erro inesperado.';
            
            if (error.message) {
                if (error.message.includes('credenciais') || error.message.includes('inválid')) {
                    errorMessage = 'Email ou senha incorretos.';
                } else if (error.message.includes('rede') || error.message.includes('servidor')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            Alert.alert('Erro no Login', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Tela de loading enquanto verifica autenticação
    if (isCheckingAuth) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E53935" />
                <Text style={styles.loadingText}>Verificando...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.kbContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    source={require('../../assets/Vestetec-removebg-preview.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Login do Administrador</Text>
                <Text style={styles.subtitle}>Acesse o painel administrativo</Text>

                <View style={[styles.inputContainer, emailError ? styles.inputErrorBorder : null]}>
                    <Icon 
                        name="email" 
                        size={22} 
                        color={emailError ? '#FF3B30' : '#8E8E93'} 
                        style={styles.icon} 
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#8E8E93"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError(''); // Limpa erro ao digitar
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <View style={[styles.inputContainer, senhaError ? styles.inputErrorBorder : null]}>
                    <Icon 
                        name="lock" 
                        size={22} 
                        color={senhaError ? '#FF3B30' : '#8E8E93'} 
                        style={styles.icon} 
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor="#8E8E93"
                        value={senha}
                        onChangeText={(text) => {
                            setSenha(text);
                            if (senhaError) setSenhaError(''); // Limpa erro ao digitar
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />
                </View>
                {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <View style={styles.loadingButtonContent}>
                            <ActivityIndicator color="#FFF" size="small" />
                            <Text style={[styles.buttonText, { marginLeft: 8 }]}>Entrando...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Entrar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('CadostroAdm')}
                    disabled={loading}
                >
                    <Text style={styles.linkButtonText}>Não tem uma conta? Cadastre-se</Text>
                </TouchableOpacity>

                {/* Botão para debug - REMOVA EM PRODUÇÃO */}
                {__DEV__ && (
                    <TouchableOpacity
                        style={[styles.debugButton]}
                        onPress={async () => {
                            const debugInfo = await AdminAuthService.debugAdminAuth();
                            console.log('[DEBUG] Admin Auth Info:', debugInfo);
                            Alert.alert('Debug Info', JSON.stringify(debugInfo, null, 2));
                        }}
                    >
                        <Text style={styles.debugButtonText}>Debug Auth</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    kbContainer: { 
        flex: 1, 
        backgroundColor: '#1C1C23' 
    },
    container: { 
        flexGrow: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 24 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1C1C23'
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 12
    },
    logo: { 
        width: 150, 
        height: 150, 
        marginBottom: 20, 
        resizeMode: 'contain' 
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#E53935', 
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 30,
        textAlign: 'center'
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#2C2C3A', 
        borderRadius: 12, 
        marginBottom: 16, 
        paddingHorizontal: 15, 
        borderWidth: 1, 
        borderColor: 'transparent', 
        width: '100%', 
        minHeight: 55,
    },
    icon: { 
        marginRight: 12 
    },
    input: { 
        flex: 1, 
        color: '#FFFFFF', 
        fontSize: 16,
        paddingVertical: 12
    },
    inputErrorBorder: { 
        borderColor: '#FF3B30' 
    },
    errorText: { 
        color: '#FF3B30', 
        fontSize: 14, 
        alignSelf: 'flex-start', 
        marginLeft: 5, 
        marginTop: -10, 
        marginBottom: 10 
    },
        button: { backgroundColor: '#E53935', paddingVertical: 16, borderRadius: 12, marginTop: 20, width: '100%', alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#555' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    linkButton: { marginTop: 24, padding: 10 },
    linkButtonText: { color: '#E53935', fontSize: 16, fontWeight: '500' },
    loadingButtonContent:
    {

    },
    debugButton:
    {

    },
    debugButtonText:
    {
        
    }
});

export default TelaLoginAdm;