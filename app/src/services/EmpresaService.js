import axios from 'axios';

const API_URL = 'http://10.0.0.168:5260/api'; // Mude para a URL do seu backend se necessário

export const getEmpresasForDropdown = async () => {
    try {
        console.log('Fazendo requisição para:', `${API_URL}/Empresas/dropdown`);
        const response = await axios.get(`${API_URL}/Empresas/dropdown`);
        console.log('Status da resposta:', response.status);
        
        const rawData = response.data; // Dados brutos recebidos da API
        console.log('Dados brutos recebidos da API de empresas:', rawData);

        // Formata os dados para garantir que as propriedades sejam 'idEmpresa' e 'nome'
        const formattedData = rawData.map(empresa => {
            console.log('Processando empresa:', {
                id: empresa.idEmpresa || empresa.IdEmpresa,
                nome: empresa.nome || empresa.Nome,
                original: empresa
            });
            
            return {
                idEmpresa: String(empresa.idEmpresa || empresa.IdEmpresa), // Converte para string
                nome: empresa.nome || empresa.Nome
            };
        }).filter(empresa => 
            empresa.idEmpresa !== undefined && 
            empresa.idEmpresa !== null && 
            empresa.idEmpresa !== 'undefined' &&
            empresa.nome !== undefined && 
            empresa.nome !== null
        );

        console.log('Dados formatados para o dropdown de empresas:', formattedData);
        return formattedData;
    } catch (error) {
        console.error('Erro ao buscar empresas para dropdown:', error.response?.data || error.message || error);
        throw error;
    }
};