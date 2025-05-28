import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, FlatList, Alert, Animated, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { ActivityIndicator } from 'react-native';


export default function VerClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Clientes');
      const data = await response.json();
      console.log('Clientes:', data);
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  async function excluirCliente(ClienteId) {
    console.log('Tentando excluir cliente com ID:', ClienteId);
    try {
      await fetch(`http://localhost:5036/api/Clientes/${ClienteId}`, { method: 'DELETE' });
      setClientes((prev) => prev.filter((c) => c.clienteId !== ClienteId));
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  }
  

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Cadastrar Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Cadastrar Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/chat-com-cliente' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
      {/* Menu lateral */}
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

      {/* Conteúdo principal */}
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Sair / Voltar</Text>
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
      <Text style={styles.clienteNome}>{item.nome}</Text> {/* Modificado */}
      <Text style={styles.clienteInfo}>Email: {item.email}</Text> {/* Modificado */}
      <Text style={styles.clienteInfo}>CPF: {item.cpf}</Text> {/* Modificado */}

      <View style={styles.actions}>
        <Pressable
          style={styles.botaoDetalhes}
          onPress={() => {
            setClienteSelecionado(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.textoBotao}>Ver Detalhes</Text>
        </Pressable>

        <Pressable style={styles.botaoExcluir} onPress={() => excluirCliente(item.clienteId)}>
                    <Text style={styles.textoBotao}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  )}
/>

          
        )}
        {clienteSelecionado && (
  <Modal
    visible={modalVisible}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitulo}>{clienteSelecionado.nome}</Text> 
        <Text style={styles.modalTexto}>Email: {clienteSelecionado.email}</Text> 
        <Text style={styles.modalTexto}>CPF: {clienteSelecionado.cpf}</Text> 
        <Text style={styles.modalTexto}>Telefone: {clienteSelecionado.telefone}</Text>  
        <Text style={styles.modalTexto}>Peso: {clienteSelecionado.peso}</Text>
        <Text style={styles.modalTexto}>Altura: {clienteSelecionado.altura}</Text>
        <Text style={styles.modalTexto}>Objetivo: {clienteSelecionado.objetivo}</Text>
        <Text style={styles.modalTexto}>Nível Atividade: {clienteSelecionado.nivelAtividade}</Text>
        <Text style={styles.modalTexto}>Preferências Alimentares: {clienteSelecionado.preferenciasAlimentares}</Text>
        <Text style={styles.modalTexto}>Doenças Preexistentes: {clienteSelecionado.doencasPreexistentes}</Text>
        

        <Pressable
          style={styles.botaoFechar}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.textoBotao}>Fechar</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
)}



      </View>
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6eecf',
  },
  rightMenu: {
    width: 220,
    height: '100%',
    backgroundColor: '#f6eecf',
    paddingVertical: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: -2, height: 0 },
    shadowRadius: 4,
    elevation: 5,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
    alignSelf: 'center',
  },
  botaoExcluir: {
    backgroundColor: '#d9534f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 5,
    color: '#097d4c',
    fontWeight: 'bold',
  },
  clienteCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 4,
  },
  clienteInfo: {
    fontSize: 14,
    color: '#444',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  botaoDetalhes: {
    backgroundColor: '#097d4c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botaoEditar: {
    backgroundColor: '#e5a10b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#097d4c',
  },
  modalTexto: {
    fontSize: 16,
    marginBottom: 5,
  },
  botaoFechar: {
    marginTop: 20,
    backgroundColor: '#097d4c',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
  },
   
});
