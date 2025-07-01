import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image,
  StyleSheet, ActivityIndicator, Modal, SafeAreaView,
} from 'react-native';
// <<< IMPORTAÇÃO CORRIGIDA >>>
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { cadastroProdutoService } from '../../services/CadastroProdutoService';
import { produtoService } from '../../services/ProdutoApii';
import { API_BASE_URL } from '../../services/config';

// ... (interfaces permanecem as mesmas)
interface TamanhoQuantidade { tamanho: string; quantidade: number; }
interface Categoria { idCategoria: number; categoria: string; }
interface Modelo { idModelo: number; modelo: string; }
interface Tecido { idTecido: number; tipoTecido: string; }
interface ImagemExistente { idProdutoImagem: number; imgUrl: string; }
interface ImagemNova { uri: string; name: string; type: string; }

export default function TelaAtualizar({ route, navigation }: any) {
  // ... (estados permanecem os mesmos)
  const { produtoId } = route.params;

  // Estados
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalImagemVisible, setModalImagemVisible] = useState(false);
  
  // Estados do formulário
  const [preco, setPreco] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | undefined>(undefined);
  const [idModelo, setIdModelo] = useState<number | undefined>(undefined);
  const [idTecido, setIdTecido] = useState<number | undefined>(undefined);
  const [idStatus, setIdStatus] = useState<number>(1);
  const [descricao, setDescricao] = useState('');
  const [tamanhosQuantidades, setTamanhosQuantidades] = useState<TamanhoQuantidade[]>([{ tamanho: '', quantidade: 0 }]);
  

  const [imagensExistentes, setImagensExistentes] = useState<ImagemExistente[]>([]);
  const [novasImagens, setNovasImagens] = useState<ImagemNova[]>([]);
  const [idsImagensParaRemover, setIdsImagensParaRemover] = useState<number[]>([]);

  // Estados de dados
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tecidos, setTecidos] = useState<Tecido[]>([]);
  const [statusOptions, setStatusOptions] = useState<{label: string, value: number}[]>([{label: "Disponível", value: 1}, {label: "Indisponível", value: 2}]);


  // ... (useEffect de carregamento de dados permanece o mesmo)
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
          setDescricao(produto.descricao || '');
          setTamanhosQuantidades(produto.tamanhosQuantidades?.length > 0 ? produto.tamanhosQuantidades : [{ tamanho: '', quantidade: 0 }]);
          setImagensExistentes(produto.imagens || []);
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


 

  const totalImagensAtual = imagensExistentes.filter(img => !idsImagensParaRemover.includes(img.idProdutoImagem)).length + novasImagens.length;

  const handleImagePicker = async (pickerFunction: () => Promise<ImagePicker.ImagePickerResult>) => {
    if (totalImagensAtual >= 4) {
      Alert.alert('Limite atingido', 'Você só pode ter no máximo 4 imagens.');
      setModalImagemVisible(false);
      return;
    }
    try {
      const result = await pickerFunction();
      if (!result.canceled && result.assets) {
        const imgs = result.assets.map(asset => {
            const uri = asset.uri;
            const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const type = asset.mimeType || 'image/jpeg';
            return { uri, name: fileName, type };
        }).filter(img => img.uri);

        const totalFinal = totalImagensAtual + imgs.length;
         if (totalFinal > 4) {
            Alert.alert('Limite Excedido', `Você só pode adicionar mais ${4 - totalImagensAtual} imagens.`);
            setNovasImagens(prev => [...prev, ...imgs.slice(0, 4 - totalImagensAtual)]);
         } else {
            setNovasImagens(prev => [...prev, ...imgs]);
         }
      }
    } catch (error) { Alert.alert('Erro', 'Não foi possível acessar a imagem.'); }
    finally { setModalImagemVisible(false); }
  };

  const selecionarImagem = () => handleImagePicker(() => 
    ImagePicker.launchImageLibraryAsync({ 
        // <<< SINTAXE CORRIGIDA >>>
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        quality: 1, 
        allowsMultipleSelection: true, 
        selectionLimit: 4 - totalImagensAtual 
    })
  );

  const tirarFoto = () => handleImagePicker(() => 
    ImagePicker.launchCameraAsync({ 
     
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1, 
        allowsEditing: true, 
        aspect: [1, 1] 
    })
  );

  const removerNovaImagem = (index: number) => setNovasImagens(prev => prev.filter((_, i) => i !== index));
  const toggleRemoverImagemExistente = (id: number) => {
    setIdsImagensParaRemover(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  
  const adicionarTamanho = () => setTamanhosQuantidades(prev => [...prev, { tamanho: '', quantidade: 0 }]);
  const removerTamanho = (index: number) => setTamanhosQuantidades(prev => prev.filter((_, i) => i !== index));
  const atualizarTamanho = (index: number, field: 'tamanho' | 'quantidade', value: string) => {
    const copia = [...tamanhosQuantidades];
    if (field === 'tamanho') {
        copia[index].tamanho = value;
    } else {
        copia[index].quantidade = parseInt(value, 10) || 0;
    }
    setTamanhosQuantidades(copia);
  };

  const handleSubmit = async () => {
    if (!preco.trim() || isNaN(Number(preco)) || Number(preco) <= 0) { Alert.alert('Validação', 'Preço inválido.'); return; }
    if (!idCategoria || !idModelo || !idTecido) { Alert.alert('Validação', 'Categoria, Modelo e Tecido são obrigatórios.'); return; }
    if (totalImagensAtual === 0) { Alert.alert('Validação', 'O produto deve ter pelo menos uma imagem.'); return; }

    const idsParaManter = imagensExistentes
      .filter(img => !idsImagensParaRemover.includes(img.idProdutoImagem))
      .map(img => img.idProdutoImagem);

    const dadosProduto = {
      preco: parseFloat(preco), idCategoria, idModelo, idTecido, idStatus, descricao,
      tamanhosQuantidades: tamanhosQuantidades.filter(tq => tq.tamanho?.trim()),
      novasImagens,
      imagensParaManter: idsParaManter,
    };
    
    console.log("Enviando para o serviço (Atualizar):", {
        ...dadosProduto,
        novasImagens: dadosProduto.novasImagens.map(i => ({ name: i.name, type: i.type })) // Log simplificado
    });

    setSubmitting(true);
    try {
      const resp = await cadastroProdutoService.atualizarProduto(produtoId, dadosProduto);
      if (resp.status) {
        Alert.alert('Sucesso', 'Produto atualizado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        console.error("Erro da API ao atualizar produto:", resp.mensagem);
        Alert.alert('Erro ao Atualizar', resp.mensagem || 'Ocorreu um erro desconhecido.');
      }
    } catch (error) { 
        console.error("Erro de comunicação (Atualizar):", error);
        Alert.alert('Erro', 'Falha na comunicação.'); 
    }
    finally { setSubmitting(false); }
  };
  
  // ... (O restante do arquivo, incluindo a UI e os estilos, permanece o mesmo)
  // ... (função renderHeader e renderização da UI)
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="#333" /></TouchableOpacity>
      <Text style={styles.headerTitle}>Editar Produto</Text>
    </View>
  );

  if (loadingData) return <SafeAreaView style={styles.safeArea}><ActivityIndicator style={styles.centered} size="large" /></SafeAreaView>;
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.label}>Imagens (Atuais e Novas)</Text>
        <View style={styles.imagePickerContainer}>
            {/* Imagens Existentes */}
            {imagensExistentes.map(img => (
                <View key={img.idProdutoImagem} style={styles.previewImageWrapper}>
                    <Image source={{ uri: img.imgUrl.startsWith('http') ? img.imgUrl : `${API_BASE_URL.replace('/api', '')}${img.imgUrl}` }} style={styles.previewImagem} />
                    {idsImagensParaRemover.includes(img.idProdutoImagem) && <View style={styles.imageOverlayRemoved}><Ionicons name="trash" size={30} color="#FFF"/></View>}
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => toggleRemoverImagemExistente(img.idProdutoImagem)}>
                        <Ionicons name={idsImagensParaRemover.includes(img.idProdutoImagem) ? "refresh-circle" : "trash-bin"} size={28} color={idsImagensParaRemover.includes(img.idProdutoImagem) ? "#27ae60" : "#D0021B"} />
                    </TouchableOpacity>
                </View>
            ))}
            {/* Novas Imagens */}
            {novasImagens.map((img, index) => (
                <View key={index} style={styles.previewImageWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.previewImagem} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removerNovaImagem(index)}>
                        <Ionicons name="close-circle" size={28} color="#D0021B" />
                    </TouchableOpacity>
                </View>
            ))}
            {/* Botão de Adicionar */}
            {totalImagensAtual < 4 && (
                <TouchableOpacity style={styles.imagePlaceholder} onPress={() => setModalImagemVisible(true)}>
                    <Ionicons name="camera-outline" size={40} color="#999" />
                </TouchableOpacity>
            )}
        </View>

        <Text style={styles.label}>Preço *</Text>
        <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" />

        <Text style={styles.label}>Descrição</Text>
        <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} multiline />

        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.pickerContainer}><Picker selectedValue={idCategoria} onValueChange={setIdCategoria}>{categorias.map(c => <Picker.Item key={c.idCategoria} label={c.categoria} value={c.idCategoria} />)}</Picker></View>
        <Text style={styles.label}>Modelo *</Text>
        <View style={styles.pickerContainer}><Picker selectedValue={idModelo} onValueChange={setIdModelo}>{modelos.map(m => <Picker.Item key={m.idModelo} label={m.modelo} value={m.idModelo} />)}</Picker></View>
        <Text style={styles.label}>Tecido *</Text>
        <View style={styles.pickerContainer}><Picker selectedValue={idTecido} onValueChange={setIdTecido}>{tecidos.map(t => <Picker.Item key={t.idTecido} label={t.tipoTecido} value={t.idTecido} />)}</Picker></View>
        <Text style={styles.label}>Status *</Text>
        <View style={styles.pickerContainer}><Picker selectedValue={idStatus} onValueChange={setIdStatus}>{statusOptions.map(s => <Picker.Item key={s.value} label={s.label} value={s.value} />)}</Picker></View>

        <View style={styles.sizeSection}>
            <Text style={styles.label}>Tamanhos e Estoque</Text>
            {tamanhosQuantidades.map((tq, idx) => (
            <View key={idx} style={styles.sizeRow}>
                <TextInput style={[styles.input, styles.sizeInput]} placeholder="Tamanho" value={tq.tamanho} onChangeText={t => atualizarTamanho(idx, 'tamanho', t)} />
                <TextInput style={[styles.input, styles.sizeInput]} placeholder="Qtd." value={String(tq.quantidade)} onChangeText={t => atualizarTamanho(idx, 'quantidade', t)} keyboardType="numeric" />
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
// Estilos
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomColor: '#EEE', borderBottomWidth: 1 },
    backButton: { padding: 5, marginRight: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F2F2F' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 20, paddingBottom: 40 },
    imagePickerContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 24, gap: 10 },
    previewImageWrapper: { position: 'relative' },
    previewImagem: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: '#DDD' },
    imageOverlayRemoved: { position: 'absolute', width: 100, height: 100, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 14 },
    imagePlaceholder: { width: 100, height: 100, borderRadius: 12, borderWidth: 2, borderColor: '#DDD', borderStyle: 'dashed', backgroundColor: '#F7F9FC', justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F7F9FC', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
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
    modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, width: '85%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalOptionText: { fontSize: 18, color: '#4A90E2', marginLeft: 15 },
});