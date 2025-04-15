import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const ProgressoCliente = () => {
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
      setRecomendacao(
        [
          '🍎 Foque em alimentos naturais e ricos em fibras.',
          '🥗 Coma vegetais em todas as refeições.',
          '🚰 Beba bastante água ao longo do dia.',
          '🔥 Diminua o consumo de açúcar e alimentos processados.',
          '🏃‍♀️ Combine a dieta com exercícios aeróbicos e musculação leve.'
        ]
      );
    } else {
      setRecomendacao(
        [
          '🍗 Aumente o consumo de proteínas (frango, ovos, leguminosas).',
          '🍚 Inclua carboidratos complexos (arroz integral, batata doce).',
          '🥜 Adicione gorduras boas (abacate, castanhas, azeite).',
          '📅 Faça refeições frequentes ao longo do dia.',
          '🏋️‍♂️ Combine com treinos de força para otimizar o ganho de massa.'
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6eecf',
    padding: 20,
    justifyContent: 'center',
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
    elevation: 3,
  },
  resultadoTexto: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  dicasBox: {
    marginTop: 10,
  },
  dicasTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  dicaItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
});

export default ProgressoCliente;
