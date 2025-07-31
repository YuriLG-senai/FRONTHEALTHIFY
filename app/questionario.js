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
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const options = {
  headerShown: false,
};

const perguntas = [
    { dbId: 1, localId: 'cafeDaManha', texto: 'Você costuma tomar café da manhã?', opcoes: ['Sim', 'Às vezes', 'Não'] },
    { dbId: 2, localId: 'refeicoesPorDia', texto: 'Quantas refeições você faz por dia?', opcoes: ['2 ou menos', '3 a 4', '5 ou mais'] },
    { dbId: 3, localId: 'consumoAgua', texto: 'Quantos litros de água você bebe por dia?', opcoes: ['Menos de 1L', '1 a 2L', 'Mais de 2L'] },
    { dbId: 4, localId: 'alimentosIndustrializados', texto: 'Você consome alimentos industrializados com frequência?', opcoes: ['Sim', 'Raramente', 'Não'] },
    { dbId: 5, localId: 'frutasVerduras', texto: 'Você come frutas e verduras todos os dias?', opcoes: ['Sim', 'Às vezes', 'Não'] },
    { dbId: 6, localId: 'atividadeFisica', texto: 'Você pratica atividades físicas regularmente?', opcoes: ['Sim, mais de 3 vezes por semana', 'Sim, 1 a 2 vezes por semana', 'Não, quase nunca'] },
    { dbId: 7, localId: 'horasDeSono', texto: 'Quantas horas de sono você tem por noite, em média?', opcoes: ['Menos de 6 horas', '6 a 8 horas', 'Mais de 8 horas'] },
    { dbId: 8, localId: 'nivelDeEstresse', texto: 'Como você avaliaria seu nível de estresse atualmente?', opcoes: ['Baixo', 'Moderado', 'Alto'] },
    { dbId: 9, localId: 'trabalhoEmCasa', texto: 'Você trabalha em casa ou em home office?', opcoes: ['Sim', 'Não'] },
    { dbId: 10, localId: 'tempoDeTela', texto: 'Quanto tempo você passa em frente a telas por dia?', opcoes: ['Menos de 2 horas', '2 a 4 horas', 'Mais de 4 horas'] },
    { dbId: 11, localId: 'descanso', texto: 'Você tem momentos de descanso durante o seu dia? 🌿', opcoes: ['Sim, sempre', 'Às vezes', 'Não'] },
];

