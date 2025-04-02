import React, { useState } from 'react';
import { Text, View, SafeAreaView, StyleSheet, Image, StatusBar, TextInput, Touchable, TouchableOpacity, ScrollView } from "react-native";
import {useForm, Controller} from 'react-hook-form';
import *as yup from 'yup'
import {yupResolver} from '@hookform/resolvers/yup'
import {Foundation} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {

  const scheme = yup.object({
    Nome: yup.string().required('Informe seu nome'),
    email: yup.string().email('Email Invalido').required('Informe seu Email'),
    senha: yup.string()
    .min(6, 'No minimo 6 digitos')
    .matches(/\d/,'Um numero pelo menos')
    .required('Informe sua Senha')
    
    
})


  const navigation = useNavigation();
  


  const {control, handleSubmit, formState: {errors} } = useForm({

      resolver: yupResolver(scheme)

      })

      const handlSignIn = (data) => {
      console.log(data);
      };

     
          const [icone, setIcone] = useState('eye-off');
        
          const handleClick = () => {
            if (icone === 'eye-off') {
              setIcone('eye');
            } else {
              setIcone('eye-off');
            }
          }
          
  return (

        
    <SafeAreaView style={{flex: 1}}>
         <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
            <View style={styles.bemvindo}>
                <Image source={require('../../assets/bv.png')}
                style={styles.bv}></Image>
            </View>
            <View style={styles.logo}>
                <Image
               source={require('../../assets/Vestetec-removebg-preview.png')}
                style={styles.image} 
                        />
                
            </View>
            <View style={styles.minicontainer}>
                <Text style={styles.texto}>
                <Foundation style={styles.alert} name="alert" size={24} color="black" /> APENAS E-MAIL INSTITUCIONAL 
                </Text>

                    {errors.Nome && <Text style={styles.error}>{errors.Nome?.message}</Text>}
                    
                <Controller
                        control={control}
                        name="Nome"
                        render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                            style={styles.input}
                            onChangeText={onChange} 
                            value={value}          
                            placeholder="     Nome"
                            onBlur={onBlur}        
                         />
                                 )}
                    />

                    
            
            <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    onChangeText={onChange}
                    value={value}
                    placeholder="     Email"
                    onBlur={onBlur} 
                    
                    />
                                )} 
                />
                {errors.email && <Text style={styles.error}>{errors.email?.message}</Text>}

                        
            <Controller
                control={control}
                name="senha"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                  <TouchableOpacity style={styles.icon}
                  onPress={handleClick}>
<Ionicons name={icone} size={34} color="black" />
</TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChange}
                        value={value}
                        placeholder="    Crie sua Senha"
                        onBlur={onBlur}
                        secureTextEntry={icone === 'eye-off'}
                       
                       
                        

                        />
                        </View>
                            )} 
                />
                {errors.senha && <Text style={styles.error}>{errors.senha?.message}</Text>}
                
           

                <TouchableOpacity style={styles.btn}
                 onPress={handleSubmit((data) => 
                {handlSignIn(data);
                navigation.navigate('Autenticacao'); 
                })}>
                    <LinearGradient
                    colors={["#740000", "#000000", ]}
                     style={styles.button}
                                        >         
                <Text style={styles.txtBtn}>CADASTRA-SE</Text>
                </LinearGradient>
            </TouchableOpacity>
            
                
            
            </View>

            <View style={styles.conta}>
                <Text style={styles.txtConta}>Ja possui uma conta?</Text>
                <TouchableOpacity style={styles.btnlogin} onPress={() => navigation.navigate('Autenticacao')}>
                <Text style={styles.txtlogin}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>

        </ScrollView>
    </SafeAreaView>

);
}

const styles= StyleSheet.create({
container: {
flexGrow: 1,
width: '100%',
height: '100%',
backgroundColor:  '#340000',
justifyContent: 'center',
alignItems: 'center',


},
bemvindo: {
alignItems: 'center',
justifyContent: 'center',




},
bv: {
height: 100,
width: 320,
zIndex: 4,
top: -30
},

minicontainer: {
backgroundColor: 'white',
width: 360,
height: 525,
zIndex: 1
},
image: {
width: 360,
zIndex: 2,
left: 7
},
logo: {
height: 61,
zIndex: 3
}, 
texto: {
marginTop: 120,
margin: 49,
fontWeight: 'bold'

},

alert: {
alignItems: 'center',


},

input: {
margin: 10,
backgroundColor: '#c7c7c7',
height: 40,
marginBottom: 14,
marginTop: 4,
borderWidth: 1,
borderRadius: 6,
borderColor: '#390000',
fontSize: 14,
paddingLeft: 15


}, 
btn: {
backgroundColor: 'black',
color: 'white',
width: 320,
height: 70,
left: 22,
marginTop: 24,
alignItems: 'center',
borderRadius: 10,


},
txtBtn: {
color: 'white',
fontSize: 22,
alignItems: 'center',
justifyContent: 'center',
flex: 1,
margin: 20,
fontWeight: 'bold'
},
button: {
width: 320,
height: 70,
alignItems: 'center',
borderRadius: 10,
},

error: {
color: '#ce2340',
alignSelf: 'flex-start',
marginBottom: 5,
left: 15,
fontSize: 14,
marginTop: -5
}, 

inputContainer: {

},
icon: {
position: 'absolute',
left: 300,
top: 7,
zIndex: 1
},

conta: {
alignItems: 'center',
justifyContent: 'center',
marginTop: 50
},

txtConta: {
color: 'white',
fontSize: 16,
fontWeight: 'bold',
},

btnlogin: {
backgroundColor: 'black',
width: 120,
height: 50,
margin: 10,
alignItems: 'center',
borderRadius: 18,
},

txtlogin: {
color: 'white',
fontSize: 18,
alignItems: 'center',
justifyContent: 'center',
flex: 1,
margin: 14,
fontWeight: 'bold'
}


});
