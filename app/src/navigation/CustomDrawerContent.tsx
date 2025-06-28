// CustomDrawerContent.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

const DrawerHeader = () => (
  <View style={styles.headerContainer}>
    <Image 
      source={require('../assets/Vestetec-removebg-preview.png')}
      style={styles.logo}
    />
    <Text style={styles.headerTitle}>Painel do Gestor</Text>
  </View>
);

export function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Cabeçalho com logo e título */}
      <DrawerHeader />

      {/* Itens de navegação */}
      <View style={styles.itemsContainer}>
        <DrawerItemList
          {...props}
          itemStyle={styles.drawerItem}
          labelStyle={styles.drawerLabel}
          activeTintColor="#FFFFFF"
          inactiveTintColor="#D1D1D1"
          activeBackgroundColor="rgba(255, 255, 255, 0.1)"
        />
      </View>

      {/* Separador */}
      <View style={styles.separator} />

      {/* Botão de sair */}
      <View style={styles.footerContainer}>
        <DrawerItem
          label="Sair"
          labelStyle={styles.drawerLabel}
          icon={({ color, size }) => (
            <Ionicons name="exit-outline" size={size} color={color} style={styles.iconStyle} />
          )}
          onPress={() => {
            Alert.alert(
              'Confirmação',
              'Deseja sair?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sair',
                  style: 'destructive',
                  onPress: () => {
                    props.navigation.replace('LoginAdm');
                  },
                },
              ]
            );
          }}
          inactiveTintColor="#D1D1D1"
          activeTintColor="#FFFFFF"
          style={styles.logoutItem}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'rgb(3, 14, 47)',
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 12,
    paddingLeft: 5,
  },
  drawerLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFF',
  },
  iconStyle: {
    marginRight: -4, // força alinhamento perfeito com label
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
  },
  logoutItem: {
    marginHorizontal: 10,
    borderRadius: 12,
  },
});
