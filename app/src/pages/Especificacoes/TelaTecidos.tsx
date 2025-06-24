// app/src/pages/Especificacoes/TelaTecidos.tsx (ATUALIZADO)
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Modal, SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { tecidoService } from '../../services/TecidoService';

interface Tecido {
  idTecido: number;
  tipoTecido: string;
}

export default function TelaTecidos({ navigation }: any) {
  const [items, setItems] = useState<Tecido[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<Tecido | null>(null);
  const [inputValue, setInputValue] = useState('');

  const carregarItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tecidoService.getAll();
      setItems(data);
    } catch (error) { Alert.alert("Erro", "Não foi possível carregar os tecidos."); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { carregarItems(); }, [carregarItems]));

  const handleOpenModal = (item: Tecido | null) => {
    setCurrentItem(item);
    setInputValue(item ? item.tipoTecido : '');
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este tecido?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try {
          await tecidoService.delete(id);
          Alert.alert("Sucesso", "Tecido excluído.");
          carregarItems();
        } catch (error) { Alert.alert("Erro", "Não foi possível excluir o tecido."); }
      }},
    ]);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) { Alert.alert("Erro", "O nome do tecido não pode ser vazio."); return; }
    setLoading(true);
    try {
      if (currentItem) {
        await tecidoService.update(currentItem.idTecido, inputValue);
      } else {
        await tecidoService.create(inputValue);
      }
      Alert.alert("Sucesso", `Tecido ${currentItem ? 'atualizado' : 'criado'} com sucesso.`);
      setModalVisible(false);
      carregarItems();
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar o tecido.");
    } finally {
        setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Tecidos</Text>
         <TouchableOpacity onPress={() => handleOpenModal(null)} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#4A90E2" />
        </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Tecido }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.tipoTecido}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleOpenModal(item)} style={[styles.iconButton, styles.editButton]}>
          <Ionicons name="pencil-outline" size={22} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.idTecido)} style={[styles.iconButton, styles.deleteButton]}>
          <Ionicons name="trash-outline" size={22} color="#D0021B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      {loading && items.length === 0 ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#4A90E2" /></View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.idTecido.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum tecido encontrado.</Text>}
        />
      )}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentItem ? 'Editar' : 'Adicionar'} Tecido</Text>
            <TextInput style={styles.input} placeholder="Nome do Tecido" value={inputValue} onChangeText={setInputValue} />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.modalButtonText, {color: '#FFF'}]}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F9FC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    menuButton: { position: 'absolute', left: 16, top: 12, zIndex: 1, padding: 5 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#2F2F2F' },
    addButton: { padding: 5 },
    list: { padding: 16 },
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    itemText: { fontSize: 18, color: '#333', flex: 1 },
    buttonContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconButton: { padding: 8, borderRadius: 20 },
    editButton: { backgroundColor: '#F0F0F0' },
    deleteButton: { backgroundColor: '#FEE' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 16, padding: 24, elevation: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F7F9FC', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 16 },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    cancelButton: { backgroundColor: '#E0E0E0' },
    saveButton: { backgroundColor: '#4A90E2' },
    modalButtonText: { fontWeight: 'bold', fontSize: 16, color: '#333' }
});