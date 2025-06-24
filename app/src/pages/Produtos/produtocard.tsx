// ProductCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api_img } from '../../services/api';

const ProductCard = ({ product, onPress }) => {
  // Fallback para caso 'product' seja nulo ou indefinido
  if (!product) {
    return null;
  }

  const productName = `${product.categoriaNome || ''} ${product.modeloNome || ''}`.trim();

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(product)} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#EAEAEA']}
          style={styles.gradient}
        />
        <Image
          source={{ uri: `${api_img}${product.imgUrl}` }} 
          style={styles.image} 
          resizeMode="contain"
        />
        <View style={[
            styles.statusBadge, 
            { backgroundColor: product.idStatus === 1 ? '#28a745' : '#dc3545' }
          ]}>
            <Text style={styles.statusText}>{product.statusNome}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {productName}
        </Text>
        {product.tecidoNome && (
          <Text style={styles.fabric} numberOfLines={1}>
            Tecido: {product.tecidoNome}
          </Text>
        )}
        <Text style={styles.price}>R$ {product.preco?.toFixed(2) || '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    margin: 8, // Espaçamento para o modo de 2 colunas
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Mantém o container quadrado
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 10,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minHeight: 34, // Garante altura para 2 linhas
  },
  fabric: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A30101',
    marginTop: 8,
  },
});

export default ProductCard;