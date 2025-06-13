import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Animated,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import FooterNav from '../../services/FooterNav';

const { width: screenWidth } = Dimensions.get('window');

export default function Home() {
  const [consulta, setConsulta] = useState('');
  const [isFoco, setIsFoco] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animacao = new Animated.Value(0);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  const navigation = useNavigation();
  const route = useRoute();

  // Dados do carrossel
  const banners = [
    { id: 1, image: require('../../assets/Banner1.png') },
    { id: 2, image: require('../../assets/Banner2.png') }
  ];

  // Auto-scroll do carrossel
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % banners.length;
        carouselRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true 
        });
        return nextIndex;
      });
    }, 4000); // Muda a cada 4 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const onPesquisa = (texto) => {
    console.log("Pesquisando por:", texto);
  };

  const handleFoco = () => {
    setIsFoco(true);
    Animated.timing(animacao, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false
    }).start();
  };

  const handleBlur = () => {
    setIsFoco(false);
    Animated.timing(animacao, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBusca = () => {
    if (consulta.trim()) {
      onPesquisa(consulta);
      Keyboard.dismiss();
    }
  };

  const clearSearch = () => {
    setConsulta('');
    onPesquisa('');
  };

  const borderColor = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#3498db'],
  });

  const shadowOpacity = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const renderBanner = ({ item }) => (
    <View style={styles.bannerContainer}>
      <Image source={item.image} style={styles.bannerImage} />
    </View>
  );

  const onScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(index);
  };

  const goToSlide = (index) => {
    carouselRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, paddingBottom: 80 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}></View>

          {/* Logo */}
          <Image 
            style={styles.logo} 
            source={require('../../assets/Vestetec-removebg-preview.png')} 
          /> 

          {/* Barra de Pesquisa */}
          <Animated.View 
            style={[
              styles.barra, 
              {
                borderColor: borderColor,
                shadowOpacity: shadowOpacity,
              }
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={isFoco ? '#3498db' : '#888'}
              style={styles.IconePesquisa}
            />
            <TextInput
              style={styles.input}
              placeholder="O que Procura?"
              value={consulta}
              onChangeText={setConsulta}
              onFocus={handleFoco}
              onBlur={handleBlur}
              onSubmitEditing={handleBusca}
              returnKeyType="search"
            />
            {consulta.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.LimparBarra}>
                <Ionicons name="close-circle" size={18} color="#888" />
              </TouchableOpacity>
            )}
            {isFoco && (
              <TouchableOpacity onPress={handleBusca} style={styles.PesquisaButton}>
                <View style={styles.searchButtonContainer}>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Carrossel de Banners */}
          <View style={styles.carouselSection}>
            <FlatList
              ref={carouselRef}
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onScrollBeginDrag={() => {
                // Para o auto-scroll quando o usuário interage
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
              }}
              onScrollEndDrag={() => {
                // Reinicia o auto-scroll após a interação
                intervalRef.current = setInterval(() => {
                  setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % banners.length;
                    carouselRef.current?.scrollToIndex({ 
                      index: nextIndex, 
                      animated: true 
                    });
                    return nextIndex;
                  });
                }, 4000);
              }}
            />
            
            {/* Indicadores de página */}
            <View style={styles.pageIndicators}>
              {banners.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: currentIndex === index ? '#3498db' : '#d0d0d0',
                      transform: [{ scale: currentIndex === index ? 1.2 : 1 }]
                    }
                  ]}
                  onPress={() => goToSlide(index)}
                />
              ))}
            </View>
          </View>

          {/* Espaço adicional para mais conteúdo futuro */}
          <View style={styles.contentSection}>
            {/* Aqui você pode adicionar mais seções como categorias, produtos em destaque, etc. */}
          </View>
        </ScrollView>
      </View>

      {/* Footer fixo */}
      <FooterNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 10,
  },
  logo: {
    width: 150,
    height: 50,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginVertical: 10,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  IconePesquisa: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  LimparBarra: {
    paddingHorizontal: 5,
  },
  PesquisaButton: {
    marginLeft: 10,
  },
  searchButtonContainer: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilos do Carrossel
  carouselSection: {
    marginVertical: 20,
  },
  bannerContainer: {
    width: screenWidth,
    paddingHorizontal: 15,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  contentSection: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#808080',
    paddingVertical: 10,
    borderRadius: 30,
    width: '80%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 50,
    width: 45,
    height: 45,    
  },
});