// ProductListScreen.js - Versão refatorada e melhorada
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
  Modal,
  Image
} from 'react-native';
import { produtoService } from '../../services/ProdutoApii';
import ProductCard from './produtocard';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


const ProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar produtos da API
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await produtoService.getAllProdutos();

      console.log('Resposta completa da API:', JSON.stringify(response, null, 2));
      
      if (response.status) {
        console.log('Primeiro produto:', JSON.stringify(response.dados[0], null, 2));
      console.log('Chaves disponíveis:', Object.keys(response.dados[0]));
        // Ordenar produtos do mais recente para o mais antigo
        const sortedProducts = response.dados.sort((a, b) => b.idProd - a.idProd);
        setProducts(sortedProducts);
      } else {
        setError(response.mensagem || 'Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carregar produtos ao iniciar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Função para lidar com o refresh da lista
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Função para lidar com a adição de um novo produto
  const handleProductAdded = (newProduct) => {
    // Adicionar o novo produto no início da lista (mais recente)
    setProducts([newProduct, ...products]);
    setShowAddForm(false);
  };

  // Função para lidar com o clique em um produto
  const handleProductPress = (product) => {
    // Aqui você pode navegar para a tela de detalhes ou realizar outras ações
    console.log('Produto selecionado:', product);
  };

  // Renderizar produto individual
  const renderItem = ({ item }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  // Renderizar separador entre itens
  const renderSeparator = () => <View style={styles.separator} />;

  // Renderizar mensagem de lista vazia
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Nenhum produto encontrado.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => setShowAddForm(true)}
      >
        <Text style={styles.emptyButtonText}>Adicionar Produto</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar mensagem de erro
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchProducts}
      >
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.container}>
        {/* Cabeçalho */}
                <View>
                  <Image 
                    style={styles.logo} 
                    source={require('../../assets/Vestetec-removebg-preview.png')} 
                  /> 
                </View>
                <View style={styles.perfilIcon}>
                    <Ionicons name="person-circle-outline" size={40} color="#000000" />
                </View>

                <View style={styles.homeIcon}>
                  <Ionicons name='home'size={40} color="000000" />
                </View>

                   <View style={styles.categIcon}>
                  <MaterialIcons name="category" size={40} />
                </View>

                <View style={styles.carIcon}>
                  <Ionicons name='cart-outline' size={40} color="000000" />
                </View>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nossos Produtos</Text> 
        </View>
        
        {/* Lista de produtos */}
        {error ? (
          renderError()
        ) : loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.idProd.toString()}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={renderEmptyList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
    
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  logo:
  {
    height: 30,
    width: '40%'
  },
  perfilIcon:
  {

    position: 'relative',
    left: '48%',
    bottom: '4%',
    color: '#000000'
  },
  homeIcon:
  {
    position: 'relative',
    left: '60%',
    bottom: '9.60%',
    color: '#000000'
  },
  categIcon:
  {
    position: 'relative',
    left: '72%',
    bottom: '14.80%',
    color: '#000000'
  },
  carIcon:
  {
    position: 'relative',
    left: '84%',
    bottom: '19.70%',
    color: '#000000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
 
    position: 'relative',
    bottom: 87
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    position: 'relative',
    bottom: 0,
   
  },

 
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
    
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
 
});

export default ProductListScreen;