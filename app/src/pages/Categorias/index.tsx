// Updated Categories Screen with proper navigation to filtered products
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import apiCategorias from '../../services/apiCategorias';


interface Category {
  idCategoria: number;
  categoria: string;
}

export default function Categorias() {
  // State to store the categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const navigation = useNavigation();

  // Fetch categories when component mounts
  useEffect(() => {
    console.log("Componente montado, buscando categorias...");
    fetchCategories();
  }, []);

  // Function to fetch categories from the API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("Fazendo solicitação de API para buscar categorias...");
      
      // Try using your api instance first
      try {
        // Change endpoint from Categoria to endpoint that matches your Controller name
        const response = await apiCategorias.get('/Categorias');
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        
        // Check if the response has the expected structure
        if (response.data && response.data.dados) {
          console.log("Definindo categorias a partir de response.data.dados");
          setCategories(response.data.dados);
        } else {
          console.log("Definindo categorias diretamente da resposta.data");
          setCategories(response.data);
        }
        
        setError(null);
      } catch (apiError) {
        console.log("Error with api instance, trying direct axios call:", apiError);
        
        // Fallback to direct axios call with different URL format
        const directResponse = await axios.get('https://localhost:7024/api/Categorias');
        console.log("Direct axios response:", JSON.stringify(directResponse.data, null, 2));
        
        if (directResponse.data && directResponse.data.dados) {
          setCategories(directResponse.data.dados);
        } else {
          setCategories(directResponse.data);
        }
        
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      
      // More detailed error logging
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response 
          ? `Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`
          : `${err.message} - Check if API server is running`;
        
        console.log("Axios error details:", errorMsg);
        setErrorDetails(errorMsg);
      } else {
        console.log("Non-axios error:", err);
        setErrorDetails(err instanceof Error ? err.message : String(err));
      }
      
      setError('Failed to load categories. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Updated function to handle category selection and navigate to filtered products
  const handleCategoryPress = (category: Category) => {
    console.log(`Categoria selecionada:`, category);
    
    try {
      // Navigate to the filtered products screen, passing category data as parameters
      // Make sure 'FilteredProductList' matches the route name in your navigation stack
      navigation.navigate('FilteredProductList', {categoryId: category.idCategoria, categoryName: category.categoria});

    } catch (navigationError) {
      console.error('Erro ao navegar para produtos filtrados:', navigationError);
      
      // Fallback: show alert if navigation fails
      Alert.alert(
        "Navegação",
        `Selecionada categoria: ${category.categoria} (ID: ${category.idCategoria})\n\nPor favor, verifique se a rota 'FilteredProductList' está configurada no seu navigator.`,
        [{ text: "OK" }]
      );
    }
  };

  // Render each category item
  const renderCategoryItem = ({ item }: { item: Category }) => {
    console.log("Renderizando item da categoria:", item); // Debug log
    
    return (
      <TouchableOpacity 
        style={styles.categoryContainer}
        onPress={() => handleCategoryPress(item)} // Pass the entire category object
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#740000', '#2F0202']}
          locations={[0.15, 0.91]} // 15% e 91%
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardText}>
            {item.categoria || 'Nome não disponível'}
          </Text>
          
          {/* Optional: Add a small indicator showing this will navigate */}
          <Text style={styles.navigationHint}>
            Toque para ver produtos →
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#EEEEEE', '#310505']}
      locations={[0.15, 0.82]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
<<<<<<< HEAD:app/src/pages/Home/Categorias/index.tsx
      <SafeAreaView style={styles.safeArea}>
        <Image 
          source={require("../../../assets/Vestetec-removebg-preview.png")} 
          style={styles.logo}
        />
=======
    <SafeAreaView>

    <Image source={require("../../assets/Vestetec-removebg-preview.png")} style={styles.logo}></Image>

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
>>>>>>> 07f9e67d5999ecbce226320e46a157133e6e001c:app/src/pages/Categorias/index.tsx
        
        <Text style={styles.title}>Categorias</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#740000" />
            <Text style={styles.loadingText}>Carregando categorias...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {errorDetails && (
              <Text style={styles.errorDetails}>{errorDetails}</Text>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Nenhuma categoria encontrada.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
              <Text style={styles.retryButtonText}>Recarregar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.idCategoria?.toString() || Math.random().toString()}
            contentContainerStyle={styles.categoriesList}
            numColumns={1} // Single column layout
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    height: 80,
    width: 210,
    marginTop: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoriesList: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  categoryContainer: {
    width: windowWidth - 40,
    marginBottom: "15%",
    marginRight: "5%"
  },
  card: {
    borderRadius: 12,
    padding: 20,
    height: 100, // Increased height to accommodate navigation hint
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between', // Space between title and hint
  },
  cardText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  navigationHint: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#ffcccc',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 5,
    maxWidth: '90%',
  },
  retryButton: {
    backgroundColor: '#740000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});