// EncomendasScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api_img } from '../../services/api';
import { encomendaService } from '../../services/EncomendasService';

const { width } = Dimensions.get('window');

// Interfaces
interface ItemEncomenda {
  idItem: number;
  idProduto: number;
  nomeProduto: string;
  categoriaNome: string;
  modeloNome: string;
  tecidoNome?: string;
  imagemUrl: string;
  precoUnitario: number;
  quantidade: number;
  precoTotal: number;
}

interface Encomenda {
  idEncomenda: number;
  dataEncomenda: string;
  precoEncomenda: number;
  situacao: string;
  dataEntrega: string;
  totalItens: number;
  itens?: ItemEncomenda[];
}

const EncomendasScreen: React.FC = () => {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [encomendaSelecionada, setEncomendaSelecionada] = useState<Encomenda | null>(null);
  const [mostrandoDetalhes, setMostrandoDetalhes] = useState<boolean>(false);
  
  const navigation = useNavigation();

  // Carregar encomendas
  const carregarEncomendas = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const encomendasData = await encomendaService.obterEncomendasAluno();
      setEncomendas(encomendasData);
    } catch (error) {
      console.error('Erro ao carregar encomendas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as encomendas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recarregar encomendas quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarEncomendas();
    }, [carregarEncomendas])
  );

  // Refresh
  const handleRefresh = (): void => {
    setRefreshing(true);
    carregarEncomendas();
  };

  // Ver detalhes da encomenda
  const verDetalhesEncomenda = async (encomenda: Encomenda): Promise<void> => {
    try {
      setLoading(true);
      const detalhes = await encomendaService.obterDetalhesEncomenda(encomenda.idEncomenda);
      setEncomendaSelecionada(detalhes);
      setMostrandoDetalhes(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da encomenda');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar encomenda
  const cancelarEncomenda = (encomenda: Encomenda): void => {
    Alert.alert(
      'Cancelar Encomenda',
      `Deseja realmente cancelar a encomenda #${encomenda.idEncomenda}?`,
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await encomendaService.cancelarEncomenda(encomenda.idEncomenda);
              Alert.alert('Sucesso', 'Encomenda cancelada com sucesso');
              carregarEncomendas();
            } catch (error) {
              console.error('Erro ao cancelar encomenda:', error);
              Alert.alert('Erro', 'Não foi possível cancelar a encomenda');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Voltar para lista
  const voltarParaLista = (): void => {
    setMostrandoDetalhes(false);
    setEncomendaSelecionada(null);
  };

  // Voltar tela
  const voltarTela = (): void => {
    if (mostrandoDetalhes) {
      voltarParaLista();
    } else {
      navigation.goBack();
    }
  };

  // Componente do item da encomenda
  const ItemEncomenda: React.FC<{ item: Encomenda }> = ({ item }) => {
    const statusInfo = encomendaService.formatarStatus(item.situacao);
    const diasParaEntrega = encomendaService.calcularDiasParaEntrega(item.dataEntrega);
    const podeSerCancelada = encomendaService.podeSerCancelada(item.situacao);

    return (
      <TouchableOpacity 
        style={styles.encomendaCard}
        onPress={() => verDetalhesEncomenda(item)}
        activeOpacity={0.7}
      >
        <View style={styles.encomendaHeader}>
          <View style={styles.encomendaHeaderLeft}>
            <Text style={styles.encomendaId}>Encomenda #{item.idEncomenda}</Text>
            <Text style={styles.encomendaData}>
              {encomendaService.formatarData(item.dataEncomenda)}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color="#fff" />
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.encomendaInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{item.totalItens} itens</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.infoText}>R$ {item.precoEncomenda.toFixed(2)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Entrega: {diasParaEntrega}</Text>
          </View>
        </View>

        <View style={styles.encomendaActions}>
          <TouchableOpacity 
            style={styles.detalhesButton}
            onPress={() => verDetalhesEncomenda(item)}
          >
            <Text style={styles.detalhesButtonText}>Ver Detalhes</Text>
            <Ionicons name="chevron-forward" size={16} color="#A30101" />
          </TouchableOpacity>
          
          {podeSerCancelada && (
            <TouchableOpacity 
              style={styles.cancelarButton}
              onPress={() => cancelarEncomenda(item)}
            >
              <Text style={styles.cancelarButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Componente de detalhes da encomenda
  const DetalhesEncomenda: React.FC = () => {
    if (!encomendaSelecionada) return null;

    const statusInfo = encomendaService.formatarStatus(encomendaSelecionada.situacao);
    const diasParaEntrega = encomendaService.calcularDiasParaEntrega(encomendaSelecionada.dataEntrega);
    const podeSerCancelada = encomendaService.podeSerCancelada(encomendaSelecionada.situacao);

    return (
      <ScrollView style={styles.detalhesContainer} showsVerticalScrollIndicator={false}>
        {/* Header dos detalhes */}
        <View style={styles.detalhesHeader}>
          <Text style={styles.detalhesId}>Encomenda #{encomendaSelecionada.idEncomenda}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color="#fff" />
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        {/* Informações da encomenda */}
        <View style={styles.detalhesCard}>
          <Text style={styles.detalhesCardTitle}>Informações da Encomenda</Text>
          
          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Data da Encomenda:</Text>
            <Text style={styles.detalhesValue}>
              {encomendaService.formatarData(encomendaSelecionada.dataEncomenda)}
            </Text>
          </View>
          
          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Data de Entrega:</Text>
            <Text style={styles.detalhesValue}>
              {encomendaService.formatarData(encomendaSelecionada.dataEntrega)} ({diasParaEntrega})
            </Text>
          </View>
          
          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Total de Itens:</Text>
            <Text style={styles.detalhesValue}>{encomendaSelecionada.totalItens}</Text>
          </View>
          
          <View style={styles.detalhesRow}>
            <Text style={styles.detalhesLabel}>Valor Total:</Text>
            <Text style={[styles.detalhesValue, styles.valorTotal]}>
              R$ {encomendaSelecionada.precoEncomenda.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Lista de itens */}
        {encomendaSelecionada.itens && (
          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesCardTitle}>Itens da Encomenda</Text>
            
            {encomendaSelecionada.itens.map((item, index) => (
              <View key={index} style={styles.itemDetalhes}>
                <View style={styles.itemImageContainer}>
                  <Image
                    source={{ uri: `${api_img}${item.imagemUrl}` }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                </View>
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.nomeProduto}</Text>
                  {item.tecidoNome && (
                    <Text style={styles.itemTecido}>{item.tecidoNome}</Text>
                  )}
                  
                  <View style={styles.itemPrecoQuantidade}>
                    <Text style={styles.itemPreco}>
                      R$ {item.precoUnitario.toFixed(2)} x {item.quantidade}
                    </Text>
                    <Text style={styles.itemTotal}>
                      R$ {item.precoTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Botão de cancelar */}
        {podeSerCancelada && (
          <TouchableOpacity 
            style={styles.cancelarEncomendaButton}
            onPress={() => cancelarEncomenda(encomendaSelecionada)}
          >
            <Ionicons name="close-circle-outline" size={24} color="#fff" />
            <Text style={styles.cancelarEncomendaButtonText}>Cancelar Encomenda</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  // Componente de encomendas vazias
  const EncomendasVazias: React.FC = () => (
    <View style={styles.encomendasVaziasContainer}>
      <View style={styles.encomendasVaziasIcone}>
        <Ionicons name="receipt-outline" size={100} color="#ccc" />
      </View>
      
      <Text style={styles.encomendasVaziasTitulo}>NENHUMA ENCOMENDA ENCONTRADA</Text>
      <Text style={styles.encomendasVaziasSubtitulo}>
        Suas encomendas aparecerão aqui quando você fizer uma compra.
      </Text>

      <TouchableOpacity 
        style={styles.irParaLojaBotao} 
        onPress={() => navigation.navigate('Home' as never)}
      >
        <Text style={styles.irParaLojaBotaoTexto}>IR PARA LOJA</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image 
          style={styles.logoVazio} 
          source={require('../../assets/Vestetec-removebg-preview.png')} 
        />
      </View>
    </View>
  );

  // Renderizar item
  const renderItem = ({ item }: { item: Encomenda }) => <ItemEncomenda item={item} />;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A30101" />
          <Text style={styles.loadingText}>Carregando encomendas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={voltarTela} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Image 
            style={styles.logo} 
            source={require('../../assets/Vestetec-removebg-preview.png')} 
          /> 
        </View>
        
        <View style={styles.navigationIcons}>
          <Text style={styles.titulo}>
            {mostrandoDetalhes ? 'Detalhes' : 'Minhas Encomendas'}
          </Text>
        </View>
      </View>

      {mostrandoDetalhes ? (
        <DetalhesEncomenda />
      ) : encomendas.length === 0 ? (
        <EncomendasVazias />
      ) : (
        <FlatList
          data={encomendas}
          renderItem={renderItem}
          keyExtractor={(item) => item.idEncomenda.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#A30101']}
              tintColor="#A30101"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    height: 30,
    width: '40%',
  },
  navigationIcons: {
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Lista de encomendas
  listContainer: {
    padding: 16,
  },
  encomendaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  encomendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  encomendaHeaderLeft: {
    flex: 1,
  },
  encomendaId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  encomendaData: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  encomendaInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  encomendaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detalhesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detalhesButtonText: {
    color: '#A30101',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  cancelarButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelarButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Detalhes da encomenda
  detalhesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  detalhesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detalhesId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  detalhesCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detalhesCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detalhesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detalhesLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detalhesValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valorTotal: {
    fontSize: 16,
    color: '#A30101',
    fontWeight: 'bold',
  },
  // Itens da encomenda
  itemDetalhes: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemTecido: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemPrecoQuantidade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPreco: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A30101',
  },
  // Botão cancelar encomenda nos detalhes
  cancelarEncomendaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelarEncomendaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Encomendas vazias
  encomendasVaziasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  encomendasVaziasIcone: {
    marginBottom: 24,
  },
  encomendasVaziasTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  encomendasVaziasSubtitulo: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  irParaLojaBotao: {
    backgroundColor: '#A30101',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 32,
  },
  irParaLojaBotaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoVazio: {
    height: 80,
    width: 120,
    opacity: 0.3,
  },
});

export default EncomendasScreen;