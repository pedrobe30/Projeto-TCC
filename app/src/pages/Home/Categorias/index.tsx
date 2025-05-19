import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Categorias()
{
  const categories = [
  { id: '1', title: 'CAMISETAS' },
  { id: '2', title: 'BLUSAS' },
  { id: '3', title: 'SHORTS' },
  { id: '4', title: 'CALÇAS'}
];

  return(
  
      <LinearGradient
      colors={['#EEEEEE', '#310505']}
      locations={[0.15, 0.82]} // 22% e 100%
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
    <SafeAreaView>

    <Image source={require("../../../assets/Vestetec-removebg-preview.png")} style={styles.logo}></Image>

      <LinearGradient
      colors={['#740000', '#2F0202']}
      locations={[0.15, 0.91]} // 22% e 100%
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      >

     <View style={styles.categoria}>

        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            activeOpacity={0.8}
          >
            <Text style={styles.cardText}>{cat.title}</Text>
          </TouchableOpacity>
        ))}

        </View>
      </LinearGradient>
        
  </SafeAreaView>
  </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    alignItems: 'center'
  },
  logo:
  {
    height: 80,
    width: 210,
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 10
  },

   card: {
    borderRadius: 8,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    
   
  },
    cardText: {
    fontSize: 22,
    fontFamily: 'sans-serif-light',
    color: '#fff',
    letterSpacing: 2,
  },
  categoria:
  {
  
  }
})