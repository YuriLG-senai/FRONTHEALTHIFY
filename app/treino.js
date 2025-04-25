import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const options = {
  headerShown: false,
};

const Treino = () => {
  const router = useRouter();
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [recomendacao, setRecomendacao] = useState(null);

  const calcularTreino = () => {
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (isNaN(pesoNum) || isNaN(alturaNum)) {
      setRecomendacao({
        titulo: 'Atenção!',
        dicas: ['Por favor, insira valores válidos para peso e altura.']
      });
      return;
    }

    if (pesoNum > 100 && alturaNum < 1.9) {
      setRecomendacao({
        titulo: 'Recomendação: Emagrecimento',
        dicas: [
          'Priorize treinos cardiorrespiratórios como caminhada, corrida leve ou bicicleta.',
          'Inclua exercícios funcionais e de alta intensidade (HIIT).',
          'Evite dietas restritivas sem acompanhamento nutricional.',
          'Mantenha uma boa hidratação e procure dormir bem.'
        ]
      });
    } else if (pesoNum < 60 && alturaNum > 1.6) {
      setRecomendacao({
        titulo: 'Recomendação: Ganho de Massa',
        dicas: [
          'Foque em treinos de musculação com cargas progressivas.',
          'Aumente a ingestão de proteínas e calorias de qualidade.',
          'Treine ao menos 3x por semana com foco em grandes grupos musculares.',
          'Evite excesso de cardio que possa comprometer o ganho calórico.'
        ]
      });
    } else {
      setRecomendacao({
        titulo: 'Recomendação: Manutenção e Condicionamento',
        dicas: [
          'Intercale treinos de força e resistência com aeróbicos leves.',
          'Busque constância com treinos 3 a 5 vezes por semana.',
          'Alimente-se de forma equilibrada e variada.',
          'Inclua alongamentos e mobilidade para prevenir lesões.'
        ]
      });
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

        <Text style={styles.titulo}>Planejamento de Treino</Text>

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={peso}
          onChangeText={setPeso}
          placeholder="Ex: 85"
        />

        <Text style={styles.label}>Altura (m)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
          placeholder="Ex: 1.75"
        />

        <TouchableOpacity style={styles.botao} onPress={calcularTreino}>
          <Text style={styles.textoBotao}>Ver Recomendação</Text>
        </TouchableOpacity>

        {recomendacao && (
          <View style={styles.recomendacaoBox}>
            <Text style={styles.recomendacaoTitulo}>{recomendacao.titulo}</Text>
            {recomendacao.dicas.map((dica, index) => (
              <Text key={index} style={styles.recomendacaoTexto}>• {dica}</Text>
            ))}
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
    textAlign: 'center',
    marginBottom: 30,
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
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
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
    fontWeight: '600',
    fontSize: 16,
  },
  recomendacaoBox: {
    marginTop: 30,
    backgroundColor: '#ffffffcc',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#097d4c',
  },
  recomendacaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  recomendacaoTexto: {
    fontSize: 15,
    color: '#444',
    marginBottom: 5,
    lineHeight: 22,
  },
});

export default Treino;