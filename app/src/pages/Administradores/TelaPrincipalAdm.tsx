// app/src/pages/Administradores/TelaPrincipalAdm.tsx (ATUALIZADO COM CABEÇALHO ELEGANTE)
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { adminEncomendaService } from '../../services/AdminEncomendaService';
import { produtoService } from '../../services/ProdutoApii';
import { LineChart, PieChart } from 'react-native-chart-kit';
import StorageService from '../../services/StorageService';

// Interfaces
interface Encomenda {
  idEncomenda: number;
  dataEncomenda: string;
  nomeAluno: string;
  precoEncomenda: number;
  situacao: string;
}
interface Produto {
    idProd: number;
    modeloNome: string;
    quantEstoque: number;
}
interface DashboardData {
  totalEncomendas: number;
  faturamentoTotal: number;
  ticketMedio: number;
  totalProdutos: number;
  encomendasRecentes: Encomenda[];
  produtosEstoqueBaixo: Produto[];
  estatisticasStatus: Record<string, number>;
  tendenciaFaturamento: { labels: string[]; data: number[] };
}

const screenWidth = Dimensions.get('window').width;

const DashboardCard = ({ icon, title, value, color }) => (
  <View style={[styles.card, { borderTopColor: color }]}>
    <Ionicons name={icon} size={32} color={color} />
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const chartConfig = {
    backgroundGradientFrom: "#FFF",
    backgroundGradientTo: "#FFF",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 107, 107, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "5", strokeWidth: "2", stroke: "#4A90E2" },
};

