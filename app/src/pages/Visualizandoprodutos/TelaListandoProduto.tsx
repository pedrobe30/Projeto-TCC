// app/src/pages/Visualizandoprodutos/TelaListandoProduto.tsx (CORRIGIDO)
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { produtoService } from '../../services/ProdutoApii';
import { cadastroProdutoService } from '../../services/CadastroProdutoService';
import { API_BASE_URL } from '../../services/config';

// Componente de Card para cada produto
const ProdutoCard = ({ item, onEdit, onDelete }) => {
  const imageUrl = item.imgUrl && !item.imgUrl.startsWith('http')
    ? `${API_BASE_URL.replace('/api', '')}/${item.imgUrl}`
    : item.imgUrl || 'https://via.placeholder.com/300'; // Placeholder

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.modeloNome || 'Produto sem nome'}</Text>
        <Text style={styles.cardSubtitle}>{item.categoriaNome}</Text>
        <View style={styles.priceStockRow}>
            <Text style={styles.cardPrice}>R$ {item.preco.toFixed(2)}</Text>
            <Text style={styles.cardStock}>Estoque: {item.quantEstoque || 0}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEdit(item.idProd)}>
          <Ionicons name="pencil-outline" size={20} color="#333" />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(item.idProd)}>
          <Ionicons name="trash-outline" size={20} color="#D0021B" />
          <Text style={[styles.buttonText, { color: '#D0021B' }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TelaListandoProduto({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarProdutos = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
        const response = await produtoService.getAllProdutos();
        if (response.status) {
            setProdutos(response.dados);
        } else {
            Alert.alert('Erro', 'Não foi possível carregar os produtos.');
        }
    } catch (e) {
        Alert.alert('Erro', 'Ocorreu um erro de rede.');
    } finally {
        setLoading(false);
    }
  }, [refreshing]);

  useFocusEffect(useCallback(() => { carregarProdutos(); }, [carregarProdutos]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarProdutos().then(() => setRefreshing(false));
  }, [carregarProdutos]);

  const handleEdit = (id) => navigation.navigate('TelaAtualizar', { produtoId: id });

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const response = await cadastroProdutoService.excluirProduto(id);
            if (response.status) {
              Alert.alert('Sucesso', 'Produto excluído com sucesso.');
              carregarProdutos();
            } else {
              Alert.alert('Erro', response.mensagem);
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Produtos</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.idProd.toString()}
        renderItem={({ item }) => <ProdutoCard item={item} onEdit={handleEdit} onDelete={handleDelete} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4A90E2"]} />}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CadastroProduto')}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderBottomColor: '#EEE', borderBottomWidth: 1},
  menuButton: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F2F2F' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6B6B6B' },
  list: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, },
  cardImage: { width: '100%', height: 200, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#2F2F2F' },
  cardSubtitle: { fontSize: 14, color: '#6B6B6B', marginBottom: 12 },
  priceStockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardPrice: { fontSize: 22, fontWeight: 'bold', color: '#4A90E2' },
  cardStock: { fontSize: 14, fontWeight: '500', color: '#27ae60' },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  actionButton: { flex: 1, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  editButton: { borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  // <<<---- CORREÇÃO APLICADA AQUI ---->>>
  deleteButton: {}, // Adicionada a definição que faltava
  buttonText: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#4A90E2', shadowRadius: 8, shadowOpacity: 0.4, },
  emptyText: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#6B6B6B' },
});