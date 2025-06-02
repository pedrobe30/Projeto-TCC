import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Animated,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import FooterNav from '../../services/FooterNav';

export default function Home() {
  const [consulta, setConsulta] = useState('');
  const [isFoco, setIsFoco] = useState(false);
  const animacao = new Animated.Value(0);

  const navigation = useNavigation();
  const route = useRoute();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, paddingBottom: 80 }}> {/* Adiciona espaço pro footer */}
        <ScrollView>
          <View style={styles.header}></View>

          <Image 
            style={styles.logo} 
            source={require('../../assets/Vestetec-removebg-preview.png')} 
          /> 

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