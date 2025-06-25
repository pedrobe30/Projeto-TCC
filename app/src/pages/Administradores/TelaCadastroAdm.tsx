// app/src/pages/Admin/TelaCadastroAdm.tsx (CORRIGIDO)
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import { cadastrarAdmin, checkEmailExists } from '../../services/AdminServices';
import { getEmpresasForDropdown } from '../../services/EmpresaService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../../services/StorageService';

interface EmpresaDropdown {
    idEmpresa: string;
    nome: string;
}

const TelaCadastroAdm: React.FC = () => {
    // Estados
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [codigoPreciso, setCodigoPreciso] = useState('');
    const [idEmpresa, setIdEmpresa] = useState<string>('');
    const [empresaSelecionada, setEmpresaSelecionada] = useState<string>('');
    const [empresas, setEmpresas] = useState<EmpresaDropdown[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();
    const [emailError, setEmailError] = useState('');
    const [senhaError, setSenhaError] = useState('');
    const [nomeError, setNomeError] = useState('');
    const [codigoPrecisoError, setCodigoPrecisoError] = useState('');
    const [empresaError, setEmpresaError] = useState('');

    // Fetch empresas
    useEffect(() => {
        const fetchEmpresas = async () => {
            setLoadingEmpresas(true);
            try {
                const data = await getEmpresasForDropdown();
                setEmpresas(data && Array.isArray(data) ? data : []);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar a lista de empresas.');
                setEmpresas([]);
            } finally {
                setLoadingEmpresas(false);
            }
        };
        fetchEmpresas();
    }, []);

    // Limpar erros quando o usuário digita
    useEffect(() => {
        if (email) setEmailError('');
    }, [email]);

    useEffect(() => {
        if (senha) setSenhaError('');
    }, [senha]);

    useEffect(() => {
        if (nome) setNomeError('');
    }, [nome]);

    useEffect(() => {
        if (codigoPreciso) setCodigoPrecisoError('');
    }, [codigoPreciso]);

    useEffect(() => {
        if (idEmpresa) setEmpresaError('');
    }, [idEmpresa]);

    // Validação do formulário
    const validateForm = async () => {
        let isValid = true;

        // Limpar erros anteriores
        setEmailError('');
        setSenhaError('');
        setNomeError('');
        setCodigoPrecisoError('');
        setEmpresaError('');

        // Validar email
        if (!email.trim()) {
            setEmailError('Email é obrigatório');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Email inválido');
            isValid = false;
        } else {
            try {
                const emailExists = await checkEmailExists(email);
                if (emailExists) {
                    setEmailError('Este email já está cadastrado');
                    isValid = false;
                }
            } catch (error) {
                console.log('Erro ao verificar email:', error);
                // Continua com a validação mesmo se houver erro na verificação
            }
        }

        // Validar senha
        if (!senha.trim()) {
            setSenhaError('Senha é obrigatória');
            isValid = false;
        } else if (senha.length < 6) {
            setSenhaError('Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }

        // Validar nome
        if (!nome.trim()) {
            setNomeError('Nome é obrigatório');
            isValid = false;
        } else if (nome.trim().length < 2) {
            setNomeError('Nome deve ter pelo menos 2 caracteres');
            isValid = false;
        }

        // Validar código preciso
        if (!codigoPreciso.trim()) {
            setCodigoPrecisoError('Código preciso é obrigatório');
            isValid = false;
        } else if (codigoPreciso !== '0309') {
            setCodigoPrecisoError('Código preciso inválido');
            isValid = false;
        }

        // Validar empresa
        if (!idEmpresa) {
            setEmpresaError('Selecione uma empresa');
            isValid = false;
        }

        return isValid;
    };

    // Função de cadastro
    const handleCadastro = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const isValid = await validateForm();
            if (!isValid) {
                setLoading(false);
                return;
            }

            const adminData = {
                email: email.trim(),
                senha: senha,
                nome: nome.trim(),
                codigoPreciso: codigoPreciso.trim(),
                idEmpresa: parseInt(idEmpresa)
            };

            console.log('Dados sendo enviados:', adminData);

            await cadastrarAdmin(adminData);

            Alert.alert(
                'Sucesso!',
                'Administrador cadastrado com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                        // 1) Limpa qualquer token/adminData existente
                        await StorageService.removeAdminToken();
                        await StorageService.removeAdminData();

                        // 2) Limpa o formulário
                        setEmail('');
                        setSenha('');
                        setNome('');
                        setCodigoPreciso('');
                        setIdEmpresa('');
                        setEmpresaSelecionada('');

                        // 3) Navega para login admin
                        navigation.navigate('LoginAdm' as never);
      }
                      
                        
                    }
                ]
            );

        } catch (error: any) {
            console.error('Erro no cadastro:', error);
            
            let errorMessage = 'Erro ao cadastrar administrador. Tente novamente.';
            
            if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const selecionarEmpresa = (empresa: EmpresaDropdown) => {
        setIdEmpresa(empresa.idEmpresa);
        setEmpresaSelecionada(empresa.nome);
        setModalVisible(false);
        setEmpresaError('');
    };

    const renderEmpresaItem = ({ item }: { item: EmpresaDropdown }) => (
        <TouchableOpacity style={styles.modalItem} onPress={() => selecionarEmpresa(item)}>
            <Text style={styles.modalItemText}>{item.nome}</Text>
        </TouchableOpacity>
    );

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
                <Text style={styles.title}>Cadastro de Administrador</Text>

                {/* Email Input */}
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
                        editable={!loading}
                    />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                {/* Senha Input */}
                <View style={[styles.inputContainer, senhaError ? styles.inputErrorBorder : null]}>
                    <Icon name="lock" size={22} color={senhaError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Senha" 
                        placeholderTextColor="#8E8E93" 
                        value={senha} 
                        onChangeText={setSenha} 
                        secureTextEntry
                        editable={!loading}
                    />
                </View>
                {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

                {/* Nome Input */}
                <View style={[styles.inputContainer, nomeError ? styles.inputErrorBorder : null]}>
                    <Icon name="person" size={22} color={nomeError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Nome completo" 
                        placeholderTextColor="#8E8E93" 
                        value={nome} 
                        onChangeText={setNome}
                        editable={!loading}
                    />
                </View>
                {nomeError ? <Text style={styles.errorText}>{nomeError}</Text> : null}

                {/* Código Preciso Input */}
                <View style={[styles.inputContainer, codigoPrecisoError ? styles.inputErrorBorder : null]}>
                    <Icon name="vpn-key" size={22} color={codigoPrecisoError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Código Preciso" 
                        placeholderTextColor="#8E8E93" 
                        value={codigoPreciso} 
                        onChangeText={setCodigoPreciso} 
                        keyboardType="numeric"
                        editable={!loading}
                    />
                </View>
                {codigoPrecisoError ? <Text style={styles.errorText}>{codigoPrecisoError}</Text> : null}

                {/* Seletor de Empresa */}
                <TouchableOpacity
                    style={[styles.inputContainer, styles.pickerContainer, empresaError ? styles.inputErrorBorder : null]}
                    onPress={() => !loadingEmpresas && empresas.length > 0 && !loading && setModalVisible(true)}
                    disabled={loadingEmpresas || empresas.length === 0 || loading}
                >
                    <Icon name="business" size={22} color={empresaError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <Text style={[styles.pickerText, !empresaSelecionada && styles.placeholderText]}>
                        {loadingEmpresas ? "Carregando..." : empresaSelecionada || "Selecione uma empresa"}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#8E8E93" />
                </TouchableOpacity>
                {empresaError ? <Text style={styles.errorText}>{empresaError}</Text> : null}

                {/* Botão de Cadastrar */}
                <TouchableOpacity 
                    style={[styles.button, (loading || loadingEmpresas) && styles.buttonDisabled]} 
                    onPress={handleCadastro} 
                    disabled={loading || loadingEmpresas}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    )}
                </TouchableOpacity>

                {/* Link para Login */}
                <TouchableOpacity 
                    style={styles.linkButton} 
                    onPress={() => navigation.navigate('LoginAdm' as never)}
                    disabled={loading}
                >
                    <Text style={styles.linkButtonText}>Já tem uma conta? Faça login</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal de Seleção de Empresa */}
            <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Empresa</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Icon name="close" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>
                        <FlatList 
                            data={empresas} 
                            keyExtractor={(item) => item.idEmpresa} 
                            renderItem={renderEmpresaItem}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    kbContainer: { flex: 1, backgroundColor: '#1C1C23' },
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    logo: { width: 150, height: 150, marginBottom: 30, resizeMode: 'contain' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 30 },
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
        minHeight: 55 
    },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
    inputErrorBorder: { borderColor: '#FF3B30' },
    errorText: { 
        color: '#FF3B30', 
        fontSize: 14, 
        alignSelf: 'flex-start', 
        marginLeft: 5, 
        marginTop: -10, 
        marginBottom: 10 
    },
    pickerContainer: { justifyContent: 'space-between', paddingVertical: 15 },
    pickerText: { color: '#FFFFFF', fontSize: 16 },
    placeholderText: { color: '#8E8E93' },
    button: { 
        backgroundColor: '#E53935', 
        paddingVertical: 16, 
        borderRadius: 12, 
        marginTop: 20, 
        width: '100%', 
        alignItems: 'center' 
    },
    buttonDisabled: { backgroundColor: '#555' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    linkButton: { marginTop: 24, padding: 10 },
    linkButtonText: { color: '#E53935', fontSize: 16, fontWeight: '500' },
    
    // Estilos do Modal
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalContent: { 
        backgroundColor: '#2C2C3A', 
        borderRadius: 12, 
        width: '90%', 
        maxHeight: '60%', 
        padding: 20 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 15, 
        paddingBottom: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#444' 
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
    closeButton: { padding: 5 },
    modalItem: { 
        paddingVertical: 18, 
        borderBottomWidth: 1, 
        borderBottomColor: '#444' 
    },
    modalItemText: { color: '#FFF', fontSize: 16 },
});

export default TelaCadastroAdm;