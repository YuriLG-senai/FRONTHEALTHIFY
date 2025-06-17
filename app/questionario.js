import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
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

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [pageIndex]);
  const [showResumo, setShowResumo] = useState(false);

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

  // Função que retorna sugestões baseadas na resposta de cada pergunta
  const obterSugestao = (id, resposta) => {
    switch (id) {
      case 'cafeDaManha':
        if (resposta === 'Não') return 'Tente incluir um café da manhã para melhorar seu metabolismo.';
        if (resposta === 'Às vezes') return 'Procure tomar café da manhã com mais regularidade.';
        return 'Ótimo que você toma café da manhã!';
      case 'refeicoesPorDia':
        if (resposta === '2 ou menos') return 'Considere aumentar o número de refeições para manter energia.';
        if (resposta === '5 ou mais') return 'Cuidado para não exagerar nas refeições.';
        return 'Quantidade ideal de refeições.';
      case 'consumoAgua':
        if (resposta === 'Menos de 1L') return 'Beba mais água para se manter hidratado.';
        if (resposta === '1 a 2L') return 'Boa hidratação, continue assim!';
        return 'Excelente consumo de água!';
      case 'alimentosIndustrializados':
        if (resposta === 'Sim') return 'Reduza o consumo de alimentos industrializados.';
        if (resposta === 'Raramente') return 'Continue evitando alimentos industrializados.';
        return 'Parabéns por não consumir alimentos industrializados!';
      case 'frutasVerduras':
        if (resposta === 'Não') return 'Inclua frutas e verduras na sua dieta diária.';
        if (resposta === 'Às vezes') return 'Tente aumentar o consumo de frutas e verduras.';
        return 'Ótimo consumo de frutas e verduras!';
      case 'atividadeFisica':
        if (resposta === 'Não, quase nunca') return 'Pratique atividades físicas para melhorar sua saúde.';
        if (resposta === 'Sim, 1 a 2 vezes por semana') return 'Tente aumentar a frequência da atividade física.';
        return 'Parabéns pela sua rotina ativa!';
      case 'horasDeSono':
        if (resposta === 'Menos de 6 horas') return 'Durma mais para melhorar seu descanso.';
        if (resposta === 'Mais de 8 horas') return 'Cuidado para não dormir demais.';
        return 'Boa quantidade de sono.';
      case 'nivelDeEstresse':
        if (resposta === 'Alto') return 'Busque técnicas de relaxamento para reduzir o estresse.';
        if (resposta === 'Moderado') return 'Fique atento ao seu nível de estresse.';
        return 'Ótimo que seu estresse está baixo.';
      case 'trabalhoEmCasa':
        if (resposta === 'Sim') return 'Mantenha uma boa postura e faça pausas frequentes.';
        return 'Ótimo que você não trabalha em casa.';
      case 'tempoDeTela':
        if (resposta === 'Mais de 4 horas') return 'Tente diminuir o tempo de tela para descansar os olhos.';
        if (resposta === '2 a 4 horas') return 'Tempo de tela razoável, cuide para não exagerar.';
        return 'Ótimo tempo de tela curto!';
      case 'descanso':
        if (resposta === 'Não') return 'Reserve momentos para descansar durante o dia.';
        if (resposta === 'Às vezes') return 'Tente aumentar os momentos de descanso.';
        return 'Muito bom que você descansa regularmente.';
      default:
        return '';
    }
  };

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

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const abrirResumo = () => {
    // Só abre se todas as perguntas estiverem respondidas
    if (Object.keys(respostas).length < perguntas.length) {
      Alert.alert('Atenção', 'Por favor, responda todas as perguntas antes de ver o resumo.');
      return;
    }
    setShowResumo(true);
  };

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

      {/* Botão "Próximo" ou "Ver seu resumo" */}
      <TouchableOpacity
        style={styles.botaoEnviar}
        onPress={pageIndex + 2 < perguntas.length ? avancarPerguntas : abrirResumo}
      >
        <Text style={styles.botaoTexto}>
          {pageIndex + 2 < perguntas.length ? 'Próximo' : 'Ver seu resumo'}
        </Text>
      </TouchableOpacity>

      {/* Modal para o resumo */}
      <Modal
        visible={showResumo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResumo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Seu Resumo</Text>
            <ScrollView style={{ maxHeight: 400, marginBottom: 20 }}>
              {perguntas.map(({ id, texto }) => (
                <View key={id} style={{ marginBottom: 15 }}>
                  <Text style={styles.pergunta}>{texto}</Text>
                  <Text style={{ fontWeight: '600', marginBottom: 5 }}>
                    Resposta: {respostas[id]}
                  </Text>
                  <Text style={{ fontStyle: 'italic', color: '#555' }}>
                    {obterSugestao(id, respostas[id])}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Pressable style={styles.botaoFechar} onPress={() => setShowResumo(false)}>
              <Text style={styles.botaoTexto}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
    textAlign: 'center',
  },
  botaoFechar: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