export default function Questionario() {
  const router = useRouter();
  const [respostas, setRespostas] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showResumo, setShowResumo] = useState(false);
  const [clienteId, setClienteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert("Erro", "Você não está autenticado. Por favor, faça o login novamente.");
          router.push('/login');
          return;
        }
        const response = await fetch('http://localhost:5036/api/Usuarios/perfil', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Não foi possível buscar os dados do perfil.');
        const data = await response.json();
        if (data.cliente?.clienteId) {
          setClienteId(data.cliente.clienteId);
        } else if (data.tipoUsuario === 'Cliente' && data.usuarioId) {
          const clienteResponse = await fetch(`http://localhost:5036/api/Usuarios/Clientes/usuario/${data.usuarioId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!clienteResponse.ok) throw new Error('Não foi possível encontrar os dados do cliente.');
          const clienteData = await clienteResponse.json();
          setClienteId(clienteData.clienteId);
        } else {
          throw new Error('ID do cliente não encontrado no perfil.');
        }
      } catch (error) {
        console.error("Erro ao buscar ID do cliente:", error);
        Alert.alert("Erro de Conexão", "Não foi possível carregar seus dados. Tente novamente.");
      }
    };
    fetchClienteData();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [pageIndex]);

  const obterSugestao = (localId, resposta) => {
    // A lógica de sugestões permanece a mesma
    return "Sugestão para esta resposta.";
  };

  const responder = (localId, opcao) => {
    setRespostas((prev) => ({ ...prev, [localId]: opcao }));
  };

  const verificarRespostasAtuais = () => {
    const perguntasAtuaisIds = perguntas.slice(pageIndex, pageIndex + 2).map(p => p.localId);
    return perguntasAtuaisIds.filter(id => !respostas[id]);
  };

  const avancarPerguntas = () => {
    const naoRespondidas = verificarRespostasAtuais();
    if (naoRespondidas.length > 0) {
      const nomesPerguntas = naoRespondidas.map(id => {
        const pergunta = perguntas.find(p => p.localId === id);
        return `"${pergunta.texto.split('?')[0]}?"`;
      }).join('\n- ');
      Alert.alert('Atenção', `Por favor, responda as seguintes perguntas:\n- ${nomesPerguntas}`);
      return;
    }
    if (pageIndex + 2 < perguntas.length) {
      setPageIndex(pageIndex + 2);
    }
  };

  const voltarPerguntas = () => {
    if (pageIndex - 2 >= 0) {
      setPageIndex(pageIndex - 2);
    }
  };

  const enviarRespostas = async () => {
    if (!clienteId) {
      Alert.alert("Erro", "Não foi possível identificar o cliente. Tente fazer login novamente.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = Object.keys(respostas).map(localId => {
        const pergunta = perguntas.find(p => p.localId === localId);
        return {
          ClienteId: clienteId,
          PerguntaId: pergunta.dbId,
          RespostaTexto: respostas[localId],
          DataResposta: new Date().toISOString(),
        };
      });
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:5036/api/Clientes/respostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar respostas: ${errorText}`);
      }
      setShowResumo(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro no Envio", "Não foi possível salvar suas respostas. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizarQuestionario = () => {
    const todasPerguntasNaoRespondidas = perguntas.filter(p => !respostas[p.localId]);
    if (todasPerguntasNaoRespondidas.length > 0) {
      const nomesPerguntas = todasPerguntasNaoRespondidas.map(p => `"${p.texto.split('?')[0]}?"`).join('\n- ');
      Alert.alert('Atenção', `Por favor, responda todas as perguntas antes de finalizar. Faltam:\n- ${nomesPerguntas}`);
      return;
    }
    enviarRespostas();
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.backgroundIconContainer}>
        <Ionicons name="leaf-outline" size={500} color="rgba(9, 125, 76, 0.05)" />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/dashboard')}>
          <Ionicons name="arrow-back" size={24} color="#097d4c" />
          <Text style={styles.backText}>Voltar ao Painel</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Questionário de Rotina</Text>
        <Text style={styles.subtitulo}>Responda com sinceridade para criarmos o melhor plano para você.</Text>

        {perguntas.slice(pageIndex, pageIndex + 2).map((pergunta) => (
          <Animated.View key={pergunta.localId} style={[styles.blocoPergunta, { opacity: fadeAnim }]}>
            <View style={styles.perguntaHeader}>
              <Ionicons name="help-circle-outline" size={24} color="#097d4c" />
              <Text style={styles.pergunta}>{pergunta.texto}</Text>
            </View>
            <View style={styles.opcoesContainer}>
              {pergunta.opcoes.map((opcao) => (
                <TouchableOpacity
                  key={opcao}
                  style={[
                    styles.opcaoBotao,
                    respostas[pergunta.localId] === opcao && styles.opcaoSelecionada,
                  ]}
                  onPress={() => responder(pergunta.localId, opcao)}
                >
                  <Text style={[
                    styles.opcaoTexto,
                    respostas[pergunta.localId] === opcao && styles.opcaoTextoSelecionado,
                  ]}>
                    {opcao}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ))}

        <View style={styles.navigationButtonsContainer}>
          {pageIndex > 0 && (
            <TouchableOpacity style={styles.botaoNavegacao} onPress={voltarPerguntas}>
              <Ionicons name="arrow-back-outline" size={20} color="#fff" />
              <Text style={styles.botaoTexto}>Voltar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.botaoNavegacao, { marginLeft: 'auto' }]}
            onPress={pageIndex + 2 < perguntas.length ? avancarPerguntas : finalizarQuestionario}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.botaoTexto}>
                  {pageIndex + 2 < perguntas.length ? 'Próximo' : 'Finalizar'}
                </Text>
                <Ionicons name={pageIndex + 2 < perguntas.length ? "arrow-forward-outline" : "checkmark-done-outline"} size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={showResumo} animationType="fade" transparent={true} onRequestClose={() => setShowResumo(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons name="document-text-outline" size={40} color="#097d4c" />
              <Text style={styles.modalTitulo}>Seu Resumo</Text>
              <ScrollView style={{ maxHeight: '60%', width: '100%' }}>
                {perguntas.map(({ localId, texto }) => (
                  <View key={localId} style={styles.resumoItem}>
                    <Text style={styles.resumoPergunta}>{texto}</Text>
                    <Text style={styles.resumoResposta}>
                      Sua resposta: {respostas[localId] || 'Não respondido'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#f6eecf',
  },
  backgroundIconContainer: {
    position: 'absolute',
    top: -50,
    right: -100,
    opacity: 0.5,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    color: '#097d4c',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#097d4c',
    marginTop: 80,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#5a6e5f',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: '80%',
  },
  blocoPergunta: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 25,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  perguntaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pergunta: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  opcoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  opcaoBotao: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  opcaoSelecionada: {
    backgroundColor: '#097d4c',
    borderColor: '#097d4c',
  },
  opcaoTexto: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  opcaoTextoSelecionado: {
    color: '#fff',
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  botaoNavegacao: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginVertical: 15,
  },
  resumoItem: {
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resumoPergunta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resumoResposta: {
    fontSize: 15,
    color: '#097d4c',
    marginTop: 5,
  },
  botaoFechar: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
});
