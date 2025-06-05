// FilteredProductListScreen.tsx - Screen to show products filtered by category
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
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { produtoService } from '../../services/ProdutoApii';
import ProductCard from './produtocard';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Define the route params type for better TypeScript support
type RouteParams = {
  categoryId: number;
  categoryName: string;
};

const FilteredProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Get navigation and route parameters
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params as RouteParams;

  // Function to fetch products filtered by category from API
  const fetchProductsByCategory = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Use the existing service method that filters by category
      const response = await produtoService.getProdutosByCategoria(categoryId);
      
      if (response.status) {
        // Sort products from newest to oldest
        const sortedProducts = response.dados.sort((a, b) => b.idProd - a.idProd);
        setProducts(sortedProducts);
      } else {
        setError(response.mensagem || 'Erro ao carregar produtos da categoria');
      }
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId]);

  // Load products when component mounts or categoryId changes
  useEffect(() => {
    fetchProductsByCategory();
  }, [fetchProductsByCategory]);

  // Function to handle refresh of the list
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProductsByCategory();
  };

  // Function to handle product press
  const handleProductPress = (product) => {
    // Navigate to product details or perform other actions
    console.log('Produto selecionado:', product);
    // Example: navigation.navigate('ProductDetails', { product });
  };

  // Function to go back to categories screen
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Render individual product
  const renderItem = ({ item }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  // Render separator between items
  const renderSeparator = () => <View style={styles.separator} />;

  // Render empty list message
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Nenhum produto encontrado nesta categoria.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={handleGoBack}
      >
        <Text style={styles.emptyButtonText}>Voltar às Categorias</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error message
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchProductsByCategory}
      >
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.container}>
        {/* Header with back button and category name */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              style={styles.logo} 
              source={require('../../assets/Vestetec-removebg-preview.png')} 
            /> 
          </View>
          
          {/* Navigation icons */}
          <View style={styles.navigationIcons}>
            <View style={styles.perfilIcon}>
              <Ionicons name="person-circle-outline" size={32} color="#000000" />
            </View>
            <View style={styles.homeIcon}>
              <Ionicons name='home' size={32} color="#000000" />
            </View>
            <View style={styles.categIcon}>
              <MaterialIcons name="category" size={32} color="#000000" />
            </View>
            <View style={styles.carIcon}>
              <Ionicons name='cart-outline' size={32} color="#000000" />
            </View>
          </View>
        </View>

        {/* Title showing the selected category */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {categoryName || `Categoria ${categoryId}`}
          </Text>
          <Text style={styles.headerSubtitle}>
            {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {/* Products list */}
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
            keyExtractor={(item, index) => (item?.id ?? index).toString()}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    height: 30,
    width: '40%',
  },
  navigationIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perfilIcon: {
    marginHorizontal: 8,
  },
  homeIcon: {
    marginHorizontal: 8,
  },
  categIcon: {
    marginHorizontal: 8,
  },
  carIcon: {
    marginHorizontal: 8,
  },
  header: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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

export default FilteredProductListScreen;
