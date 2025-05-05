import api from './api';
import loginApi from './LoginApi';
import verificationApi from './VerificatioApi';

// envia o codigo para o email

export async function enviarCodigo(email) {
    
    const {data} = await verificationApi.post('/enviar-codigo', `"${email}"` );
    return data; //Responsemodel<bool>
}

//Verifica o codigo recebido

export async function verificarCodigo({Codigo, Email}) {
    const {data} = await verificationApi.post('/verificar-email', {Email, Codigo });
    return data;
}

// Faz o Login  e recebe o token JWT
export async function login({ email, senha}) {
    try{
        const {data} = await loginApi.post('/autenticar', {email, senha});
        return data;
    }
    catch(error)
    {
        throw new Error(error.response?.data?.Mensagem || 'Erro no Login');
    }
}

export async function esqueciSenha() {
    
}

export async function reenviarCodigo(email) {
    // O endpoint espera um corpo JSON contendo apenas a string de e-mail
    const { data } = await verificationApi.post('/reenviar-codigo', `"${email}"`);
    return data; // ResponseModel<bool>
  }