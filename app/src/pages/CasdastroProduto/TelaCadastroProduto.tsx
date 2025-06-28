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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { cadastroProdutoService } from '../../services/CadastroProdutoService';

// Interfaces
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

export default function TelaCadastroProduto({ navigation }: any) {
  // Estados do formulário e de controle
  const [valor, setValor] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | undefined>(undefined);
  const [idModelo, setIdModelo] = useState<number | undefined>(undefined);
  const [idTecido, setIdTecido] = useState<number | undefined>(undefined);
  const [tamanhosQuantidades, setTamanhosQuantidades] = useState<TamanhoQuantidade[]>([
    { tamanho: '', quantidade: 0 },
  ]);
  const [imagemSelecionada, setImagemSelecionada] = useState<{ uri: string; name: string; type: string } | null>(null);
  
  // Estados para dados e UI
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tecidos, setTecidos] = useState<Tecido[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalImagemVisible, setModalImagemVisible] = useState(false);

  // Solicitar permissões
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissões necessárias',
          'Para usar essa funcionalidade, precisamos de acesso à câmera e galeria.'
        );
      }
    })();
  }, []);

  // Carregar dados dos seletores
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoadingData(true);
      try {
        console.log('Iniciando carregamento de dados...');
        
        const [respCat, respMod, respTec] = await Promise.all([
          cadastroProdutoService.buscarCategorias(),
          cadastroProdutoService.buscarModelos(),
          cadastroProdutoService.buscarTecidos(),
        ]);

        console.log('Resposta categorias:', respCat);
        console.log('Resposta modelos:', respMod);
        console.log('Resposta tecidos:', respTec);

        setCategorias(Array.isArray(respCat.dados) ? respCat.dados : []);
        setModelos(Array.isArray(respMod.dados) ? respMod.dados : []);
        setTecidos(Array.isArray(respTec.dados) ? respTec.dados : []);
        
        if (!respCat.status || !respMod.status || !respTec.status) {
          Alert.alert('Aviso', 'Alguns dados podem não ter carregado corretamente.');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Falha ao carregar dados para o cadastro.');
      } finally {
        setLoadingData(false);
      }
    };
    carregarDadosIniciais();
  }, []);

  // Funções de manipulação do formulário
  const adicionarTamanho = () => {
    setTamanhosQuantidades(prev => [...prev, { tamanho: '', quantidade: 0 }]);
  };

  const removerTamanho = (index: number) => {
    if (tamanhosQuantidades.length > 1) {
      setTamanhosQuantidades(prev => prev.filter((_, i) => i !== index));
    }
  };

  const atualizarTamanho = (index: number, field: 'tamanho' | 'quantidade', value: string) => {
    const copia = [...tamanhosQuantidades];
    if (field === 'tamanho') {
      copia[index].tamanho = value;
    } else {
      const quantidade = parseInt(value, 10);
      copia[index].quantidade = isNaN(quantidade) ? 0 : quantidade;
    }
    setTamanhosQuantidades(copia);
  };

  const handleImagePicker = async (pickerFunction: () => Promise<ImagePicker.ImagePickerResult>) => {
    try {
      const result = await pickerFunction();
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Extrair nome e extensão do arquivo
        const uriParts = asset.uri.split('/');
        const fileName = uriParts[uriParts.length - 1];
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
        
        // Gerar nome único se necessário
        const uniqueName = `produto_${Date.now()}.${fileExtension}`;
        
        // Determinar tipo MIME correto
        let mimeType = 'image/jpeg';
        if (fileExtension === 'png') mimeType = 'image/png';
        else if (fileExtension === 'gif') mimeType = 'image/gif';
        else if (fileExtension === 'webp') mimeType = 'image/webp';
        
        setImagemSelecionada({ 
          uri: asset.uri, 
          name: uniqueName,
          type: mimeType 
        });
        
        console.log('Imagem selecionada:', { uri: asset.uri, name: uniqueName, type: mimeType });
      }
    } catch (error) { 
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível acessar a imagem.'); 
    } finally { 
      setModalImagemVisible(false); 
    }
  };

  const selecionarImagem = () => handleImagePicker(() => 
    ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, 
      allowsEditing: true, 
      aspect: [1, 1],
      allowsMultipleSelection: false
    })
  );
  
  const tirarFoto = () => handleImagePicker(() => 
    ImagePicker.launchCameraAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, 
      allowsEditing: true, 
      aspect: [1, 1] 
    })
  );

  const validarFormulario = () => {
    const erros = [];

    // Validar preço
    const precoNum = parseFloat(valor.replace(',', '.').replace(/[^\d.-]/g, ''));
    if (!valor.trim() || isNaN(precoNum) || precoNum <= 0) {
      erros.push('Informe um preço válido maior que zero.');
    }

    // Validar seleções obrigatórias
    if (!idCategoria) erros.push('Selecione uma categoria.');
    if (!idModelo) erros.push('Selecione um modelo.');
    if (!idTecido) erros.push('Selecione um tecido.');

    // Validar imagem
    if (!imagemSelecionada) erros.push('Selecione uma imagem para o produto.');

    // Validar tamanhos e quantidades
    const tqValidos = tamanhosQuantidades.filter(tq => 
      tq.tamanho?.trim() && tq.quantidade > 0
    );
    if (tqValidos.length === 0) {
      erros.push('Informe ao menos um tamanho com quantidade maior que zero.');
    }

    // Verificar tamanhos duplicados
    const tamanhosSet = new Set();
    const tamanhosDuplicados = [];
    tqValidos.forEach(tq => {
      const tamanhoLimpo = tq.tamanho.trim().toUpperCase();
      if (tamanhosSet.has(tamanhoLimpo)) {
        tamanhosDuplicados.push(tamanhoLimpo);
      } else {
        tamanhosSet.add(tamanhoLimpo);
      }
    });
    
    if (tamanhosDuplicados.length > 0) {
      erros.push(`Tamanhos duplicados encontrados: ${tamanhosDuplicados.join(', ')}`);
    }

    return { valido: erros.length === 0, erros };
  };

  const handleSubmit = async () => {
    const validacao = validarFormulario();
    
    if (!validacao.valido) {
      Alert.alert('Validação', validacao.erros.join('\n'));
      return;
    }

    // Preparar dados limpos
    const precoLimpo = parseFloat(valor.replace(',', '.').replace(/[^\d.-]/g, ''));
    const tqValidos = tamanhosQuantidades
      .filter(tq => tq.tamanho?.trim() && tq.quantidade > 0)
      .map(tq => ({
        tamanho: tq.tamanho.trim().toUpperCase(),
        quantidade: tq.quantidade
      }));

    const dadosProduto = {
      preco: precoLimpo,
      idCategoria: idCategoria!,
      idModelo: idModelo!,
      idTecido: idTecido!,
      descricao: '',
      imagem: imagemSelecionada!,
      tamanhosQuantidades: tqValidos,
    };

    console.log('Dados do produto a serem enviados:', {
      ...dadosProduto,
      imagem: { name: dadosProduto.imagem.name, type: dadosProduto.imagem.type }
    });

    setSubmitting(true);
    try {
      const resp = await cadastroProdutoService.criarProduto(dadosProduto);
      
      if (resp.status) {
        Alert.alert(
          'Sucesso', 
          resp.mensagem || 'Produto criado com sucesso!', 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erro', resp.mensagem);
      }
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', 'Falha na comunicação com o servidor.');
    } finally {
      setSubmitting(false);
    }
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
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity 
          style={styles.imagePickerContainer} 
          onPress={() => setModalImagemVisible(true)}
        >
          {imagemSelecionada ? (
            <Image source={{ uri: imagemSelecionada.uri }} style={styles.previewImagem} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#999" />
              <Text style={styles.imagePlaceholderText}>Adicionar Imagem</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Preço *</Text>
        <TextInput 
          style={styles.input} 
          value={valor} 
          onChangeText={setValor} 
          placeholder="R$ 0,00" 
          keyboardType="numeric" 
        />

        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={idCategoria} 
            onValueChange={(val) => setIdCategoria(val)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione uma categoria..." value={undefined} />
            {categorias.map((cat) => (
              <Picker.Item 
                key={cat.idCategoria} 
                label={cat.categoria} 
                value={cat.idCategoria} 
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Modelo *</Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={idModelo} 
            onValueChange={setIdModelo}
            style={styles.picker}
          >
            <Picker.Item label="Selecione um modelo..." value={undefined}/>
            {modelos.map(m => (
              <Picker.Item 
                key={m.idModelo} 
                label={m.modelo} 
                value={m.idModelo}
              />
            ))}
          </Picker>
        </View>
        
        <Text style={styles.label}>Tecido *</Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={idTecido} 
            onValueChange={setIdTecido}
            style={styles.picker}
          >
            <Picker.Item label="Selecione um tecido..." value={undefined}/>
            {tecidos.map(t => (
              <Picker.Item 
                key={t.idTecido} 
                label={t.tipoTecido} 
                value={t.idTecido}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.sizeSection}>
          <Text style={styles.label}>Tamanhos e Estoque</Text>
          {tamanhosQuantidades.map((tq, idx) => (
            <View key={idx} style={styles.sizeRow}>
              <TextInput 
                style={[styles.input, styles.sizeInput]} 
                placeholder="Tamanho (P, M, G...)" 
                value={tq.tamanho} 
                onChangeText={text => atualizarTamanho(idx, 'tamanho', text)} 
              />
              <TextInput 
                style={[styles.input, styles.sizeInput]} 
                placeholder="Qtd." 
                value={tq.quantidade > 0 ? String(tq.quantidade) : ''} 
                onChangeText={text => atualizarTamanho(idx, 'quantidade', text)} 
                keyboardType="numeric" 
              />
              {tamanhosQuantidades.length > 1 && (
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => removerTamanho(idx)}
                >
                  <Ionicons name="trash-outline" size={22} color="#D0021B" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={adicionarTamanho}>
            <Ionicons name="add-circle-outline" size={22} color="#FFF" />
            <Text style={styles.addButtonText}>Adicionar Tamanho</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && { backgroundColor: '#BDBDBD' }]} 
          onPress={handleSubmit} 
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Salvar Produto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal 
        visible={modalImagemVisible} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setModalImagemVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPressOut={() => setModalImagemVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolher Imagem</Text>
            <TouchableOpacity style={styles.modalOption} onPress={tirarFoto}>
              <Ionicons name="camera-outline" size={24} color="#4A90E2" />
              <Text style={styles.modalOptionText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={selecionarImagem}>
              <Ionicons name="image-outline" size={24} color="#4A90E2" />
              <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomColor: '#EEE', 
    borderBottomWidth: 1, 
    backgroundColor: '#FFF'
  },
  backButton: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F2F2F' },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F7F9FC' 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#666' 
  },
  container: { padding: 20, paddingBottom: 40, backgroundColor: '#FFF' },
  imagePickerContainer: { alignItems: 'center', marginBottom: 24 },
  previewImagem: { 
    width: 160, 
    height: 160, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#4A90E2' 
  },
  imagePlaceholder: { 
    width: 160, 
    height: 160, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#DDD', 
    borderStyle: 'dashed', 
    backgroundColor: '#F7F9FC', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  imagePlaceholderText: { color: '#999', marginTop: 8 },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    marginTop: 16, 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    backgroundColor: '#F7F9FC', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    fontSize: 16 
  },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    backgroundColor: '#F7F9FC', 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  picker: { 
    height: 50 
  },
  sizeSection: { marginTop: 24 },
  sizeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    gap: 10 
  },
  sizeInput: { flex: 1 },
  removeButton: { 
    padding: 10, 
    backgroundColor: '#FEE', 
    borderRadius: 12 
  },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#27ae60', 
    padding: 12, 
    borderRadius: 12, 
    marginTop: 8 
  },
  addButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginLeft: 8 
  },
  submitButton: { 
    backgroundColor: '#4A90E2', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 32 
  },
  submitButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    width: '85%', 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 10 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 15, 
    textAlign: 'center' 
  },
  modalOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0' 
  },
  modalOptionText: { 
    fontSize: 18, 
    color: '#4A90E2', 
    marginLeft: 15, 
    fontWeight: '500' 
  },
});