export default function TelaPrincipalAdm() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  
  const [adminName, setAdminName] = useState('Admin'); 
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    // Capitaliza a primeira letra do dia da semana e do mês
    const capitalizedDate = formattedDate.replace(/\b\w/g, char => char.toUpperCase());
    setCurrentDate(capitalizedDate);

    const fetchAdminData = async () => {
      const adminData = await StorageService.getAdminData();
      if (adminData && adminData.nome) {
        setAdminName(adminData.nome);
      }
    };
    fetchAdminData();
    // Lógica para buscar o nome do admin (ex: de um Context ou AsyncStorage)
  }, []);

  const carregarDashboard = useCallback(async () => {
    // A lógica de carregamento permanece a mesma
    try {
      setLoading(true);
      const [estatisticasRaw, produtosRaw] = await Promise.all([
        adminEncomendaService.obterEstatisticas(),
        produtoService.getAllProdutos()
      ]);

      const estatisticas = (estatisticasRaw as Record<string, number>);
      const produtosArray = Array.isArray(produtosRaw.dados) ? produtosRaw.dados : [];

      const statusExistentes = Object.keys(estatisticas);
      const promessasEncomendas = statusExistentes.map(status =>
        adminEncomendaService.obterTodasEncomendas({ Status: status })
      );
      const resultadosPorStatus = await Promise.all(promessasEncomendas);
      const todasEncomendas: Encomenda[] = resultadosPorStatus.flat();

      const faturamento = todasEncomendas
        .filter(e => ['ENTREGUE'].includes(e.situacao.toUpperCase()))
        .reduce((acc, enc) => acc + (Number(enc.precoEncomenda) || 0), 0);

      const totalEncomendas = todasEncomendas.length;
      const ticketMedio = totalEncomendas > 0 ? faturamento / totalEncomendas : 0;
      const totalProdutos = produtosArray.length;
      const produtosEstoqueBaixo = produtosArray.filter(p => p.quantEstoque < 10).slice(0, 5);
      const sorted = [...todasEncomendas].sort((a, b) => new Date(b.dataEncomenda).getTime() - new Date(a.dataEncomenda).getTime());
      const encomendasRecentes = sorted.slice(0, 5);

      const hoje = new Date();
      const labels: string[] = [];
      const dataF: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dia = new Date(hoje);
        dia.setDate(hoje.getDate() - i);
        labels.push(`${dia.getDate()}/${dia.getMonth() + 1}`);
        const faturDia = todasEncomendas
          .filter(e => {
            const d = new Date(e.dataEncomenda);
            return d.getDate() === dia.getDate() && d.getMonth() === dia.getMonth() && d.getFullYear() === dia.getFullYear();
          })
          .filter(e => ['ENTREGUE', 'CONFIRMADA', 'PROCESSANDO'].includes(e.situacao.toUpperCase()))
          .reduce((acc, enc) => acc + (Number(enc.precoEncomenda) || 0), 0);
        dataF.push(parseFloat(faturDia.toFixed(2)));
      }

      setData({
        totalEncomendas,
        faturamentoTotal: faturamento,
        ticketMedio,
        totalProdutos,
        encomendasRecentes,
        produtosEstoqueBaixo,
        estatisticasStatus: estatisticas,
        tendenciaFaturamento: { labels, data: dataF }
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do painel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarDashboard(); }, [carregarDashboard]));

  if (loading || !data) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#003366" /></View>;
  }

  const pieData = Object.entries(data.estatisticasStatus).map(([key, value], idx) => ({
    name: key,
    population: value,
    color: ['#4A90E2', '#F5A623', '#27ae60', '#d9534f', '#9b59b6'][idx % 5],
    legendFontColor: "#6B6B6B",
    legendFontSize: 14,
  }));

  const renderHeader = () => (
    <>
      {/* <<< INÍCIO DO CABEÇALHO REDESENHADO >>> */}
      <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                <Ionicons name="menu" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerDateText}>{currentDate}</Text>
          </View>
          <Text style={styles.headerGreeting}>Olá, {adminName}!</Text>
          <Text style={styles.headerMainTitle}>Bem-vindo ao Controle de Estoque VestEtec</Text>
      </View>
      {/* <<< FIM DO CABEÇALHO REDESENHADO >>> */}

      <Text style={styles.dashboardTitle}>Resumo Geral</Text>
      <View style={styles.cardsContainer}>
        <DashboardCard icon="cash-outline" title="Faturamento" value={`R$ ${(data.faturamentoTotal || 0).toFixed(2)}`} color="#27ae60" />
        <DashboardCard icon="stats-chart-outline" title="Ticket Médio" value={`R$ ${(data.ticketMedio || 0).toFixed(2)}`} color="#F5A623" />
        <DashboardCard icon="receipt-outline" title="Encomendas" value={data.totalEncomendas} color="#4A90E2" />
        <DashboardCard icon="shirt-outline" title="Produtos" value={data.totalProdutos} color="#8e44ad" />
      </View>
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tendência de Faturamento (Últimos 7 dias)</Text>
        <LineChart data={{ labels: data.tendenciaFaturamento.labels, datasets: [{ data: data.tendenciaFaturamento.data }] }} width={screenWidth - 32} height={220} formatYLabel={(y) => `R$${y}`} chartConfig={chartConfig} style={styles.chartStyle} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribuição de Encomendas</Text>
        <PieChart data={pieData} width={screenWidth - 32} height={220} accessor="population" backgroundColor="transparent" paddingLeft="15" center={[10, 0]} absolute chartConfig={chartConfig} style={styles.chartStyle} />
      </View>
       {data.produtosEstoqueBaixo.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos com Estoque Baixo</Text>
          <View style={styles.lowStockContainer}>
            {data.produtosEstoqueBaixo.map(prod => (
              <View key={prod.idProd} style={styles.lowStockItem}>
                <Ionicons name="warning-outline" size={20} color="#D0021B" />
                <Text style={styles.lowStockText}>{prod.modeloNome}</Text>
                <Text style={styles.lowStockBadge}>{prod.quantEstoque} un.</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <Text style={styles.sectionTitle}>Últimas Encomendas</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data.encomendasRecentes}
        keyExtractor={(item) => item.idEncomenda.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('AdminEncomendas')}>
            <View style={styles.listRow}>
              <Text style={styles.listId}>#{item.idEncomenda}</Text>
              <Text style={styles.listText} numberOfLines={1}>{item.nomeAluno}</Text>
              <Text style={[styles.listText, { color: '#6B6B6B' }]}>{new Date(item.dataEncomenda).toLocaleDateString('pt-BR')}</Text>
              <Text style={[styles.listStatus, {backgroundColor: adminEncomendaService.formatarStatus(item.situacao).color }]}>{item.situacao}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma encomenda recente.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9FC' },
  
  // <<< ESTILOS DO NOVO CABEÇALHO >>>
  header: { 
    backgroundColor: '#0D253F', // Cor de fundo azul escuro
    paddingHorizontal: 20, 
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuButton: { 
    padding: 5,
  },
  headerDateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerGreeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerMainTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
  // <<< FIM DOS ESTILOS DO CABEÇALHO >>>

  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F2F2F',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingHorizontal: 8, },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 5, width: '46%', marginBottom: 16, borderTopWidth: 4, },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#2F2F2F', marginVertical: 4 },
  cardTitle: { fontSize: 14, color: '#6B6B6B', textAlign: 'center' },
  section: { marginHorizontal: 16, marginBottom: 20, backgroundColor: '#FFF', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2F2F2F', marginBottom: 12 },
  chartStyle: { borderRadius: 16 },
  listItem: { backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 12, marginBottom: 10, elevation: 1.5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  listId: { fontWeight: 'bold', color: '#2F2F2F' },
  listText: { flex: 1, textAlign: 'left', marginLeft: 16, color: '#2F2F2F' },
  listStatus: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, color: '#FFF', fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  emptyText: { textAlign: 'center', padding: 20, color: '#6B6B6B' },
  lowStockContainer: { borderRadius: 12, backgroundColor: 'rgba(208, 2, 27, 0.05)', padding: 8, },
  lowStockItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  lowStockText: { marginLeft: 8, color: '#2F2F2F', flex: 1 },
  lowStockBadge: { backgroundColor: '#D0021B', color: '#FFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontSize: 12, fontWeight: 'bold', },
});