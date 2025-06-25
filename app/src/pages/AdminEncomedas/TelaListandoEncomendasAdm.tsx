// app/src/pages/Administradores/TelaListandoEncomendasAdm.tsx (ATUALIZADO)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Modal, ScrollView, SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminEncomendaService } from '../../services/AdminEncomendaService';
import { Picker } from '@react-native-picker/picker';

// Interfaces (sem alteração)
interface EncomendaResumo {
  idEncomenda: number;
  dataEncomenda: string;
  precoEncomenda: number;
  situacao: string;
  nomeAluno: string;
}
interface ItemDetalhe {
  idItem: number;
  nomeProduto: string;
  quantidade: number;
  tamanho: string;
  precoTotal: number;
}
interface DetalhesEncomenda extends EncomendaResumo {
  emailAluno: string;
  nomeEscola: string;
  itens: ItemDetalhe[];
}

// Card da Encomenda redesenhado
const EncomendaCard = ({ item, onVerDetalhes }) => {
  const statusInfo = adminEncomendaService.formatarStatus(item.situacao);
  return (
    <TouchableOpacity style={styles.card} onPress={() => onVerDetalhes(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Encomenda #{item.idEncomenda}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Ionicons name={statusInfo.icon as any} size={14} color="#fff" />
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={16} color="#6B6B6B" />
            <Text style={styles.cardText}>{item.nomeAluno}</Text>
        </View>
        <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B6B6B" />
            <Text style={styles.cardText}>{adminEncomendaService.formatarData(item.dataEncomenda)}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>R$ {item.precoEncomenda.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function TelaListandoEncomendasAdm({ navigation }: any) {
  // Estados (lógica inalterada)
  const [todasEncomendas, setTodasEncomendas] = useState<EncomendaResumo[]>([]);
  const [encomendasFiltradas, setEncomendasFiltradas] = useState<EncomendaResumo[]>([]);
  const [estatisticas, setEstatisticas] = useState<{ [key: string]: number }>({});
  const [detalhesEncomenda, setDetalhesEncomenda] = useState<DetalhesEncomenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [modalStatusVisible, setModalStatusVisible] = useState(false);

  // Funções de dados (lógica inalterada)
  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const estatisticasData = await adminEncomendaService.obterEstatisticas();
      setEstatisticas(estatisticasData);
      const statusExistentes = Object.keys(estatisticasData);
      if (statusExistentes.length === 0) {
        setTodasEncomendas([]);
        setEncomendasFiltradas([]);
        setLoading(false);
        return;
      }
      const promessasDeBusca = statusExistentes.map(status =>
        adminEncomendaService.obterTodasEncomendas({ Status: status })
      );
      const resultadosPorStatus = await Promise.all(promessasDeBusca);
      const listaCompleta = resultadosPorStatus.flat().sort((a, b) => new Date(b.dataEncomenda).getTime() - new Date(a.dataEncomenda).getTime());
      setTodasEncomendas(listaCompleta);
    } catch (error: any) { Alert.alert('Erro ao carregar dados', error.message); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { carregarDados(); }, [carregarDados]));
  
  useEffect(() => {
    let encomendas = todasEncomendas;
    if (filtroStatus !== 'Todos') {
      encomendas = encomendas.filter(e => e.situacao.toUpperCase() === filtroStatus.toUpperCase());
    }
    if (termoBusca.trim()) {
      encomendas = encomendas.filter(e =>
        e.idEncomenda.toString().includes(termoBusca) ||
        e.nomeAluno.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    setEncomendasFiltradas(encomendas);
  }, [termoBusca, filtroStatus, todasEncomendas]);

  // Ações (lógica inalterada)
  const handleVerDetalhes = async (encomenda: EncomendaResumo) => {
    setLoading(true);
    try {
      const detalhes = await adminEncomendaService.obterDetalhesEncomenda(encomenda.idEncomenda);
      setDetalhesEncomenda(detalhes);
    } catch (error: any) { Alert.alert('Erro', error.message); }
    finally { setLoading(false); }
  };

  const handleAtualizarStatus = async (novoStatus: string) => {
    if (!detalhesEncomenda) return;
    const { idEncomenda } = detalhesEncomenda;
    setModalStatusVisible(false);
    setLoading(true);
    try {
      await adminEncomendaService.atualizarStatus(idEncomenda, novoStatus);
      Alert.alert('Sucesso', 'Status da encomenda atualizado!');
      setDetalhesEncomenda(null); // Volta para a lista
      await carregarDados();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
      setLoading(false);
    }
  };

  if (loading && !detalhesEncomenda) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Ionicons name="menu" size={32} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Painel de Encomendas</Text>
            </View>
            <View style={styles.centered}><ActivityIndicator size="large" color="#4A90E2" /></View>
        </SafeAreaView>
    );
  }

  // --- TELA DE DETALHES DA ENCOMENDA ---
  if (detalhesEncomenda) {
    const statusInfo = adminEncomendaService.formatarStatus(detalhesEncomenda.situacao);
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => setDetalhesEncomenda(null)} style={styles.menuButton}>
                <Ionicons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalhes da Encomenda</Text>
        </View>
        <ScrollView contentContainerStyle={styles.detailsContainer}>
            <View style={styles.detailsCard}>
                <Text style={styles.detailTitle}>Encomenda #{detalhesEncomenda.idEncomenda}</Text>
                <Text style={styles.detailPrice}>R$ {detalhesEncomenda.precoEncomenda.toFixed(2)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color, alignSelf: 'flex-start', marginVertical: 12 }]}>
                    <Ionicons name={statusInfo.icon as any} size={16} color="#fff" />
                    <Text style={styles.statusText}>{statusInfo.text}</Text>
                </View>
                <View style={styles.detailInfoRow}><Ionicons name="person-circle-outline" size={20} color="#555" /><Text style={styles.detailInfo}>{detalhesEncomenda.nomeAluno}</Text></View>
                <View style={styles.detailInfoRow}><Ionicons name="mail-outline" size={20} color="#555" /><Text style={styles.detailInfo}>{detalhesEncomenda.emailAluno}</Text></View>
                <View style={styles.detailInfoRow}><Ionicons name="school-outline" size={20} color="#555" /><Text style={styles.detailInfo}>{detalhesEncomenda.nomeEscola}</Text></View>
            </View>
            
            <View style={styles.detailsCard}>
                <Text style={styles.detailSectionTitle}>Itens do Pedido</Text>
                {detalhesEncomenda.itens.map(item => (
                    <View key={item.idItem} style={styles.itemDetail}>
                        <Text style={styles.itemText}>{item.quantidade}x {item.nomeProduto} ({item.tamanho})</Text>
                        <Text style={styles.itemText}>R$ {item.precoTotal.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setModalStatusVisible(true)}>
                <Ionicons name="sync-circle-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Alterar Status</Text>
            </TouchableOpacity>
        </ScrollView>
        <Modal visible={modalStatusVisible} transparent={true} animationType="fade" onRequestClose={() => setModalStatusVisible(false)}>
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setModalStatusVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selecione o novo status:</Text>
                    {['PENDENTE', 'CONFIRMADA', 'ENTREGUE', 'CANCELADA'].map(status => (
                        <TouchableOpacity key={status} style={styles.modalOption} onPress={() => handleAtualizarStatus(status)}>
                            <Text style={styles.modalOptionText}>{status}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    );
  }

  // --- TELA PRINCIPAL (LISTA DE ENCOMENDAS) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel de Encomendas</Text>
      </View>
      
      <View style={styles.statsContainer}>
        {Object.entries(estatisticas).map(([status, count]) => (
          <View key={status} style={styles.statBox}>
            <Text style={styles.statCount}>{count}</Text>
            <Text style={styles.statLabel}>{status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.filterContainer}>
        <TextInput style={styles.searchInput} placeholder="Buscar por ID ou nome do aluno..." value={termoBusca} onChangeText={setTermoBusca} />
        <View style={styles.pickerContainer}>
          <Picker selectedValue={filtroStatus} onValueChange={setFiltroStatus} >
            <Picker.Item label="Todos os Status" value="Todos" />
            {Object.keys(estatisticas).map(status => <Picker.Item key={status} label={status} value={status} />)}
          </Picker>
        </View>
      </View>

      <FlatList
        data={encomendasFiltradas}
        keyExtractor={(item) => item.idEncomenda.toString()}
        renderItem={({ item }) => <EncomendaCard item={item} onVerDetalhes={handleVerDetalhes} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma encomenda encontrada.</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F9FC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    menuButton: { padding: 5, marginRight: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F2F2F' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, backgroundColor: '#EDF2F7' },
    statBox: { alignItems: 'center' },
    statCount: { fontSize: 22, fontWeight: 'bold', color: '#4A90E2' },
    statLabel: { fontSize: 13, color: '#6B6B6B', marginTop: 4 },
    filterContainer: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    searchInput: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F7F9FC', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
    pickerContainer: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F7F9FC', borderRadius: 12, overflow: 'hidden' },
    card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2F2F2F' },
    cardBody: { padding: 16 },
    cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cardText: { color: '#555', fontSize: 15, marginLeft: 8 },
    cardFooter: { alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 16 },
    cardPrice: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
    
    // --- Estilos da Tela de Detalhes ---
    detailsContainer: { padding: 16 },
    detailsCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 16, elevation: 1 },
    detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#2F2F2F' },
    detailPrice: { fontSize: 22, fontWeight: 'bold', color: '#27ae60', marginTop: 4 },
    detailInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    detailInfo: { fontSize: 16, color: '#333', marginLeft: 10 },
    detailSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2F2F2F', marginBottom: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 16 },
    itemDetail: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    itemText: { fontSize: 15, color: '#333' },
    actionButton: { flexDirection: 'row', backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#4A90E2', shadowOpacity: 0.3, shadowRadius: 5 },
    actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },

    // --- Estilos do Modal ---
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 16, width: '85%', elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, textAlign: 'center', color: '#2F2F2F' },
    modalOption: { paddingVertical: 18, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    modalOptionText: { textAlign: 'center', fontSize: 18, color: '#4A90E2', fontWeight: '500' }
});