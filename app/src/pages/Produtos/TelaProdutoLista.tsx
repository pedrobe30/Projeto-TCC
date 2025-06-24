// TelaProdutoLista.tsx
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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { produtoService } from '../../services/ProdutoApii';
import ProductCard from './produtocard';
import { Ionicons } from '@expo/vector-icons';
import FooterNav from '../../services/FooterNav';
import { carrinhoService } from '../../services/CarrinhoService';

const ProductListScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Atualiza a contagem de itens no carrinho
  const updateCartCount = () => {
    setCartItemCount(carrinhoService.obterQuantidadeTotal());
  };

  useFocusEffect(
    useCallback(() => {
      updateCartCount();
      // Adiciona um listener para mudanças no carrinho
      carrinhoService.addListener(updateCartCount);
      return () => {
        // Remove o listener ao sair da tela
        carrinhoService.removeListener(updateCartCount);
      };
    }, [])
  );
  
  const fetchProducts = useCallback(async () => {
    setError(null);
    if (!refreshing) setLoading(true);
    try {
      const response = await produtoService.getAllProdutos();
      if (response.status) {
        const sortedProducts = response.dados.sort((a, b) => b.idProd - a.idProd);
        setProducts(sortedProducts);
      } else {
        setError(response.mensagem || 'Erro ao carregar produtos');
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const renderItem = ({ item }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="shirt-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={80} color="#e74c3c" />
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Image 
            style={styles.logo} 
            source={require('../../assets/Vestetec-removebg-preview.png')} 
          />
          <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Carrinho')}>
            <Ionicons name='cart-outline' size={30} color="#333" />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.screenTitle}>Nossos Produtos</Text>

        {/* Lista de produtos */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#A30101" />
        ) : error ? (
          renderError()
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.idProd.toString()}
            numColumns={2} // Layout em grade com 2 colunas
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

       <FooterNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  logo: { height: 35, width: 150, resizeMode: 'contain' },
  cartButton: { padding: 8 },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#A30101',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  listContainer: { paddingHorizontal: 8, paddingBottom: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 50,
  },
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#A30101',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProductListScreen;