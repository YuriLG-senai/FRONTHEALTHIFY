import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const options = {
  headerShown: false,
};

const ProgressoCliente = () => {
  const router = useRouter();
  const [pesoAtual, setPesoAtual] = useState('');
  const [pesoObjetivo, setPesoObjetivo] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [recomendacao, setRecomendacao] = useState(null);

  const calcularProgresso = () => {
    const pesoNum = parseFloat(pesoAtual);
    const objetivoNum = parseFloat(pesoObjetivo);

    if (isNaN(pesoNum) || isNaN(objetivoNum)) {
      setMensagem('Por favor, preencha os campos corretamente.');
      setRecomendacao(null);
      return;
    }

    const diferenca = Math.abs(pesoNum - objetivoNum);
    const objetivo = pesoNum > objetivoNum ? 'perder' : 'ganhar';

    setMensagem(
      `Você precisa ${objetivo} cerca de ${diferenca.toFixed(1)} kg para atingir sua meta. Continue firme! 💪`
    );

    if (objetivo === 'perder') {
      setRecomendacao([
        '🍎 Foque em alimentos naturais e ricos em fibras.',
        '🥗 Coma vegetais em todas as refeições.',
        '🚰 Beba bastante água ao longo do dia.',
        '🔥 Diminua o consumo de açúcar e alimentos processados.',
        '🏃‍♀️ Combine a dieta com exercícios aeróbicos e musculação leve.'
      ]);
    } else {
      setRecomendacao([
        '🍗 Aumente o consumo de proteínas (frango, ovos, leguminosas).',
        '🍚 Inclua carboidratos complexos (arroz integral, batata doce).',
        '🥜 Adicione gorduras boas (abacate, castanhas, azeite).',
        '📅 Faça refeições frequentes ao longo do dia.',
        '🏋️‍♂️ Combine com treinos de força para otimizar o ganho de massa.'
      ]);
    }
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

        <Text style={styles.titulo}>Acompanhe Seu Progresso</Text>

        <Text style={styles.label}>Peso Atual (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={pesoAtual}
          onChangeText={setPesoAtual}
          placeholder="Ex: 80"
        />

        <Text style={styles.label}>Peso Objetivo (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={pesoObjetivo}
          onChangeText={setPesoObjetivo}
          placeholder="Ex: 70"
        />

        <TouchableOpacity style={styles.botao} onPress={calcularProgresso}>
          <Text style={styles.textoBotao}>Calcular Progresso</Text>
        </TouchableOpacity>

        {mensagem && (
          <View style={styles.resultadoBox}>
            <Text style={styles.resultadoTexto}>{mensagem}</Text>
            {recomendacao && (
              <View style={styles.dicasBox}>
                <Text style={styles.dicasTitulo}>Recomendações de Dieta:</Text>
                {recomendacao.map((dica, index) => (
                  <Text key={index} style={styles.dicaItem}>• {dica}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f6eecf',
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  botao: {
    backgroundColor: '#097d4c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultadoBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#097d4c',
  },
  resultadoTexto: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  dicasBox: {
    marginTop: 15,
  },
  dicasTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#097d4c',
  },
  dicaItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default ProgressoCliente;