// app/src/pages/Visualizandoprodutos/TelaAtualizar.tsx (CORRIGIDO)
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image,
  StyleSheet, ActivityIndicator, Modal, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { cadastroProdutoService } from '../../services/CadastroProdutoService';
import { produtoService } from '../../services/ProdutoApii';
import { API_BASE_URL } from '../../services/config';

// Interfaces (sem alteração)
interface TamanhoQuantidade { tamanho: string; quantidade: number; }
interface Categoria { idCategoria: number; categoria: string; }
interface Modelo { idModelo: number; modelo: string; }
interface Tecido { idTecido: number; tipoTecido: string; }

export default function TelaAtualizar({ route, navigation }: any) {
  const { produtoId } = route.params;

  // Estados (sem alteração de lógica)
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalImagemVisible, setModalImagemVisible] = useState(false);
  const [preco, setPreco] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | undefined>(undefined);
  const [idModelo, setIdModelo] = useState<number | undefined>(undefined);
  const [idTecido, setIdTecido] = useState<number | undefined>(undefined);
  const [idStatus, setIdStatus] = useState<number>(1);
  const [tamanhosQuantidades, setTamanhosQuantidades] = useState<TamanhoQuantidade[]>([{ tamanho: '', quantidade: 0 }]);
  const [imagemSelecionada, setImagemSelecionada] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [imagemOriginalUrl, setImagemOriginalUrl] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tecidos, setTecidos] = useState<Tecido[]>([]);

  // Carregamento de dados (sem alteração de lógica)
  useEffect(() => {
    const carregarDados = async () => {
      setLoadingData(true);
      try {
        const [respProd, respCat, respMod, respTec] = await Promise.all([
          produtoService.getProdutoById(produtoId),
          cadastroProdutoService.buscarCategorias(),
          cadastroProdutoService.buscarModelos(),
          cadastroProdutoService.buscarTecidos(),
        ]);
        setCategorias(Array.isArray(respCat.dados) ? respCat.dados : []);
        setModelos(Array.isArray(respMod.dados) ? respMod.dados : []);
        setTecidos(Array.isArray(respTec.dados) ? respTec.dados : []);

        const produto = respProd.dados;
        if (produto) {
          setPreco(produto.preco.toString());
          setIdCategoria(produto.idCategoria);
          setIdModelo(produto.idModelo);
          setIdTecido(produto.idTecido);
          setIdStatus(produto.idStatus);
          setTamanhosQuantidades(produto.tamanhosQuantidades?.length > 0 ? produto.tamanhosQuantidades : [{ tamanho: '', quantidade: 0 }]);
          if (produto.imgUrl) {
            const imageUrl = produto.imgUrl.startsWith('http') ? produto.imgUrl : `${API_BASE_URL.replace('/api', '')}/${produto.imgUrl}`;
            setImagemOriginalUrl(imageUrl);
          }
        } else {
          Alert.alert('Erro', 'Produto não encontrado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } finally {
        setLoadingData(false);
      }
    };
    carregarDados();
  }, [produtoId]);

  // Funções de manipulação
  const adicionarTamanho = () => setTamanhosQuantidades(prev => [...prev, { tamanho: '', quantidade: 0 }]);
  const removerTamanho = (index: number) => setTamanhosQuantidades(prev => prev.filter((_, i) => i !== index));

  // <<<---- CORREÇÃO APLICADA AQUI ---->>>
  const atualizarTamanho = (index: number, field: 'tamanho' | 'quantidade', value: string) => {
    const copia = [...tamanhosQuantidades];
    if (field === 'tamanho') {
        copia[index].tamanho = value;
    } else {
        copia[index].quantidade = parseInt(value, 10) || 0;
    }
    setTamanhosQuantidades(copia);
  };

  const handleImagePicker = async (pickerFunction: () => Promise<ImagePicker.ImagePickerResult>) => {
    try {
        const result = await pickerFunction();
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const name = asset.uri.split('/').pop() || `img.jpg`;
            const type = `image/${name.split('.').pop()}`;
            setImagemSelecionada({ uri: asset.uri, name, type });
        }
    } catch (error) { Alert.alert('Erro', 'Não foi possível acessar a imagem.'); }
    finally { setModalImagemVisible(false); }
  }

  const selecionarImagem = () => handleImagePicker(ImagePicker.launchImageLibraryAsync.bind(null, { quality: 1, allowsEditing: true, aspect: [1, 1] }));
  const tirarFoto = () => handleImagePicker(ImagePicker.launchCameraAsync.bind(null, { quality: 1, allowsEditing: true, aspect: [1, 1] }));

  const handleSubmit = async () => {
    // Validações (sem alteração de lógica)
    if (!preco.trim() || isNaN(Number(preco)) || Number(preco) <= 0) { Alert.alert('Validação', 'Informe um preço válido.'); return; }
    if (!idCategoria || !idModelo || !idTecido || !idStatus) { Alert.alert('Validação', 'Todos os campos com * são obrigatórios.'); return; }
    const tqValidos = tamanhosQuantidades.filter(tq => tq.tamanho?.trim() && tq.quantidade > 0);
    if (tqValidos.length === 0) { Alert.alert('Validação', 'Informe ao menos um tamanho com quantidade maior que zero.'); return; }

    const dadosProduto = {
      preco: parseFloat(preco), idCategoria, idModelo, idTecido, idStatus,
      descricao: '', imagem: imagemSelecionada, tamanhosQuantidades: tqValidos,
    };
    setSubmitting(true);
    try {
      const resp = await cadastroProdutoService.atualizarProduto(produtoId, dadosProduto);
      if (resp.status) {
        Alert.alert('Sucesso', resp.mensagem || 'Produto atualizado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else { Alert.alert('Erro ao Atualizar', resp.mensagem); }
    } catch (error) { Alert.alert('Erro', 'Falha na comunicação. Tente novamente.'); }
    finally { setSubmitting(false); }
  };

  const renderHeader = () => (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Produto</Text>
    </View>
  );

  if (loadingData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centered}><ActivityIndicator size="large" color="#4A90E2" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imagePickerContainer}>
            <TouchableOpacity onPress={() => setModalImagemVisible(true)}>
                <Image source={{ uri: imagemSelecionada ? imagemSelecionada.uri : imagemOriginalUrl || 'https://via.placeholder.com/300' }} style={styles.previewImagem} />
                <View style={styles.imageOverlay}>
                    <Ionicons name="camera-outline" size={32} color="#FFF" />
                </View>
            </TouchableOpacity>
        </View>

        <Text style={styles.label}>Preço *</Text>
        <TextInput style={styles.input} value={preco} onChangeText={setPreco} placeholder="R$ 0,00" keyboardType="numeric" />

        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={idCategoria} onValueChange={(val) => setIdCategoria(val)}>
            {categorias.map((cat) => <Picker.Item key={cat.idCategoria} label={cat.categoria} value={cat.idCategoria} />)}
          </Picker>
        </View>
        
        <Text style={styles.label}>Modelo *</Text>
        <View style={styles.pickerContainer}><Picker selectedValue={idModelo} onValueChange={setIdModelo}>{modelos.map(m => <Picker.Item key={m.idModelo} label={m.modelo} value={m.idModelo}/>)}</Picker></View>
        <Text style={styles.label}>Tecido *</Text>
        <View style={styles.pickerContainer}><Picker selectedValue={idTecido} onValueChange={setIdTecido}>{tecidos.map(t => <Picker.Item key={t.idTecido} label={t.tipoTecido} value={t.idTecido}/>)}</Picker></View>
        <Text style={styles.label}>Status *</Text>
        <View style={styles.pickerContainer}><Picker selectedValue={idStatus} onValueChange={setIdStatus}><Picker.Item label="Disponível" value={1} /><Picker.Item label="Indisponível" value={2} /></Picker></View>

        <View style={styles.sizeSection}>
            <Text style={styles.label}>Tamanhos e Estoque</Text>
            {tamanhosQuantidades.map((tq, idx) => (
            <View key={idx} style={styles.sizeRow}>
                <TextInput style={[styles.input, styles.sizeInput]} placeholder="Tamanho (Ex: P, M, G)" value={tq.tamanho} onChangeText={text => atualizarTamanho(idx, 'tamanho', text)} />
                <TextInput style={[styles.input, styles.sizeInput]} placeholder="Qtd." value={String(tq.quantidade)} onChangeText={text => atualizarTamanho(idx, 'quantidade', text)} keyboardType="numeric" />
                <TouchableOpacity style={styles.removeButton} onPress={() => removerTamanho(idx)}><Ionicons name="trash-outline" size={22} color="#D0021B" /></TouchableOpacity>
            </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={adicionarTamanho}><Ionicons name="add-circle-outline" size={22} color="#FFF" /><Text style={styles.addButtonText}>Adicionar Tamanho</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.submitButton, submitting && { backgroundColor: '#BDBDBD' }]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Salvar Alterações</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalImagemVisible} transparent animationType="fade" onRequestClose={() => setModalImagemVisible(false)}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setModalImagemVisible(false)}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Alterar Imagem</Text>
                <TouchableOpacity style={styles.modalOption} onPress={tirarFoto}><Ionicons name="camera-outline" size={24} color="#4A90E2" /><Text style={styles.modalOptionText}>Tirar Foto</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={selecionarImagem}><Ionicons name="image-outline" size={24} color="#4A90E2" /><Text style={styles.modalOptionText}>Escolher da Galeria</Text></TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos (sem alteração)
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomColor: '#EEE', borderBottomWidth: 1, backgroundColor: '#FFF'},
    menuButton: { padding: 5, marginRight: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F2F2F' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9FC' },
    container: { padding: 20, paddingBottom: 40, backgroundColor: '#FFF' },
    imagePickerContainer: { alignItems: 'center', marginBottom: 24 },
    previewImagem: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: '#4A90E2' },
    imageOverlay: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F7F9FC', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
    pickerContainer: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F7F9FC', borderRadius: 12, overflow: 'hidden' },
    sizeSection: { marginTop: 24 },
    sizeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    sizeInput: { flex: 1 },
    removeButton: { padding: 10, backgroundColor: '#FEE', borderRadius: 12 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#27ae60', padding: 12, borderRadius: 12, marginTop: 8 },
    addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    submitButton: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
    submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, width: '85%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalOptionText: { fontSize: 18, color: '#4A90E2', marginLeft: 15 },
});