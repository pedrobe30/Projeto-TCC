// ProdutosFiltrados.tsx
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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { produtoService } from '../../services/ProdutoApii';
import ProductCard from './produtocard';
import { Ionicons } from '@expo/vector-icons';

type RouteParams = {
  categoryId: number;
  categoryName: string;
};

const FilteredProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params as RouteParams;

  const fetchProductsByCategory = useCallback(async () => {
    setError(null);
    if (!refreshing) setLoading(true);
    try {
      const response = await produtoService.getProdutosByCategoria(categoryId);
      if (response.status) {
        const sortedProducts = response.dados.sort((a, b) => b.idProd - a.idProd);
        setProducts(sortedProducts);
      } else {
        setError(response.mensagem || 'Erro ao carregar produtos');
      }
    } catch (err) {
      console.error('Erro ao buscar produtos por categoria:', err);
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, refreshing]);

  useEffect(() => {
    fetchProductsByCategory();
  }, [fetchProductsByCategory]);

  const handleRefresh = () => setRefreshing(true);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleGoBack = () => navigation.goBack();

  const renderItem = ({ item }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="sad-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>Nenhum produto encontrado nesta categoria.</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleGoBack}>
        <Text style={styles.emptyButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={80} color="#e74c3c" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchProductsByCategory}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header com botão de voltar e nome da categoria */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
            <Text style={styles.headerSubtitle}>
                {products.length} produto{products.length !== 1 ? 's' : ''}
            </Text>
        </View>
        <View style={{ width: 40 }} /> {/* Espaçador para centralizar o título */}
      </View>
      
      <View style={styles.container}>
        {loading && !refreshing ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#A30101" />
        ) : error ? (
            renderError()
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => (item?.idProd ?? Math.random()).toString()}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  listContainer: { paddingHorizontal: 8, paddingVertical: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  emptyButton: {
    backgroundColor: '#A30101',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
    marginTop: 16
  },
  retryButton: {
    backgroundColor: '#A30101',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default FilteredProductListScreen;