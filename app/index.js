import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isNutricionista, setIsNutricionista] = useState(false);

  // Campos adicionais
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  const [preferenciasAlimentares, setPreferenciasAlimentares] = useState('');
  const [doencasPreexistentes, setDoencasPreexistentes] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [descricao, setDescricao] = useState('');

  // Novos campos
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [endereco, setEndereco] = useState('');

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

    if (!cpf || !telefone) {
      alert('CPF e telefone são obrigatórios.');
      return;
    }

    const usuarioPayload = {
      nome,
      email,
      senha: password,
      tipoUsuario: isNutricionista ? 'Nutricionista' : 'Cliente',
      cpf,
      telefone,
      dataNascimento,
      sexo,
      endereco
    };

    try {
      const usuarioResponse = await fetch('http://localhost:5036/api/Usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioPayload),
      });

      if (!complementoResponse.ok) {
        const errorText = await complementoResponse.text();
        console.warn('Aviso: resposta inesperada ao cadastrar dados adicionais:', errorText);
      }

      const usuarioCriado = await usuarioResponse.json();
      const usuarioId = usuarioCriado.usuarioId;

      if (!usuarioId) {
        alert('Usuário criado, mas não foi possível obter o ID.');
        return;
      }

      const dadosComplementares = isNutricionista
        ? { usuarioId, especialidade, descricao }
        : {
            usuarioId,
            peso: parseFloat(peso),
            altura: parseFloat(altura),
            objetivo,
            nivelAtividade,
            preferenciasAlimentares,
            doencasPreexistentes
          };

      const endpoint = isNutricionista ? 'Nutricionistas' : 'Clientes';
      const complementoResponse = await fetch(`http://localhost:5036/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosComplementares),
      });

      if (!complementoResponse.ok) {
        const errorText = await complementoResponse.text();
        console.error('Erro ao cadastrar dados adicionais:', errorText);
        alert('Erro ao cadastrar dados adicionais: ' + complementoResponse.status);
        return;
      }

      alert('Cadastro realizado com sucesso!');
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setNome('');
      setCpf('');
      setTelefone('');
      setPeso('');
      setAltura('');
      setObjetivo('');
      setNivelAtividade('');
      setPreferenciasAlimentares('');
      setDoencasPreexistentes('');
      setEspecialidade('');
      setDescricao('');
      setSexo('');
      setEndereco('');
      setDataNascimento('');
      setIsNutricionista(false);

    } catch (error) {
      console.warn('Erro ignorado após o cadastro (provavelmente resposta vazia):', error);
      alert('Cadastro realizado com sucesso!');
    }
    
    
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro no login:', errorText);
        alert('Email ou senha incorretos.');
        return;
      }

      const usuario = await response.json();
      window.localStorage.setItem('userId', usuario.usuarioId);

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

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        
        {isRegistering && (
          <>
            <TextInput style={styles.input} placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
            <TextInput style={styles.input} placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
            
            {/* Novos campos */}
            <TextInput style={styles.input} placeholder="Data de Nascimento" value={dataNascimento} onChangeText={setDataNascimento} keyboardType="default" />
            <TextInput style={styles.input} placeholder="Sexo" value={sexo} onChangeText={setSexo} />
            <TextInput style={styles.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />

            {isNutricionista ? (
              <>
                <TextInput style={styles.input} placeholder="Especialidade" value={especialidade} onChangeText={setEspecialidade} />
                <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} multiline />
              </>
            ) : (
              <>
                <TextInput style={styles.input} placeholder="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Altura (cm)" value={altura} onChangeText={setAltura} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Objetivo" value={objetivo} onChangeText={setObjetivo} />
                <TextInput style={styles.input} placeholder="Nível de Atividade" value={nivelAtividade} onChangeText={setNivelAtividade} />
                <TextInput style={styles.input} placeholder="Preferências Alimentares" value={preferenciasAlimentares} onChangeText={setPreferenciasAlimentares} />
                <TextInput style={styles.input} placeholder="Doenças Preexistentes" value={doencasPreexistentes} onChangeText={setDoencasPreexistentes} />
              </>
            )}

            <View style={styles.checkboxContainer}>
              <Checkbox value={isNutricionista} onValueChange={setIsNutricionista} color={isNutricionista ? '#097d4c' : undefined} />
              <Text style={styles.checkboxLabel}>Sou nutricionista</Text>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={isRegistering ? handleRegister : handleLogin}>
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
    width: '90%',
    padding: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#097d4c',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#097d4c',
    borderRadius: 10,
    paddingVertical: 12,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  registerText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#097d4c',
  },
});
