// ProductCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {api_img} from '../../services/api'



const ProductCard = ({ product, onPress }) => {
  console.log('Dados do produto no card:', JSON.stringify(product, null, 2));
  return (
        <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(product)}>
            <View style={styles.contImage}>

                <LinearGradient
            colors={['#FFF6F6', '#C6C5C5']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        />
        <Image
            source={{ uri: `${api_img}${product.imgUrl}`}} 
            style={styles.image} 
            resizeMode="cover"
        />
             
        </View>
      <View style={styles.infoContainer}>
   
        <View style={styles.details}>
          <View style={styles.detailRow}>
           
            <Text style={styles.value}>{product.categoriaNome }</Text> <Text> </Text>
            <Text style={styles.value}>{product.modeloNome}</Text> <Text> </Text>
             <Text style={styles.value}>{product.tecidoNome}</Text>
             
          </View>
          
          {/* <View style={styles.detailRow}>
            <Text style={styles.label}>Modelo: </Text>
            <Text style={styles.value}>{product.modeloNome}</Text>
          </View> */}
          
          {/* {product.tecidoNome && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Tecido: </Text>
              <Text style={styles.value}>{product.tecidoNome}</Text>
            </View>
          )} */}
          
          {/* <View style={styles.detailRow}>
            <Text style={styles.label}>Estoque: </Text>
            <Text style={styles.value}>{product.quantEstoque}</Text>
          </View> */}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.price}>R$ {product.preco.toFixed(2)}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: product.idStatus === 1 ? '#28a745' : '#dc3545' }
          ]}>
            <Text style={styles.statusText}>{product.statusNome}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#CDCDCD',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 50,
    height: 270,
    width: 250,
    
  },
  contImage:
  {
    width: '82%',
    height: 200,
    position: 'relative',
    zIndex:3,
     justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  image: {
    width: '70%',
    height: '80%',
     marginLeft: 30,
     marginTop: 15,
    marginBottom: 15,

  },
  gradient:
  {
    position: 'absolute',
    top: 10,
    left: 30,
    right: 0,
    bottom: 10,
  
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop:0
  },
  details: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A30101',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});

export default ProductCard;