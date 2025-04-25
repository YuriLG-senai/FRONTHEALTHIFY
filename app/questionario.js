import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const options = {
  headerShown: false,
};
export default function Questionario() {
  const router = useRouter(); 
  const [respostas, setRespostas] = useState({});

  const perguntas = [
    {
      id: 'cafeDaManha',
      texto: 'Você costuma tomar café da manhã?',
      opcoes: ['Sim', 'Às vezes', 'Não'],
    },
    {
      id: 'refeicoesPorDia',
      texto: 'Quantas refeições você faz por dia?',
      opcoes: ['2 ou menos', '3 a 4', '5 ou mais'],
    },
    {
      id: 'consumoAgua',
      texto: 'Quantos litros de água você bebe por dia?',
      opcoes: ['Menos de 1L', '1 a 2L', 'Mais de 2L'],
    },
    {
      id: 'alimentosIndustrializados',
      texto: 'Você consome alimentos industrializados com frequência?',
      opcoes: ['Sim', 'Raramente', 'Não'],
    },
    {
      id: 'frutasVerduras',
      texto: 'Você come frutas e verduras todos os dias?',
      opcoes: ['Sim', 'Às vezes', 'Não'],
    },
    {
      id: 'atividadeFisica',
      texto: 'Você pratica atividades físicas regularmente?',
      opcoes: ['Sim, mais de 3 vezes por semana', 'Sim, 1 a 2 vezes por semana', 'Não, quase nunca'],
    },
    {
      id: 'horasDeSono',
      texto: 'Quantas horas de sono você tem por noite, em média?',
      opcoes: ['Menos de 6 horas', '6 a 8 horas', 'Mais de 8 horas'],
    },
    {
      id: 'nivelDeEstresse',
      texto: 'Como você avaliaria seu nível de estresse atualmente?',
      opcoes: ['Baixo', 'Moderado', 'Alto'],
    },
    {
      id: 'trabalhoEmCasa',
      texto: 'Você trabalha em casa ou em home office?',
      opcoes: ['Sim', 'Não'],
    },
    {
      id: 'tempoDeTela',
      texto: 'Quanto tempo você passa em frente a telas (computador, celular, TV) por dia?',
      opcoes: ['Menos de 2 horas', '2 a 4 horas', 'Mais de 4 horas'],
    },
    {
      id: 'descanso',
      texto: 'Você tem momentos de descanso durante o seu dia?',
      opcoes: ['Sim, sempre', 'Às vezes', 'Não'],
    },
  ];
  
  const handleGoToDashboard = () => {
    router.push('/dashboard'); // Navega para a dashboard
  };
  const responder = (perguntaId, opcao) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: opcao,
    }));
  };

  const enviarRespostas = () => {
    console.log('Respostas enviadas:', respostas);
    Alert.alert('Obrigado!', 'Suas respostas foram enviadas com sucesso.');
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
    {/* Botão Voltar para Dashboard */}
    <TouchableOpacity 
      style={styles.dashboardButton} 
      onPress={handleGoToDashboard}
    >
      <Ionicons name="home" size={30} color="#097d4c" style={{ marginLeft: 75 }} />
      <Text style={styles.dashboardButtonText}>Voltar para Dashboard</Text>
    </TouchableOpacity>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Questionário de Rotina</Text>

      {perguntas.map((pergunta) => (
        <View key={pergunta.id} style={styles.blocoPergunta}>
          <Text style={styles.pergunta}>{pergunta.texto}</Text>
          <View style={styles.opcoesContainer}>
            {pergunta.opcoes.map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={[
                  styles.opcaoBotao,
                  respostas[pergunta.id] === opcao && styles.opcaoSelecionada,
                ]}
                onPress={() => responder(pergunta.id, opcao)}
              >
                <Text
                  style={[
                    styles.opcaoTexto,
                    respostas[pergunta.id] === opcao && styles.opcaoTextoSelecionado,
                  ]}
                >
                  {opcao}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.botaoEnviar} onPress={enviarRespostas}>
        <Text style={styles.botaoTexto}>Enviar</Text>
      </TouchableOpacity>
    </ScrollView>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  dashboardButtonText: {
    color: '#097d4c',       // Cor verde do Healthify
    fontSize: 16,           // Tamanho médio
    fontWeight: '600',      // Semi-bold
    marginLeft: 8,          // Espaço entre ícone e texto
    fontFamily: 'Arial',   // Fonte clean (certifique-se de carregar a fonte)
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f6eecf',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
    textAlign: 'center',
  },
  blocoPergunta: {
    width: '100%',
    marginBottom: 20,
  },
  pergunta: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#097d4c',
  },
  opcoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  opcaoBotao: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#097d4c',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  opcaoSelecionada: {
    backgroundColor: '#097d4c',
  },
  opcaoTexto: {
    color: '#097d4c',
    fontWeight: '500',
  },
  opcaoTextoSelecionado: {
    color: '#fff',
  },
  botaoEnviar: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 30,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
