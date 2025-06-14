import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const options = {
  headerShown: false,
};

const Hidratacao = () => {
  const router = useRouter();
  const [inputAgua, setInputAgua] = useState('');
  const [totalAgua, setTotalAgua] = useState(0);

  const metaDiaria = 2000; // em ml

  const registrarAgua = () => {
    const quantidade = parseInt(inputAgua);
    if (isNaN(quantidade) || quantidade <= 0) {
      alert('Por favor, insira uma quantidade válida em ml.');
      return;
    }
    setTotalAgua(prev => prev + quantidade);
    setInputAgua('');
  };

  const progresso = Math.min((totalAgua / metaDiaria) * 100, 100).toFixed(0);

  const gerarMensagem = () => {
    if (totalAgua === 0) return 'Comece a beber água!';
    if (totalAgua < 1000) return 'Continue! Seu corpo agradece.';
    if (totalAgua < metaDiaria) return 'Quase lá! Mantenha o ritmo.';
    return 'Parabéns! Meta de hidratação alcançada!';
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Botão Voltar para Dashboard */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/dashboard')}
        >
          <Ionicons name="arrow-back" size={24} color="#097d4c" />
          <Text style={styles.backButtonText}>Voltar para Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Rastreamento de Hidratação</Text>

        <Text style={styles.label}>Quantidade de água ingerida (ml)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputAgua}
          onChangeText={setInputAgua}
          placeholder="Ex: 250"
        />

        <TouchableOpacity style={styles.botao} onPress={registrarAgua}>
          <Text style={styles.textoBotao}>Registrar</Text>
        </TouchableOpacity>

        <View style={styles.recomendacaoBox}>
          <Text style={styles.recomendacaoTitulo}>Progresso Diário</Text>
          <Text style={styles.recomendacaoTexto}>
            Total ingerido: {totalAgua} ml de {metaDiaria} ml ({progresso}%)
          </Text>
          <Text style={styles.recomendacaoTexto}>
            {gerarMensagem()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#e0f7fa',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#097d4c',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#00796b',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#004d40',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  botao: {
    backgroundColor: '#00796b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  recomendacaoBox: {
    marginTop: 30,
    backgroundColor: '#ffffffcc',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00796b',
  },
  recomendacaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d40',
    marginBottom: 10,
    textAlign: 'center',
  },
  recomendacaoTexto: {
    fontSize: 15,
    color: '#004d40',
    marginBottom: 5,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default Hidratacao;
