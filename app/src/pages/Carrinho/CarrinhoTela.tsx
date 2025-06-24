import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api_img } from '../../services/api';
import { carrinhoService } from '../../services/CarrinhoService';
import { encomendaService } from '../../services/EncomendasService'; // Importe o serviço de encomenda

// --- INTERFACES ---
interface ProdutoCarrinho {
  idProd: number;
  categoriaNome: string;
  modeloNome: string;
  tecidoNome?: string;
  preco: number;
  imgUrl: string;
  quantidade: number;
  tamanho?: string;
}

// --- SUBCOMPONENTES (MOVIMOS PARA FORA) ---

// Componente para um item individual no carrinho
const ItemCarrinho: React.FC<{ 
    item: ProdutoCarrinho;
    onUpdate: (id: number, novaQuantidade: number, tamanho?: string) => void;
    onRemove: (item: ProdutoCarrinho) => void;
}> = ({ item, onUpdate, onRemove }) => {
  const valorTotal = item.preco * item.quantidade;

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemImageContainer}>
        <Image
          source={{ uri: `${api_img}${item.imgUrl}` }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>
          {item.categoriaNome} {item.modeloNome}
        </Text>
        {item.tecidoNome && <Text style={styles.itemTecido}>{item.tecidoNome}</Text>}
        {item.tamanho && <Text style={styles.itemTamanho}>Tamanho: {item.tamanho}</Text>}
        <Text style={styles.itemPrecoUnitario}>
          R$ {item.preco.toFixed(2)} / unidade
        </Text>
        <View style={styles.quantidadeContainer}>
          <TouchableOpacity
            style={styles.quantidadeBotao}
            onPress={() => onUpdate(item.idProd, item.quantidade - 1, item.tamanho)}
          >
            <Ionicons name="remove" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.quantidadeTexto}>{item.quantidade}</Text>
          <TouchableOpacity
            style={styles.quantidadeBotao}
            onPress={() => onUpdate(item.idProd, item.quantidade + 1, item.tamanho)}
          >
            <Ionicons name="add" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTotal}>
          Total: R$ {valorTotal.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity style={styles.removerBotao} onPress={() => onRemove(item)}>
        <Ionicons name="trash-outline" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );
};

// Componente para quando o carrinho está vazio
const CarrinhoVazio: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
  <View style={styles.carrinhoVazioContainer}>
    <View style={styles.carrinhoVazioIcone}>
      <Ionicons name="cart-outline" size={100} color="#ccc" />
    </View>
    <Text style={styles.carrinhoVazioTitulo}>SEU CARRINHO ESTÁ VAZIO</Text>
    <Text style={styles.carrinhoVazioSubtitulo}>
      Quando adicionares algo, aparecerá aqui. Pronto para começar?
    </Text>
    <TouchableOpacity style={styles.comecarBotao} onPress={onNavigate}>
      <Text style={styles.comecarBotaoTexto}>COMEÇAR</Text>
    </TouchableOpacity>
    <View style={styles.logoContainer}>
      <Image 
        style={styles.logoVazio} 
        source={require('../../assets/Vestetec-removebg-preview.png')} 
      />
    </View>
  </View>
);

