import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const options = {
  headerShown: false,
};

export default function Questionario() {
  const router = useRouter();
  const [respostas, setRespostas] = useState({});
  const [pageIndex, setPageIndex] = useState(0);  // Controla a página atual das perguntas
  const [visibleQuestions, setVisibleQuestions] = useState([0, 1]);  // Controla quais perguntas são visíveis
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Animação para fade in

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

  // Função para responder às perguntas
  const responder = (perguntaId, opcao) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: opcao,
    }));
  };

  // Função para avançar para as próximas perguntas
  const avancarPerguntas = () => {
    // Incrementar o índice de página e adicionar 2 novas perguntas visíveis
    if (pageIndex + 2 < perguntas.length) {
      setPageIndex(pageIndex + 2);
      setVisibleQuestions([pageIndex + 2, pageIndex + 3]);
      
      // Animar o fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  // Função para enviar as respostas
  const enviarRespostas = () => {
    console.log('Respostas enviadas:', respostas);
    Alert.alert('Obrigado!', 'Suas respostas foram enviadas com sucesso.');
  };

  useEffect(() => {
    // Inicializa o fade-in ao carregar as perguntas
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botão Voltar para Dashboard */}
      <TouchableOpacity style={styles.dashboardButton} onPress={() => router.push('/dashboard')}>
        <Ionicons name="home" size={30} color="#097d4c" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Questionário de Rotina</Text>

      {/* Exibe as perguntas com animação de fade-in */}
      {visibleQuestions.map((index) => {
        const pergunta = perguntas[index];
        if (!pergunta) return null; // Verifica se a pergunta existe antes de renderizar
        return (
          <Animated.View key={pergunta.id} style={{ opacity: fadeAnim }}>
            <View style={styles.blocoPergunta}>
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
          </Animated.View>
        );
      })}

      {/* Condicionalmente exibe o botão "Próximo" ou "Enviar" */}
      <TouchableOpacity
        style={styles.botaoEnviar}
        onPress={pageIndex + 2 < perguntas.length ? avancarPerguntas : enviarRespostas}
      >
        <Text style={styles.botaoTexto}>
          {pageIndex + 2 < perguntas.length ? 'Próximo' : 'Enviar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dashboardButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: 'transparent',
    padding: 10,
    zIndex: 100,
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f6eecf',  // Cor de fundo bege
    alignItems: 'center',
    flexGrow: 1,  // Garante que a página ocupe toda a altura da tela
    position: 'relative',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 30,
    textAlign: 'center',
  },
  blocoPergunta: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',  // Fundo branco para as perguntas
    borderRadius: 15,  // Borda arredondada
    shadowColor: '#000',  // Sombra para dar um efeito de elevação
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pergunta: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#097d4c',
  },
  opcoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  opcaoBotao: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#097d4c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 15,
    flexBasis: '45%',  // Ajusta o tamanho dos botões
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 30,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
