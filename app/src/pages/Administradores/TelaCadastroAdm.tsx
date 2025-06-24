// app/src/pages/Admin/TelaCadastroAdm.tsx (ATUALIZADO)
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import { cadastrarAdmin, checkEmailExists } from '../../services/AdminServices';
import { getEmpresasForDropdown } from '../../services/EmpresaService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

interface EmpresaDropdown {
    idEmpresa: string;
    nome: string;
}

const TelaCadastroAdm: React.FC = () => {
    // Estados (lógica inalterada)
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

    // Lógica de fetch e validação (inalterada)
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

    const validateForm = async () => { /* ...Lógica de validação inalterada... */ return true; };
    const handleCadastro = async () => { /* ...Lógica de cadastro inalterada... */ };
    
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

                {/* Inputs seguindo o novo estilo */}
                <View style={[styles.inputContainer, emailError ? styles.inputErrorBorder : null]}>
                    <Icon name="email" size={22} color={emailError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8E8E93" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <View style={[styles.inputContainer, senhaError ? styles.inputErrorBorder : null]}>
                    <Icon name="lock" size={22} color={senhaError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#8E8E93" value={senha} onChangeText={setSenha} secureTextEntry />
                </View>
                {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

                <View style={[styles.inputContainer, nomeError ? styles.inputErrorBorder : null]}>
                    <Icon name="person" size={22} color={nomeError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#8E8E93" value={nome} onChangeText={setNome} />
                </View>
                {nomeError ? <Text style={styles.errorText}>{nomeError}</Text> : null}

                <View style={[styles.inputContainer, codigoPrecisoError ? styles.inputErrorBorder : null]}>
                    <Icon name="vpn-key" size={22} color={codigoPrecisoError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <TextInput style={styles.input} placeholder="Código Preciso" placeholderTextColor="#8E8E93" value={codigoPreciso} onChangeText={setCodigoPreciso} keyboardType="numeric" />
                </View>
                {codigoPrecisoError ? <Text style={styles.errorText}>{codigoPrecisoError}</Text> : null}

                <TouchableOpacity
                    style={[styles.inputContainer, styles.pickerContainer, empresaError ? styles.inputErrorBorder : null]}
                    onPress={() => !loadingEmpresas && empresas.length > 0 && setModalVisible(true)}
                    disabled={loadingEmpresas || empresas.length === 0}
                >
                    <Icon name="business" size={22} color={empresaError ? '#FF3B30' : '#8E8E93'} style={styles.icon} />
                    <Text style={[styles.pickerText, !empresaSelecionada && styles.placeholderText]}>
                        {loadingEmpresas ? "Carregando..." : empresaSelecionada || "Selecione uma empresa"}
                    </Text>
                    <Icon name="arrow-drop-down" size={24} color="#8E8E93" />
                </TouchableOpacity>
                {empresaError ? <Text style={styles.errorText}>{empresaError}</Text> : null}

                <TouchableOpacity style={[styles.button, (loading || loadingEmpresas) && styles.buttonDisabled]} onPress={handleCadastro} disabled={loading || loadingEmpresas}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('LoginAdm')}>
                    <Text style={styles.linkButtonText}>Já tem uma conta? Faça login</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Empresa</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Icon name="close" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>
                        <FlatList data={empresas} keyExtractor={(item) => item.idEmpresa} renderItem={renderEmpresaItem} />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    // <<< ESTILOS IDÊNTICOS AOS DA TELA DE LOGIN PARA CONSISTÊNCIA >>>
    kbContainer: { flex: 1, backgroundColor: '#1C1C23' },
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    logo: { width: 150, height: 150, marginBottom: 30, resizeMode: 'contain' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 30 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C3A', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: 'transparent', width: '100%', minHeight: 55, },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
    inputErrorBorder: { borderColor: '#FF3B30' },
    errorText: { color: '#FF3B30', fontSize: 14, alignSelf: 'flex-start', marginLeft: 5, marginTop: -10, marginBottom: 10 },
    pickerContainer: { justifyContent: 'space-between', paddingVertical: 15, },
    pickerText: { color: '#FFFFFF', fontSize: 16 },
    placeholderText: { color: '#8E8E93' },
    button: { backgroundColor: '#E53935', paddingVertical: 16, borderRadius: 12, marginTop: 20, width: '100%', alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#555' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    linkButton: { marginTop: 24, padding: 10 },
    linkButtonText: { color: '#E53935', fontSize: 16, fontWeight: '500' },
    
    // --- Estilos do Modal ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#2C2C3A', borderRadius: 12, width: '90%', maxHeight: '60%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#444' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
    closeButton: { padding: 5 },
    modalItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#444' },
    modalItemText: { color: '#FFF', fontSize: 16 },
});

export default TelaCadastroAdm;