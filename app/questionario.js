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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const options = {
  headerShown: false,
};

// Botão do menu lateral
const MenuButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#097d4c" />
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const features = [
  { icon: 'calendar-outline', label: 'Consultar Disponibilidade', route: '/MarcarConsulta' },
  { icon: 'document-text-outline', label: 'Questionário', route: '/questionario' },
  { icon: 'restaurant-outline', label: 'Plano Alimentar', route: '/plano-alimentar' },
  { icon: 'water-outline', label: 'Hidratação', route: '/hidratacao' },
  { icon: 'stats-chart-outline', label: 'Progresso', route: '/progresso' },
  { icon: 'person-circle-outline', label: 'Perfil', route: '/perfilcliente' },
];

// 1. A ESTRUTURA DAS PERGUNTAS FOI ATUALIZADA
// Adicionamos um 'dbId' para o banco de dados e renomeamos 'id' para 'localId' para uso interno.
const perguntas = [
    {
      dbId: 1,
      localId: 'cafeDaManha',
      texto: '☀️ Você costuma tomar café da manhã?',
      opcoes: ['Sim', 'Às vezes', 'Não'],
    },
    {
      dbId: 2,
      localId: 'refeicoesPorDia',
      texto: 'Quantas refeições você faz por dia?',
      opcoes: ['2 ou menos', '3 a 4', '5 ou mais'],
    },
    {
      dbId: 3,
      localId: 'consumoAgua',
      texto: 'Quantos litros de água você bebe por dia?',
      opcoes: ['Menos de 1L', '1 a 2L', 'Mais de 2L'],
    },
    {
      dbId: 4,
      localId: 'alimentosIndustrializados',
      texto: 'Você consome alimentos industrializados com frequência?',
      opcoes: ['Sim', 'Raramente', 'Não'],
    },
    {
      dbId: 5,
      localId: 'frutasVerduras',
      texto: 'Você come frutas e verduras todos os dias?',
      opcoes: ['Sim', 'Às vezes', 'Não'],
    },
    {
      dbId: 6,
      localId: 'atividadeFisica',
      texto: 'Você pratica atividades físicas regularmente?',
      opcoes: [
        'Sim, mais de 3 vezes por semana',
        'Sim, 1 a 2 vezes por semana',
        'Não, quase nunca',
      ],
    },
    {
      dbId: 7,
      localId: 'horasDeSono',
      texto: 'Quantas horas de sono você tem por noite, em média?',
      opcoes: ['Menos de 6 horas', '6 a 8 horas', 'Mais de 8 horas'],
    },
    {
      dbId: 8,
      localId: 'nivelDeEstresse',
      texto: 'Como você avaliaria seu nível de estresse atualmente?',
      opcoes: ['Baixo', 'Moderado', 'Alto'],
    },
    {
      dbId: 9,
      localId: 'trabalhoEmCasa',
      texto: 'Você trabalha em casa ou em home office?',
      opcoes: ['Sim', 'Não'],
    },
    {
      dbId: 10,
      localId: 'tempoDeTela',
      texto: 'Quanto tempo você passa em frente a telas (computador, celular, TV) por dia?',
      opcoes: ['Menos de 2 horas', '2 a 4 horas', 'Mais de 4 horas'],
    },
    {
      dbId: 11,
      localId: 'descanso',
      texto: 'Você tem momentos de descanso durante o seu dia? 🌿',
      opcoes: ['Sim, sempre', 'Às vezes', 'Não'],
    },
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
        
        if (data.cliente && data.cliente.clienteId) {
          setClienteId(data.cliente.clienteId);
        } else {
          if (data.tipoUsuario === 'Cliente' && data.usuarioId) {
             const clienteResponse = await fetch(`http://localhost:5036/api/Usuarios/Clientes/usuario/${data.usuarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
             });
             if(!clienteResponse.ok) throw new Error('Não foi possível encontrar os dados do cliente.');
             const clienteData = await clienteResponse.json();
             setClienteId(clienteData.clienteId);
          } else {
            throw new Error('ID do cliente não encontrado no perfil.');
          }
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
    // A lógica aqui continua a mesma
    switch (localId) {
      case 'cafeDaManha': return resposta === 'Não' ? 'Tente incluir um café da manhã...' : 'Ótimo!';
      // ... resto dos cases
      default: return '';
    }
  };

  const responder = (localId, opcao) => {
    setRespostas((prev) => ({
      ...prev,
      [localId]: opcao,
    }));
  };

  const verificarRespostasAtuais = () => {
    const perguntasAtuaisIds = perguntas
      .slice(pageIndex, pageIndex + 2)
      .map(p => p.localId); // Usa localId
    
    const perguntasNaoRespondidas = perguntasAtuaisIds.filter(id => !respostas[id]);

    return perguntasNaoRespondidas;
  };

  const avancarPerguntas = () => {
    const naoRespondidas = verificarRespostasAtuais();

    if (naoRespondidas.length > 0) {
      const nomesPerguntas = naoRespondidas.map(id => {
        const pergunta = perguntas.find(p => p.localId === id); // Usa localId
        return pergunta ? `"${pergunta.texto.split('?')[0]}?"` : '';
      }).join('\n- ');
      Alert.alert('Atenção', `Por favor, responda...:\n- ${nomesPerguntas}`);
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
      // 2. PAYLOAD ATUALIZADO
      // Mapeia as respostas e envia o 'dbId' numérico como 'PerguntaId'
      const payload = Object.keys(respostas).map(localId => {
        const pergunta = perguntas.find(p => p.localId === localId);
        return {
          ClienteId: clienteId,
          PerguntaId: pergunta.dbId, // Envia o ID numérico
          RespostaTexto: respostas[localId],
          DataResposta: new Date().toISOString(),
        };
      });
      
      const token = await AsyncStorage.getItem('token');

      const response = await fetch('http://localhost:5036/api/Clientes/respostas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
    const todasPerguntasNaoRespondidas = perguntas.filter(p => !respostas[p.localId]); // Usa localId

    if (todasPerguntasNaoRespondidas.length > 0) {
      const nomesPerguntas = todasPerguntasNaoRespondidas.map(p => `"${p.texto.split('?')[0]}?"`).join('\n- ');
      Alert.alert('Atenção', `Por favor, responda... Faltam:\n- ${nomesPerguntas}`);
      return;
    }
    
    enviarRespostas();
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.dashboardButton} onPress={() => router.push('/dashboard')}>
          <Ionicons name="home" size={30} color="#097d4c" />
        </TouchableOpacity>

        <Text style={styles.titulo}>🌿 Questionário de Rotina Saudável 🌿</Text>

        {/* 3. ATUALIZAÇÃO NO JSX para usar 'localId' como chave e no 'onPress' */}
        {perguntas.slice(pageIndex, pageIndex + 2).map((pergunta) => {
          return (
            <Animated.View key={pergunta.localId} style={{ opacity: fadeAnim }}>
              <View style={styles.blocoPergunta}>
                <Text style={styles.pergunta}>{pergunta.texto}</Text>
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
                      <Text
                        style={[
                          styles.opcaoTexto,
                          respostas[pergunta.localId] === opcao && styles.opcaoTextoSelecionado,
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

        <View style={styles.navigationButtonsContainer}>
          {pageIndex > 0 ? (
            <>
              <TouchableOpacity style={styles.botaoVoltar} onPress={voltarPerguntas}>
                <Text style={styles.botaoTexto}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoEnviar}
                onPress={pageIndex + 2 < perguntas.length ? avancarPerguntas : finalizarQuestionario}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>
                    {pageIndex + 2 < perguntas.length ? 'Próximo' : 'Ver seu resumo'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.botaoEnviar, { alignSelf: 'flex-end' }]}
              onPress={pageIndex + 2 < perguntas.length ? avancarPerguntas : finalizarQuestionario}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoTexto}>
                  {pageIndex + 2 < perguntas.length ? 'Próximo' : 'Ver seu resumo'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

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
                {perguntas.map(({ localId, texto }) => (
                  <View key={localId} style={{ marginBottom: 15 }}>
                    <Text style={styles.pergunta}>{texto}</Text>
                    <Text style={{ fontWeight: '600', marginBottom: 5 }}>
                      Resposta: {respostas[localId] || 'Não respondido'}
                    </Text>
                    <Text style={{ fontStyle: 'italic', color: '#555' }}>
                      {obterSugestao(localId, respostas[localId])}
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

      <View style={styles.rightMenu}>
        {features.map((item, index) => (
          <MenuButton
            key={index}
            icon={item.icon}
            label={item.label}
            onPress={() => router.push(item.route)}
          />
        ))}
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f6eecf',
  },
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dashboardButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: 'transparent',
    padding: 10,
    zIndex: 100,
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
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  botaoEnviar: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
    minWidth: 120,
  },
  botaoVoltar: {
    backgroundColor: '#888',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
    minWidth: 120,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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

  // Estilos do menu lateral CORRIGIDOS
  rightMenu: {
    width: 240,
    backgroundColor: '#f6eecf',
    paddingVertical: 30,
    paddingHorizontal: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#006D38',
    alignItems: 'flex-start',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#006D38',
    fontWeight: '600',
  },
});