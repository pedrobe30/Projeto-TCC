import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { api_img } from '../../services/api';
// Importar o serviço de carrinho
import { carrinhoService } from '../../services/CarrinhoService'; // Ajuste o caminho conforme necessário

// Definir tipos para melhor TypeScript
interface Product {
  idProd: number;
  preco: number;
  quantEstoque: number;
  idCategoria: number;
  idModelo: number;
  idTecido?: number;
  idStatus: number;
  imgUrl: string;
  categoriaNome: string;
  modeloNome: string;
  tecidoNome?: string;
  statusNome: string;
}

interface RouteParams {
  product: Product;
}

type ProductDetailRouteProp = RouteProp<{ ProductDetail: RouteParams }, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  
  // Verificação segura do produto com tipagem
  const product = route.params?.product;
  
  // Estados para controle da interface
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Tamanhos disponíveis (você pode adaptar conforme sua necessidade)
  const availableSizes = ['P', 'M', 'G', 'GG'];
  
  // Funções para controle de quantidade
  const increaseQuantity = () => {
    if (product && quantity < product.quantEstoque) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert('Aviso', 'Quantidade máxima disponível em estoque');
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Função para adicionar ao carrinho - CORRIGIDA
  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!selectedSize) {
      Alert.alert('Atenção', 'Por favor, selecione um tamanho');
      return;
    }
    
    if (quantity > product.quantEstoque) {
      Alert.alert('Erro', 'Quantidade indisponível no estoque');
      return;
    }
    
    try {
      setIsAddingToCart(true);
      
      // Preparar produto para o carrinho
      const produtoParaCarrinho = {
        idProd: product.idProd,
        categoriaNome: product.categoriaNome,
        modeloNome: product.modeloNome,
        tecidoNome: product.tecidoNome,
        preco: product.preco,
        imgUrl: product.imgUrl,
      };
      
      // Adicionar ao carrinho usando o serviço com tamanho
      carrinhoService.adicionarItem(produtoParaCarrinho, quantity, selectedSize);
      
      // Mostrar sucesso
      Alert.alert(
        'Sucesso!',
        `Produto adicionado ao carrinho!\nTamanho: ${selectedSize}\nQuantidade: ${quantity}`,
        [
          {
            text: 'Continuar Comprando',
            style: 'cancel'
          },
          {
            text: 'Ver Carrinho',
            onPress: () => {
              // Navegar para o carrinho - ajuste o nome da rota conforme necessário
              navigation.navigate('Carrinho' as never);
            }
          }
        ]
      );
      
      // Resetar seleções após adicionar
      setSelectedSize('');
      setQuantity(1);
      
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o produto ao carrinho. Tente novamente.');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Função para voltar
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Função para ir ao carrinho
  const goToCart = () => {
    navigation.navigate('Carrinho' as never);
  };
  
  // Se não há produto, exibir mensagem de erro
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produto não encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3E3E3" />
      
      {/* Gradiente de fundo */}
      <LinearGradient
        colors={['#E3E3E3', '#646161']}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
      
      {/* Header com botão de voltar e carrinho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backIconButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={goToCart} style={styles.headerIcon}>
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart-outline" size={24} color="#333" />
              {carrinhoService.obterQuantidadeTotal() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {carrinhoService.obterQuantidadeTotal()}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${api_img}${product.imgUrl}` }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Informações do produto */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productCategory}>
              <Text style={styles.categoryText}>{product.categoriaNome}</Text>
              <Text style={styles.modelText}>{product.modeloNome}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: product.idStatus === 1 ? '#28a745' : '#dc3545' }
            ]}>
              <Text style={styles.statusText}>{product.statusNome}</Text>
            </View>
          </View>
          
          {product.tecidoNome && (
            <Text style={styles.fabricText}>Material: {product.tecidoNome}</Text>
          )}
          
          <Text style={styles.priceText}>R$ {product.preco.toFixed(2)}</Text>
          
          <Text style={styles.stockText}>
            Estoque disponível: {product.quantEstoque} unidades
          </Text>
          
          {/* Seletor de tamanhos */}
          <View style={styles.sizeSection}>
            <Text style={styles.sectionTitle}>Tamanho:</Text>
            <View style={styles.sizeOptions}>
              {availableSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonSelected
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSize === size && styles.sizeButtonTextSelected
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Controle de quantidade */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantidade:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={20} 
                  color={quantity <= 1 ? '#ccc' : '#333'} 
                />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= product.quantEstoque && styles.quantityButtonDisabled
                ]}
                onPress={increaseQuantity}
                disabled={quantity >= product.quantEstoque}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={quantity >= product.quantEstoque ? '#ccc' : '#333'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Botão fixo para adicionar ao carrinho */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            ((!selectedSize || product.quantEstoque === 0) || isAddingToCart) && styles.addToCartButtonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={!selectedSize || product.quantEstoque === 0 || isAddingToCart}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.addToCartButtonText}>
            {isAddingToCart 
              ? 'Adicionando...' 
              : product.quantEstoque === 0 
                ? 'Indisponível' 
                : 'Adicionar ao Carrinho'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E3E3E3',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(227, 227, 227, 0.9)',
  },
  backIconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#A30101',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  productImage: {
    width: '80%',
    height: '100%',
    borderRadius: 12,
  },
  productInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '50%',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productCategory: {
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  modelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  fabricText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A30101',
    marginBottom: 8,
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  sizeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 12,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  sizeButtonSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  sizeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sizeButtonTextSelected: {
    color: '#fff',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f8f8f8',
    borderColor: '#eee',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    backgroundColor: '#A30101',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#A30101',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;