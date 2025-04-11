import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isNutricionista, setIsNutricionista] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => {
    return email.includes('@') && email.includes('.');
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      alert('Email inválido. Por favor, insira um email válido.');
      return;
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5036/api/Usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: "Usuário",
          email,
          senha: password,
          tipoUsuario: isNutricionista ? 'nutricionista' : 'cliente'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', errorText);
        alert('Erro ao cadastrar usuário: ' + response.status);
        return;
      }

      alert('Usuário cadastrado com sucesso!');
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsNutricionista(false);
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          senha: password,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro no login:', errorText);
        alert('Email ou senha incorretos.');
        return;
      }
  
      const usuario = await response.json();
  
      // Salva ID no localStorage ou qualquer outro estado/contexto
      window.localStorage.setItem('userId', usuario.usuarioId);
  
      // Redireciona com base no tipo
      if (usuario.tipoUsuario === 'Nutricionista') {
        router.push('/dashnutri');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      alert('Erro de conexão com o servidor.');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground style={styles.background}>
        <Image 
          source={{ uri: 'https://i.imgur.com/YC3XmHz.png' }}
          style={styles.logo}
        />
        <Text style={styles.welcomeText}>Bem-vindo ao Healthify!</Text>
        <Text style={styles.description}>Seu aplicativo para bem-estar e saúde.</Text>
      </ImageBackground>

      <View style={styles.formContainer}>
        <Text style={styles.loginTitle}>{isRegistering ? 'Crie sua conta' : 'Faça seu login'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isRegistering && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={isNutricionista}
                onValueChange={setIsNutricionista}
                color={isNutricionista ? '#097d4c' : undefined}
              />
              <Text style={styles.checkboxLabel}>Sou nutricionista</Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={isRegistering ? handleRegister : handleLogin}
        >
          <Text style={styles.buttonText}>{isRegistering ? 'Cadastrar' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.registerText}>
            {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f6eecf',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  background: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 400,
  },
  logo: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#097d4c',
    textAlign: 'center',
  },
  description: {
    fontSize: 20,
    color: '#097d4c',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 1,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
  },
  input: {
    width: '40%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#097d4c',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerText: {
    color: '#097d4c',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    color: '#097d4c',
  },
});
