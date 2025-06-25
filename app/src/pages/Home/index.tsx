import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Animated,
  SafeAreaView,
  Image,
  Dimensions,
  FlatList,
  Text,
  ScrollView // Importe o ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FooterNav from '../../services/FooterNav';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av'; 
import { produtoService } from '../../services/ProdutoApii';
import { api_img } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function Home() {
  const [consulta, setConsulta] = useState('');
  const [isFoco, setIsFoco] = useState(false);
  const [produtosPopulares, setProdutosPopulares] = useState([]);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const animacao = new Animated.Value(0);
  const carouselRef = useRef(null);

  const navigation = useNavigation();

  const banners = [
    { id: 1, image: require('../../assets/Banner1.png') },
    { id: 2, image: require('../../assets/Banner2.png') },
    { id: 3, image: require('../../assets/Banner3.png')},
    { id: 4, image: require('../../assets/Banner4.png')}
  ];
  
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  useEffect(() => {
    const fetchProdutos = async () => {
      const response = await produtoService.getAllProdutos();
      if (response.status && Array.isArray(response.dados)) {
        setProdutosPopulares(response.dados.slice(0, 10)); 
      }
    };
    fetchProdutos();
  }, []);
  
  const handleFoco = () => {
    setIsFoco(true);
    Animated.timing(animacao, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setIsFoco(false);
    Animated.timing(animacao, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.3)', '#fff'],
  });

  const renderBanner = ({ item }) => (
    <View style={styles.bannerContainer}>
      <Image source={item.image} style={styles.bannerImage} />
    </View>
  );

  const renderProduto = ({ item }) => (
    <TouchableOpacity 
        style={styles.productItem} 
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.8}
    >
      <Image source={{ uri: `${api_img}${item.imgUrl}` }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{`${item.categoriaNome} ${item.modeloNome}`}</Text>
        <Text style={styles.productPrice}>R$ {item.preco?.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A0505', '#051773']}
        locations={[0.3, 0.91]} 
        start={{ x: 0.9, y: 0.1 }}
        end={{ x: 0.1, y: 0.9 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={{ flex: 1, paddingBottom: 80 }}>
        {/* Alterado de View para ScrollView para permitir rolagem */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image 
              style={styles.logo} 
              source={require('../../assets/Vestetec-removebg-preview.png')} 
            /> 
            <Animated.View style={[styles.barra, { borderColor: borderColor }]}>
              <Ionicons name="search-outline" size={20} color={isFoco ? '#fff' : '#ccc'} style={styles.IconePesquisa}/>
              <TextInput
                style={styles.input}
                placeholder="O que Procura?"
                placeholderTextColor="#ccc"
                value={consulta}
                onChangeText={setConsulta}
                onFocus={handleFoco}
                onBlur={handleBlur}
                returnKeyType="search"
              />
            </Animated.View>
          </View>

          <View style={styles.carouselSection}>
            <FlatList
              ref={carouselRef}
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            />
          </View>
          
          <View style={styles.videoContainer}>
              <Video
                source={require('../../assets/anuncio1.mp4')}
                style={styles.video}
                resizeMode={ResizeMode.COVER} 
                isLooping={true}
                isMuted={true}
                shouldPlay={isScreenFocused}
              />
          </View>
          
          <View style={styles.productSection}>
              <Text style={styles.sectionTitle}>Produtos mais encomendados</Text>
              <FlatList
                data={produtosPopulares}
                renderItem={renderProduto}
                keyExtractor={(item) => item.idProd.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
              />
          </View>

          <View style={styles.videoContainer}>
               <Video
                source={require('../../assets/anuncio2.mp4')}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                isLooping={true}
                isMuted={true}
                shouldPlay={isScreenFocused}
              />
          </View>
        </ScrollView>
      </View>

      <FooterNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Container do cabeçalho para mantê-lo fixo no topo
  header: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  logo: {
    width: 140,
    height: 40,
    alignSelf: 'center',
    resizeMode: 'contain',
    tintColor: 'white',
    marginBottom: 10,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    height: 45,
  },
  IconePesquisa: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#fff',
  },
  carouselSection: {
    // Carrossel bem maior
    height: screenWidth * 0.60, 
    marginVertical: 15, // Espaçamento
  },
  bannerContainer: {
    width: screenWidth,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'contain',
  },
  videoContainer: {
    // Vídeos bem maiores
    height: screenWidth * 0.55, 
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'black',
    marginVertical: 15, // Espaçamento
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  productSection: {
    // Seção de produtos também maior
    height: screenWidth * 0.50, 
    marginVertical: 15, // Espaçamento
  },
  sectionTitle: {
    fontSize: 20, // Título um pouco maior
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
    marginBottom: 10,
  },
  productItem: {
    width: screenWidth * 0.40, // Largura do card aumentada
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  productImage: {
    width: '100%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    resizeMode: 'contain',
  },
  productInfo: {
    padding: 10,
    height: '40%',
    justifyContent: 'center',
  },
  productName: {
    color: '#f0f0f0',
    fontSize: 13,
    fontWeight: '500',
  },
  productPrice: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
});