import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { api_img } from '../../services/api';
import { carrinhoService } from '../../services/CarrinhoService';

// Interfaces (com a propriedade 'imagens' adicionada ao Product)
interface TamanhoQuantidade {
  tamanho: string;
  quantidade: number;
}

interface ImagemProduto {
    idProdutoImagem: number;
    imgUrl: string;
}

interface Product {
  idProd: number;
  preco: number;
  quantEstoque: number;
  tamanhosQuantidades?: TamanhoQuantidade[];
  idCategoria: number;
  idModelo: number;
  idTecido?: number;
  idStatus: number;
  imgUrl: string; // Imagem principal para compatibilidade
  imagens?: ImagemProduto[]; // <<-- Array de todas as imagens
  categoriaNome: string;
  modeloNome: string;
  tecidoNome?: string;
  statusNome: string;
  descricao?: string;
}

interface RouteParams {
  product: Product;
}

type ProductDetailRouteProp = RouteProp<{ ProductDetail: RouteParams }, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const product = route.params?.product;

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // <<< NOVO ESTADO PARA GALERIA >>>
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Lógica de controle (sem alterações)
  const getAvailableSizes = () => {
    if (!product || !product.tamanhosQuantidades) return [];
    return product.tamanhosQuantidades.filter(item => item.quantidade > 0).map(item => item.tamanho).sort();
  };

  const getMaxQuantityForSize = (tamanho: string) => {
    if (!product || !tamanho || !product.tamanhosQuantidades) return 0;
    const itemEstoque = product.tamanhosQuantidades.find(item => item.tamanho?.toUpperCase() === tamanho.toUpperCase());
    return itemEstoque?.quantidade ?? 0;
  };

  const increaseQuantity = () => {
    if (!selectedSize) { Alert.alert('Atenção', 'Selecione um tamanho.'); return; }
    const maxQuantity = getMaxQuantityForSize(selectedSize);
    if (quantity < maxQuantity) setQuantity(q => q + 1);
  };
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };
  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSize) { Alert.alert('Atenção', 'Selecione um tamanho.'); return; }
    // ... restante da lógica de adicionar ao carrinho permanece a mesma
    try {
        setIsAddingToCart(true);
        carrinhoService.adicionarItem({
            idProd: product.idProd,
            categoriaNome: product.categoriaNome,
            modeloNome: product.modeloNome,
            tecidoNome: product.tecidoNome,
            preco: product.preco,
            imgUrl: product.imagens?.[0]?.imgUrl || product.imgUrl, // Usa a primeira imagem da lista
            descricao: product.descricao
        }, quantity, selectedSize);
        Alert.alert('Sucesso!', 'Produto adicionado ao carrinho!');
        setSelectedSize('');
        setQuantity(1);
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível adicionar o produto.');
    } finally {
        setIsAddingToCart(false);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}><Text>Produto não encontrado.</Text></View>
      </SafeAreaView>
    );
  }

  const availableSizes = getAvailableSizes();
  const maxQuantityForSelectedSize = selectedSize ? getMaxQuantityForSize(selectedSize) : 0;
  const imageList = product.imagens && product.imagens.length > 0 ? product.imagens : [{ idProdutoImagem: 0, imgUrl: product.imgUrl }];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#E3E3E3', '#646161']} style={styles.gradient} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconButton}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Carrinho' as never)} style={styles.headerIcon}><Ionicons name="cart-outline" size={24} color="#333" /></TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <<< GALERIA DE IMAGENS >>> */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={flatListRef}
            data={imageList}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.imgUrl.startsWith('http') ? item.imgUrl : `${api_img}${item.imgUrl}` }}
                style={styles.productImage}
                resizeMode="contain"
              />
            )}
            keyExtractor={(item) => item.idProdutoImagem.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />
          {imageList.length > 1 && (
            <View style={styles.pagination}>
              <Text style={styles.paginationText}>{activeIndex + 1} / {imageList.length}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          {/* O resto do conteúdo (informações, tamanhos, etc.) permanece o mesmo */}
          <View style={styles.productHeader}>
            <Text style={styles.modelText}>{product.modeloNome}</Text>
            <Text style={styles.statusText}>{product.statusNome}</Text>
          </View>
          <Text style={styles.priceText}>R$ {product.preco.toFixed(2)}</Text>
          
          <Text style={styles.sectionTitle}>Tamanho:</Text>
          <View style={styles.sizeOptions}>
            {availableSizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeButton, selectedSize === size && styles.sizeButtonSelected]}
                onPress={() => handleSizeSelection(size)}
              >
                <Text style={[styles.sizeButtonText, selectedSize === size && styles.sizeButtonTextSelected]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedSize && (
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantidade (máx: {maxQuantityForSelectedSize}):</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={decreaseQuantity} disabled={quantity <= 1}><Ionicons name="remove-circle-outline" size={30} color={quantity <= 1 ? '#ccc' : '#333'} /></TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={increaseQuantity} disabled={quantity >= maxQuantityForSelectedSize}><Ionicons name="add-circle-outline" size={30} color={quantity >= maxQuantityForSelectedSize ? '#ccc' : '#333'} /></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.addToCartButton, (!selectedSize || isAddingToCart) && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={!selectedSize || isAddingToCart}
        >
          <Text style={styles.addToCartButtonText}>{isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Estilos adaptados para a galeria
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#E3E3E3' },
    gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, paddingTop: StatusBar.currentHeight },
    backIconButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)' },
    headerIcon: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)' },
    imageContainer: { height: 350, position: 'relative' },
    productImage: { width: width, height: 350 },
    pagination: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
    paginationText: { color: '#fff', fontSize: 12 },
    productInfo: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, flex: 1 },
    productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modelText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    statusText: { backgroundColor: '#28a745', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12 },
    priceText: { fontSize: 28, fontWeight: 'bold', color: '#A30101', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
    sizeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    sizeButton: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
    sizeButtonSelected: { backgroundColor: '#333', borderColor: '#333' },
    sizeButtonText: { fontSize: 16, color: '#333' },
    sizeButtonTextSelected: { color: '#fff' },
    quantitySection: { marginTop: 24 },
    quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    quantityText: { fontSize: 20, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
    bottomContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: 'rgba(255, 255, 255, 0.95)' },
    addToCartButton: { backgroundColor: '#A30101', padding: 16, borderRadius: 12, alignItems: 'center' },
    addToCartButtonDisabled: { backgroundColor: '#ccc' },
    addToCartButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ProductDetailScreen;