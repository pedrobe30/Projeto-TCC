import api from './api';


export async function criarAluno({ NomeAlu, Rm, EmailAlu, SenhaAlu, IdEsc })
{
    try {
        const response = await api.post ("/CriarAluno", {
            NomeAlu,
            Rm,
            EmailAlu,
            SenhaAlu,
            IdEsc
        });
        return response.data;
    } catch (error) {
        if (error.response)
        {
            throw new Error(error.response.data?.Mensagem || 'Erro no servidor');
        }
    
    else
    {
        throw new Error("Não foi possível conectar-se a api")
    }
    
    }
}