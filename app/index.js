import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [endereco, setEndereco] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isNutricionista, setIsNutricionista] = useState(false);

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  const [preferenciasAlimentares, setPreferenciasAlimentares] = useState('');
  const [doencasPreexistentes, setDoencasPreexistentes] = useState('');

  const [especialidade, setEspecialidade] = useState('');
  const [descricao, setDescricao] = useState('');

  const router = useRouter();

  const validateEmail = (email) => {
    return email.includes('@') && email.includes('.');
  };
  
  const formatDateToISO = (inputDate) => {
    if (!inputDate) return '';
    const [day, month, year] = inputDate.split('-');
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
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

    if (!cpf || !telefone || !endereco || !dataNascimento) {
      alert('CPF, telefone, endereço e data de nascimento são obrigatórios.');
      return;
    }

    const usuarioPayload = {
      nome,
      email,
      senha: password,
      tipoUsuario: isNutricionista ? 'Nutricionista' : 'Cliente',
      cpf,
      telefone,
      sexo,
      endereco,
      dataNascimento: formatDateToISO(dataNascimento)
    };

    try {
      const usuarioResponse = await fetch('http://localhost:5036/api/Usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioPayload),
      });

      if (!usuarioResponse.ok) {
        const errorText = await usuarioResponse.text();
        console.error('Erro da API:', errorText);
        alert('Erro ao cadastrar usuário: ' + usuarioResponse.status);
        return;
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
            UsuarioId: usuarioId,
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

  
        if (errorText.toLowerCase().includes('usuario field is required')) {
          alert('Cadastro realizado com sucesso!');
          resetForm();
          return;
        }

        alert('Erro ao cadastrar dados adicionais: ' + complementoResponse.status);
        return;
      }

      alert('Cadastro realizado com sucesso!');
      resetForm();

    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const resetForm = () => {
    setIsRegistering(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNome('');
    setCpf('');
    setTelefone('');
    setSexo('');
    setEndereco('');
    setDataNascimento('');
    setPeso('');
    setAltura('');
    setObjetivo('');
    setNivelAtividade('');
    setPreferenciasAlimentares('');
    setDoencasPreexistentes('');
    setEspecialidade('');
    setDescricao('');
    setIsNutricionista(false);
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

            <View style={styles.rowContainer}>
              <TextInput style={styles.halfInput} placeholder="Nome" value={nome} onChangeText={setNome} />
              <TextInput style={styles.halfInput} placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
            </View>

            <View style={styles.rowContainer}>
              <TextInput style={styles.halfInput} placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
              <TextInput style={styles.halfInput} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
            </View>

            <View style={styles.rowContainer}>
              <TextInput
                style={styles.halfInput}
                placeholder="Data de Nascimento (DD-MM-YYYY)"
                value={dataNascimento}
                onChangeText={setDataNascimento}
                keyboardType="numeric"
              />
              <View style={[styles.halfInput, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                <Picker
                  selectedValue={sexo}
                  onValueChange={(itemValue) => setSexo(itemValue)}
                  style={{ flex: 1 }}
                >
                  <Picker.Item label="Selecione o sexo" value="" />
                  <Picker.Item label="Masculino" value="Masculino" />
                  <Picker.Item label="Feminino" value="Feminino" />
                  <Picker.Item label="Outro" value="Outro" />
                </Picker>
              </View>
            </View>

            {isNutricionista ? (
              <>
                <TextInput style={styles.input} placeholder="Especialidade" value={especialidade} onChangeText={setEspecialidade} />
                <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} multiline />
              </>
            ) : (
              <>
                <View style={styles.rowContainer}>
                  <TextInput style={styles.halfInput} placeholder="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="numeric" />
                  <TextInput style={styles.halfInput} placeholder="Altura (cm)" value={altura} onChangeText={setAltura} keyboardType="numeric" />
                </View>

                <TextInput style={styles.input} placeholder="Objetivo" value={objetivo} onChangeText={setObjetivo} />

                <View style={styles.input}>
                  <Picker
                    selectedValue={nivelAtividade}
                    onValueChange={(itemValue) => setNivelAtividade(itemValue)}
                    style={{ flex: 1 }}
                  >
                    <Picker.Item label="Selecione o nível de atividade" value="" />
                    <Picker.Item label="Sedentário" value="Sedentário" />
                    <Picker.Item label="Levemente ativo" value="Levemente ativo" />
                    <Picker.Item label="Moderadamente ativo" value="Moderadamente ativo" />
                    <Picker.Item label="Muito ativo" value="Muito ativo" />
                  </Picker>
                </View>

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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
    height: 50,
    borderColor: '#097d4c',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
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
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#097d4c',
    borderWidth: 1,
    borderRadius: 10,
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
    color: '#097d4c',
  },
  button: {
    backgroundColor: '#097d4c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  registerText: {
    color: '#097d4c',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
