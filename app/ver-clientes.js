import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, Alert, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Componente do Botão do Menu Lateral (sem alterações)
function MenuButton({ icon, label, onPress }) {
  const translateY = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    Animated.spring(translateY, { toValue: -6, useNativeDriver: true }).start();
  };

  const handleHoverOut = () => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPress={onPress} onHoverIn={handleHoverIn} onHoverOut={handleHoverOut} style={{ marginBottom: 16 }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <View style={styles.card}>
          <Ionicons name={icon} size={30} color="#097d4c" />
          <Text style={styles.label}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function VerClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- NOVOS ESTADOS PARA O QUESTIONÁRIO ---
  const [respostasQuestionario, setRespostasQuestionario] = useState([]);
  const [isLoadingQuestionario, setIsLoadingQuestionario] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5036/api/Clientes');
      if (!response.ok) throw new Error('Falha ao buscar clientes');
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  // --- NOVA FUNÇÃO PARA BUSCAR AS RESPOSTAS DO QUESTIONÁRIO ---
  const fetchQuestionarioCliente = async (clienteId) => {
    if (!clienteId) return;
    setIsLoadingQuestionario(true);
    setRespostasQuestionario([]); // Limpa as respostas antigas
    try {
      // ATENÇÃO: Verifique se este endpoint está correto no seu backend.
      const response = await fetch(`http://localhost:5036/api/QuestionarioRespostas/cliente/${clienteId}`);
      if (!response.ok) {
        // Se a resposta for 404 (Not Found), significa que o cliente não tem respostas.
        if (response.status === 404) {
          setRespostasQuestionario([]);
          return;
        }
        throw new Error('Falha ao buscar questionário');
      }
      const data = await response.json();
      setRespostasQuestionario(data);
    } catch (error) {
      console.error('Erro ao buscar questionário do cliente:', error);
      setRespostasQuestionario([]); // Garante que a lista fique vazia em caso de erro
    } finally {
      setIsLoadingQuestionario(false);
    }
  };

  const confirmarExclusao = (cliente) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Você tem certeza que deseja excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluirCliente(cliente.clienteId) }
      ]
    );
  };

  const excluirCliente = async (clienteId) => {
    try {
      const response = await fetch(`http://localhost:5036/api/Clientes/${clienteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir cliente no servidor');
      setClientes((prev) => prev.filter((c) => c.clienteId !== clienteId));
      Alert.alert('Sucesso', 'Cliente excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      Alert.alert('Erro', 'Não foi possível excluir o cliente.');
    }
  };

  const abrirModalDetalhes = (cliente) => {
    setClienteSelecionado(cliente);
    setModalVisible(true);
    fetchQuestionarioCliente(cliente.clienteId); // Busca o questionário ao abrir o modal
  };

  const fecharModal = () => {
    setModalVisible(false);
    setClienteSelecionado(null);
  };

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/chat-com-cliente' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
      <View style={styles.rightMenu}>
        {features.map((item, index) => (
          <MenuButton key={index} icon={item.icon} label={item.label} onPress={() => router.push(item.route)} />
        ))}
      </View>

      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Voltar ao Dashboard</Text>
        </Pressable>

        <Text style={styles.titulo}>Meus Clientes</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#097d4c" />
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={(item) => item.clienteId.toString()}
            renderItem={({ item }) => (
              <View style={styles.clienteCard}>
                <View>
                  <Text style={styles.clienteNome}>{item.nome}</Text>
                  <Text style={styles.clienteInfo}>Email: {item.email}</Text>
                  <Text style={styles.clienteInfo}>CPF: {item.cpf}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={styles.botaoDetalhes} onPress={() => abrirModalDetalhes(item)}>
                    <Ionicons name="eye-outline" size={16} color="#fff" />
                  </Pressable>
                  <Pressable style={styles.botaoExcluir} onPress={() => confirmarExclusao(item)}>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.listaVaziaTexto}>Nenhum cliente encontrado.</Text>}
          />
        )}

        {clienteSelecionado && (
          <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={fecharModal}>
            <Pressable style={styles.modalContainer} onPress={fecharModal}>
              <Pressable style={styles.modalContent} onPress={() => {}}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitulo}>{clienteSelecionado.nome}</Text>
                  
                  {/* --- SEÇÃO DE DETALHES DO CLIENTE --- */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Dados Pessoais</Text>
                    <Text style={styles.modalTexto}><Text style={styles.bold}>Email:</Text> {clienteSelecionado.email}</Text>
                    <Text style={styles.modalTexto}><Text style={styles.bold}>CPF:</Text> {clienteSelecionado.cpf}</Text>
                    <Text style={styles.modalTexto}><Text style={styles.bold}>Telefone:</Text> {clienteSelecionado.telefone || 'Não informado'}</Text>
                    <Text style={styles.modalTexto}><Text style={styles.bold}>Peso:</Text> {clienteSelecionado.peso || 'Não informado'}</Text>
                    <Text style={styles.modalTexto}><Text style={styles.bold}>Altura:</Text> {clienteSelecionado.altura || 'Não informado'}</Text>
                    <Text style={styles.modalTexto}><Text style={styles.bold}>Objetivo:</Text> {clienteSelecionado.objetivo || 'Não informado'}</Text>
                  </View>

                  {/* --- NOVA SEÇÃO DO QUESTIONÁRIO --- */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Questionário de Rotina</Text>
                    {isLoadingQuestionario ? (
                      <ActivityIndicator size="small" color="#097d4c" />
                    ) : respostasQuestionario.length > 0 ? (
                      respostasQuestionario.map((resp, index) => (
                        <View key={index} style={styles.respostaItem}>
                          <Text style={styles.perguntaTexto}>{resp.pergunta?.texto || `Pergunta ${resp.perguntaId}`}</Text>
                          <Text style={styles.respostaTexto}>{resp.respostaTexto}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.questionarioVazio}>Questionário não respondido.</Text>
                    )}
                  </View>

                  <Pressable style={styles.botaoFechar} onPress={fecharModal}>
                    <Text style={styles.textoBotao}>Fechar</Text>
                  </Pressable>
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6eecf',
  },
  rightMenu: {
    width: 220,
    backgroundColor: '#f6eecf',
    paddingVertical: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0'
  },
  card: {
    backgroundColor: 'transparent',
    width: 180,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 10,
    textAlign: 'center',
    color: '#097d4c',
    fontWeight: '600',
    fontSize: 14,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    color: '#097d4c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clienteCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 5,
  },
  clienteInfo: {
    fontSize: 14,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoDetalhes: {
    backgroundColor: '#097d4c',
    padding: 10,
    borderRadius: 20,
  },
  botaoExcluir: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 20,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  listaVaziaTexto: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#097d4c',
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
  },
  botaoFechar: {
    marginTop: 10,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 10,
  },
  // --- NOVOS ESTILOS PARA O QUESTIONÁRIO ---
  questionarioVazio: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#c85c5c', // Tom de vermelho suave
    textAlign: 'center',
    padding: 10,
  },
  respostaItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  perguntaTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  respostaTexto: {
    fontSize: 15,
    color: '#097d4c',
  },
});