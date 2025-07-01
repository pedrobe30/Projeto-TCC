import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  FlatList,
} from 'react-native';
// <<< IMPORTAÇÃO CORRIGIDA >>>
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { cadastroProdutoService } from '../../services/CadastroProdutoService';

// ... (interfaces permanecem as mesmas)
interface TamanhoQuantidade {
  tamanho: string;
  quantidade: number;
}
interface Categoria {
  idCategoria: number;
  categoria: string;
}
interface Modelo {
  idModelo: number;
  modelo: string;
}
interface Tecido {
  idTecido: number;
  tipoTecido: string;
}
interface ImagemSelecionada {
  uri: string;
  name: string;
  type: string;
}


export default function TelaCadastroProduto({ navigation }: any) {
  // ... (estados do formulário permanecem os mesmos)
  const [valor, setValor] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | undefined>(undefined);
  const [idModelo, setIdModelo] = useState<number | undefined>(undefined);
  const [idTecido, setIdTecido] = useState<number | undefined>(undefined);
  const [tamanhosQuantidades, setTamanhosQuantidades] = useState<TamanhoQuantidade[]>([
    { tamanho: '', quantidade: 0 },
  ]);
  const [imagensSelecionadas, setImagensSelecionadas] = useState<ImagemSelecionada[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tecidos, setTecidos] = useState<Tecido[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalImagemVisible, setModalImagemVisible] = useState(false);


  // ... (useEffect de carregamento de dados permanece o mesmo)
  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();

    const carregarDadosIniciais = async () => {
        setLoadingData(true);
        try {
          const [respCat, respMod, respTec] = await Promise.all([
            cadastroProdutoService.buscarCategorias(),
            cadastroProdutoService.buscarModelos(),
            cadastroProdutoService.buscarTecidos(),
          ]);
          setCategorias(Array.isArray(respCat.dados) ? respCat.dados : []);
          setModelos(Array.isArray(respMod.dados) ? respMod.dados : []);
          setTecidos(Array.isArray(respTec.dados) ? respTec.dados : []);
        } catch (error) {
          Alert.alert('Erro', 'Falha ao carregar dados para o cadastro.');
        } finally {
          setLoadingData(false);
        }
      };
      carregarDadosIniciais();
  }, []);


  // <<< FUNÇÕES ATUALIZADAS PARA O IMAGEPICKER E VALIDAÇÃO >>>

  const handleImagePicker = async (pickerFunction: () => Promise<ImagePicker.ImagePickerResult>) => {
    if (imagensSelecionadas.length >= 4) {
      Alert.alert('Limite atingido', 'Você já selecionou o máximo de 4 imagens.');
      setModalImagemVisible(false);
      return;
    }

    try {
      const result = await pickerFunction();
      if (!result.canceled && result.assets) {
        const novasImagens = result.assets.map(asset => {
          const uri = asset.uri;
          const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;
          // Garante que o tipo seja um formato comum, caso mimeType não exista
          const type = asset.mimeType || 'image/jpeg';
          return { uri, name: fileName, type };
        }).filter(img => img.uri); // Garante que a imagem tenha uma URI

        const totalImagens = imagensSelecionadas.length + novasImagens.length;
        if (totalImagens > 4) {
            Alert.alert('Limite Excedido', `Você só pode adicionar mais ${4 - imagensSelecionadas.length} imagens.`);
            setImagensSelecionadas(prev => [...prev, ...novasImagens.slice(0, 4 - prev.length)]);
        } else {
            setImagensSelecionadas(prev => [...prev, ...novasImagens]);
        }
      }
    } catch (error) { 
      Alert.alert('Erro', 'Não foi possível acessar a imagem.'); 
    } finally { 
      setModalImagemVisible(false); 
    }
  };
  
  const selecionarImagem = () => handleImagePicker(() => 
    ImagePicker.launchImageLibraryAsync({ 
      // <<< SINTAXE CORRIGIDA >>>
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, 
      allowsEditing: false, 
      aspect: [1, 1],
      allowsMultipleSelection: true,
      selectionLimit: 4 - imagensSelecionadas.length,
    })
  );
  
  const tirarFoto = () => handleImagePicker(() => 
    ImagePicker.launchCameraAsync({ 
      // <<< SINTAXE CORRIGIDA >>>
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, 
      allowsEditing: true, 
      aspect: [1, 1] 
    })
  );

  const removerImagemSelecionada = (index: number) => {
    setImagensSelecionadas(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // ... (lógica de validação permanece a mesma)
    const tqValidos = tamanhosQuantidades.filter(tq => tq.tamanho?.trim() && tq.quantidade > 0);
    if (imagensSelecionadas.length === 0) {
        Alert.alert('Validação', 'Pelo menos uma imagem é obrigatória.');
        return;
    }
    if (tqValidos.length === 0) {
        Alert.alert('Validação', 'Informe ao menos um tamanho com quantidade maior que zero.');
        return;
    }

    const dadosProduto = {
      preco: parseFloat(valor),
      idCategoria: idCategoria!,
      idModelo: idModelo!,
      idTecido: idTecido!,
      descricao: '', // Você pode adicionar um campo de descrição se quiser
      imagens: imagensSelecionadas,
      tamanhosQuantidades: tqValidos,
    };

    console.log("Enviando para o serviço:", dadosProduto); // Log para depuração

    setSubmitting(true);
    try {
      const resp = await cadastroProdutoService.criarProduto(dadosProduto);
      if (resp.status) {
        Alert.alert('Sucesso', resp.mensagem || 'Produto criado com sucesso!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        // Log detalhado do erro vindo da API
        console.error("Erro da API ao criar produto:", resp.mensagem);
        Alert.alert('Erro ao Criar', resp.mensagem || 'Ocorreu um erro desconhecido.');
      }
    } catch (error) {
      console.error("Erro de comunicação:", error);
      Alert.alert('Erro', 'Falha na comunicação com o servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ... (O restante do arquivo, incluindo a UI e os estilos, permanece o mesmo)
  // Adicionar o código restante da sua TelaCadastroProduto.tsx aqui
  // ... (funções de manipulação do formulário e renderização)
  const adicionarTamanho = () => setTamanhosQuantidades(prev => [...prev, { tamanho: '', quantidade: 0 }]);
  const removerTamanho = (index: number) => {
    if (tamanhosQuantidades.length > 1) setTamanhosQuantidades(prev => prev.filter((_, i) => i !== index));
  };
  const atualizarTamanho = (index: number, field: 'tamanho' | 'quantidade', value: string) => {
    const copia = [...tamanhosQuantidades];
    if (field === 'tamanho') {
      copia[index].tamanho = value;
    } else {
      copia[index].quantidade = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    }
    setTamanhosQuantidades(copia);
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Cadastrar Novo Produto</Text>
    </View>
  );

  if (loadingData) {
    return <SafeAreaView style={styles.safeArea}><ActivityIndicator style={styles.centered} size="large" /></SafeAreaView>;
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.label}>Imagens (até 4) *</Text>
        <View style={styles.imagePickerContainer}>
            <FlatList
                data={imagensSelecionadas}
                renderItem={({ item, index }) => (
                    <View style={styles.previewImageWrapper}>
                        <Image source={{ uri: item.uri }} style={styles.previewImagem} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => removerImagemSelecionada(index)}>
                            <Ionicons name="close-circle" size={28} color="#D0021B" />
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={
                    imagensSelecionadas.length < 4 ? (
                        <TouchableOpacity 
                            style={styles.imagePlaceholder} 
                            onPress={() => setModalImagemVisible(true)}
                        >
                            <Ionicons name="camera-outline" size={40} color="#999" />
                            <Text style={styles.imagePlaceholderText}>Adicionar</Text>
                        </TouchableOpacity>
                    ) : null
                }
            />
        </View>

        <Text style={styles.label}>Preço *</Text>
        <TextInput style={styles.input} value={valor} onChangeText={setValor} placeholder="R$ 0,00" keyboardType="numeric" />
        
        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={idCategoria} onValueChange={setIdCategoria}><Picker.Item label="Selecione..." value={undefined} />{categorias.map(c => <Picker.Item key={c.idCategoria} label={c.categoria} value={c.idCategoria} />)}</Picker>
        </View>

        <Text style={styles.label}>Modelo *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={idModelo} onValueChange={setIdModelo}><Picker.Item label="Selecione..." value={undefined} />{modelos.map(m => <Picker.Item key={m.idModelo} label={m.modelo} value={m.idModelo} />)}</Picker>
        </View>

        <Text style={styles.label}>Tecido *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={idTecido} onValueChange={setIdTecido}><Picker.Item label="Selecione..." value={undefined} />{tecidos.map(t => <Picker.Item key={t.idTecido} label={t.tipoTecido} value={t.idTecido} />)}</Picker>
        </View>

        <View style={styles.sizeSection}>
          <Text style={styles.label}>Tamanhos e Estoque *</Text>
          {tamanhosQuantidades.map((tq, idx) => (
            <View key={idx} style={styles.sizeRow}>
              <TextInput style={[styles.input, styles.sizeInput]} placeholder="Tamanho (P, M)" value={tq.tamanho} onChangeText={t => atualizarTamanho(idx, 'tamanho', t)} />
              <TextInput style={[styles.input, styles.sizeInput]} placeholder="Qtd." value={tq.quantidade > 0 ? String(tq.quantidade) : ''} onChangeText={t => atualizarTamanho(idx, 'quantidade', t)} keyboardType="numeric" />
              {tamanhosQuantidades.length > 1 && <TouchableOpacity style={styles.removeButton} onPress={() => removerTamanho(idx)}><Ionicons name="trash-outline" size={22} color="#D0021B" /></TouchableOpacity>}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={adicionarTamanho}><Ionicons name="add-circle-outline" size={22} color="#FFF" /><Text style={styles.addButtonText}>Adicionar Tamanho</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.submitButton, submitting && { backgroundColor: '#BDBDBD' }]} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Salvar Produto</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalImagemVisible} transparent animationType="fade" onRequestClose={() => setModalImagemVisible(false)}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setModalImagemVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Imagem</Text>
            <TouchableOpacity style={styles.modalOption} onPress={tirarFoto}><Ionicons name="camera-outline" size={24} color="#4A90E2" /><Text style={styles.modalOptionText}>Tirar Foto</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={selecionarImagem}><Ionicons name="images-outline" size={24} color="#4A90E2" /><Text style={styles.modalOptionText}>Escolher da Galeria</Text></TouchableOpacity>
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
    imagePickerContainer: { marginBottom: 24, height: 120 },
    previewImageWrapper: { position: 'relative', marginRight: 10 },
    previewImagem: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: '#DDD' },
    removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 14 },
    imagePlaceholder: { width: 100, height: 100, borderRadius: 12, borderWidth: 2, borderColor: '#DDD', borderStyle: 'dashed', backgroundColor: '#F7F9FC', justifyContent: 'center', alignItems: 'center' },
    imagePlaceholderText: { color: '#999', marginTop: 4, fontSize: 12 },
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
    modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, width: '85%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalOptionText: { fontSize: 18, color: '#4A90E2', marginLeft: 15 },
});