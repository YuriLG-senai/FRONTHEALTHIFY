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
  const [pageIndex, setPageIndex] = useState(0);  
  const [visibleQuestions, setVisibleQuestions] = useState([0, 1]);  
  const fadeAnim = useRef(new Animated.Value(0)).current;  

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


  const responder = (perguntaId, opcao) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: opcao,
    }));
  };


  const avancarPerguntas = () => {

    if (pageIndex + 2 < perguntas.length) {
      setPageIndex(pageIndex + 2);
      setVisibleQuestions([pageIndex + 2, pageIndex + 3]);
      

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const enviarRespostas = () => {
    console.log('Respostas enviadas:', respostas);
    Alert.alert('Obrigado!', 'Suas respostas foram enviadas com sucesso.');
  };

  useEffect(() => {

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
        if (!pergunta) return null; 
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
    backgroundColor: '#f6eecf',  
    alignItems: 'center',
    flexGrow: 1,  
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
    backgroundColor: '#fff', 
    borderRadius: 15,  
    shadowColor: '#000',  
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
    flexBasis: '45%', 
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
