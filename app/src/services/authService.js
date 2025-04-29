import api from './api';

// envia o codigo para o email

export async function enviarCodigo(email) {
    
    const {data} = await api.post('/Verificacao/enviar-codigo', '"${email}"' );
    return data; //Responsemodel<bool>
}

//Verifica o codigo recebido

export async function verificarCodigo({Codigo, Email}) {
    const {data} = await api.post('/Verificacao/verificar-email', {Email, Codigo });
    return data;
}

// Faz o Login  e recebe o token JWT
export async function login({ email, senha}) {
    try{
        const {data} = await api.post('/Login/autenticar', {email, senha});
        return data;
    }
    catch(error)
    {
        throw new Error(error.response?.data?.Mensagem || 'Erro no Login');
    }
}

export async function reenviarCodigo(email) {
    // O endpoint espera um corpo JSON contendo apenas a string de e-mail
    const { data } = await api.post(
      '/Verificacao/reenviar-codigo',
      `"${email}"`
    );
    return data; // ResponseModel<bool>
  }