// Componente para o resumo do pedido
const ResumoCarrinho: React.FC<{ onFinalize: () => void }> = ({ onFinalize }) => {
  const total = carrinhoService.calcularTotal();
  const quantidadeItens = carrinhoService.obterQuantidadeTotal();

  return (
    <View style={styles.resumoContainer}>
      <View style={styles.resumoLinha}>
        <Text style={styles.resumoTexto}>Itens ({quantidadeItens})</Text>
        <Text style={styles.resumoValor}>R$ {total.toFixed(2)}</Text>
      </View>
      <View style={styles.divisor} />
      <View style={styles.resumoLinha}>
        <Text style={styles.resumoTotalTexto}>Total</Text>
        <Text style={styles.resumoTotalValor}>R$ {total.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.finalizarBotao} onPress={onFinalize}>
        <Text style={styles.finalizarBotaoTexto}>FINALIZAR ENCOMENDA</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- COMPONENTE PRINCIPAL ---
const CarrinhoScreen: React.FC = () => {
  const [itensCarrinho, setItensCarrinho] = useState<ProdutoCarrinho[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Iniciar como true para o carregamento inicial
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigation = useNavigation();

  const carregarCarrinho = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const itens = carrinhoService.obterItens();
      setItensCarrinho(itens);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      Alert.alert('Erro', 'Não foi possível carregar os itens do carrinho.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    const handleCarrinhoChange = () => {
      // Pequeno ajuste para refletir a mudança sem recarregar tudo
      setItensCarrinho(carrinhoService.obterItens());
    };
    carrinhoService.addListener(handleCarrinhoChange);
    return () => {
      carrinhoService.removeListener(handleCarrinhoChange);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarCarrinho();
    }, [carregarCarrinho])
  );

  const atualizarQuantidade = (produtoId: number, novaQuantidade: number, tamanho?: string) => {
    try {
      carrinhoService.atualizarQuantidade(produtoId, novaQuantidade, tamanho);
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a quantidade');
    }
  };

  const removerItem = (produto: ProdutoCarrinho) => {
    const nomeProduto = `${produto.categoriaNome} ${produto.modeloNome}`;
    const tamanhoTexto = produto.tamanho ? ` (${produto.tamanho})` : '';
    Alert.alert(
      'Remover Produto',
      `Deseja remover "${nomeProduto}${tamanhoTexto}" do carrinho?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            try {
              carrinhoService.removerItem(produto.idProd, produto.tamanho);
            } catch (error) {
              console.error('Erro ao remover item:', error);
              Alert.alert('Erro', 'Não foi possível remover o item');
            }
          },
        },
      ]
    );
  };

  const finalizarEncomenda = () => {
    // PONTO DE VERIFICAÇÃO 1: A função foi chamada?
    console.log('[PONTO 1] A função finalizarEncomenda() foi acionada.');

    const total = carrinhoService.calcularTotal();
    const quantidadeItens = carrinhoService.obterQuantidadeTotal();
    
    Alert.alert(
      'Finalizar Encomenda',
      `Total: R$ ${total.toFixed(2)}\nItens: ${quantidadeItens}\n\nDeseja prosseguir com a compra?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            // PONTO DE VERIFICAÇÃO 2: O botão "Confirmar" do alerta foi pressionado.
            console.log('[PONTO 2] Botão "Confirmar" pressionado.');
            setLoading(true);

            try {
              // PONTO DE VERIFICAÇÃO 3: Preparando para enviar os dados.
              console.log('[PONTO 3] Entrou no bloco TRY. Preparando os dados...');
              
              const itensParaEnviar = carrinhoService.obterItens();

              // PONTO DE VERIFICAÇÃO 4: VERIFIQUE ESTE PAYLOAD!
              // Este é o dado exato que será enviado para sua API.
              console.log('[PONTO 4] DADOS A SEREM ENVIADOS PARA API:', JSON.stringify(itensParaEnviar, null, 2));

              if (!itensParaEnviar || itensParaEnviar.length === 0) {
                Alert.alert("Erro", "Seu carrinho está vazio. Não é possível criar a encomenda.");
                setLoading(false);
                return;
              }

              // PONTO DE VERIFICAÇÃO 5: Chamando a API.
              console.log('[PONTO 5] Chamando encomendaService.criarEncomenda...');
              
              await encomendaService.criarEncomenda(itensParaEnviar);
              
              // PONTO DE VERIFICAÇÃO 6: SUCESSO! A API respondeu sem erro.
              console.log('[PONTO 6] SUCESSO! A API retornou sem erro. Limpando o carrinho e navegando...');

              Alert.alert('Sucesso', 'Encomenda realizada com sucesso!', [
                {
                  text: 'OK',
                  onPress: () => {
                    carrinhoService.limparCarrinho();
                    navigation.navigate('Encomenda' as never);
                  }
                }
              ]);

            } catch (error) {
              // PONTO DE VERIFICAÇÃO 7: ERRO! A API retornou um erro.
              console.log('[PONTO 7] ERRO CAPTURADO NO BLOCO CATCH!');
              console.error('OBJETO DE ERRO COMPLETO:', error);
              
              const errorMessage = error instanceof Error 
                ? error.message 
                : 'Não foi possível realizar a encomenda. Verifique o console para mais detalhes.';
              
              Alert.alert('Erro ao Finalizar', errorMessage);

            } finally {
              // PONTO DE VERIFICAÇÃO 8: Finalizando o processo.
              console.log('[PONTO 8] Entrou no bloco FINALLY.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    carregarCarrinho();
  };
  
  const irParaProdutos = () => navigation.navigate('Home' as never);
  const voltarTela = () => navigation.goBack();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A30101" />
          <Text style={styles.loadingText}>Carregando carrinho...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ESTA É A PARTE PRINCIPAL QUE DEVE SER RETORNADA
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={voltarTela} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image 
            style={styles.logo} 
            source={require('../../assets/Vestetec-removebg-preview.png')} 
          /> 
        </View>
        <View style={styles.navigationIcons}>
          <Text style={styles.carrinhoTitulo}>Carrinho</Text>
        </View>
      </View>

      {itensCarrinho.length === 0 ? (
        <CarrinhoVazio onNavigate={irParaProdutos} />
      ) : (
        <View style={styles.container}>
          <FlatList
            data={itensCarrinho}
            renderItem={({ item }) => (
              <ItemCarrinho 
                item={item} 
                onUpdate={atualizarQuantidade}
                onRemove={removerItem}
              />
            )}
            keyExtractor={(item, index) => `${item.idProd}-${item.tamanho || 'no-size'}-${index}`}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
          <ResumoCarrinho onFinalize={finalizarEncomenda} />
        </View>
      )}
    </SafeAreaView>
  );
};

// Os estilos permanecem os mesmos
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  container: 
  { flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  headerContainer: { flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#fff', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  backButton: { padding: 8, marginRight: 8 },
  logoContainer: { flex: 1 },
  logo: { height: 30, width: '40%' },
  navigationIcons: { alignItems: 'center' },
  carrinhoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  carrinhoVazioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  carrinhoVazioIcone: { marginBottom: 30 },
  carrinhoVazioTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  carrinhoVazioSubtitulo: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  comecarBotao: { backgroundColor: '#A30101', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8, marginBottom: 50 },
  comecarBotaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoVazio: { height: 80, width: 230, opacity: 0.5 },
  listContainer: { padding: 16 },
  itemContainer: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 16, borderRadius: 8, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  itemImageContainer: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0', marginRight: 16 },
  itemImage: { width: '100%', height: '100%', borderRadius: 8 },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemNome: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  itemTecido: { fontSize: 14, color: '#666', marginBottom: 4 },
  itemTamanho: { fontSize: 14, color: '#A30101', fontWeight: '600', marginBottom: 4 },
  itemPrecoUnitario: { fontSize: 14, color: '#666', marginBottom: 8 },
  quantidadeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  quantidadeBotao: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  quantidadeTexto: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 16, minWidth: 30, textAlign: 'center' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#A30101' },
  removerBotao: { padding: 8, alignSelf: 'flex-start' },
  resumoContainer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resumoTexto: { fontSize: 16, color: '#666' },
  resumoValor: { fontSize: 16, color: '#333' },
  divisor: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  resumoTotalTexto: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  resumoTotalValor: { fontSize: 18, fontWeight: 'bold', color: '#A30101' },
  finalizarBotao: { backgroundColor: '#A30101', paddingVertical: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  finalizarBotaoTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default CarrinhoScreen;