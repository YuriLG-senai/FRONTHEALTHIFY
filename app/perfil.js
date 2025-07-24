import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilUsuario() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    nome: '',
    email: '',
    telefone: '',
    crn: '',
    especializacao: '',
  });

  const router = useRouter();

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/perfil' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const nutricionistaId = await AsyncStorage.getItem('nutricionistaId'); // <- importante
  
      if (!token || !nutricionistaId) throw new Error('Token ou ID não encontrado');
  
      const response = await fetch(`http://localhost:5036/api/Nutricionistas/${nutricionistaId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Erro ao buscar perfil do nutricionista');
  
      const data = await response.json();
      setUserData(data);
  
      setEditData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        crn: '', // se tiver esse campo
        especializacao: data.especialidade || '',
      });
    } catch (error) {
      console.error('Erro ao buscar dados do nutricionista:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleUpdateProfile = async () => {
    try {
      const nutricionistaId = await AsyncStorage.getItem('nutricionistaId'); // certifique-se de salvar isso no login

        const response = await fetch(`http://localhost:5036/api/Nutricionistas/${nutricionistaId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setUserData(data);


      if (!response.ok) throw new Error('Falha ao atualizar perfil');

      const updatedData = await response.json();
      setUserData(updatedData);
      setModalVisible(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil: ' + error.message);
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
      {/* Menu lateral */}
      <View style={styles.rightMenu}>
        {features.map((item, index) => (
          <MenuButton key={index} icon={item.icon} label={item.label} onPress={() => router.push(item.route)} />
        ))}
      </View>

      {/* Conteúdo principal */}
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <Text style={styles.titulo}>Meu Perfil</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#097d4c" />
        ) : (
          <ScrollView>
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              <Text style={styles.label}>Nome: <Text style={styles.value}>{userData?.nome}</Text></Text>
              <Text style={styles.label}>Email: <Text style={styles.value}>{userData?.email}</Text></Text>
              <Text style={styles.label}>Telefone: <Text style={styles.value}>{userData?.telefone || 'Não informado'}</Text></Text>
              <Text style={styles.label}>CPF: <Text style={styles.value}>{userData?.cpf}</Text></Text>
              <Text style={styles.label}>Endereço: <Text style={styles.value}>{userData?.endereco}</Text></Text>
              <Text style={styles.label}>Data de Nascimento: <Text style={styles.value}>{userData?.dataNascimento}</Text></Text>
              <Text style={styles.label}>Especialidade: <Text style={styles.value}>{userData?.especialidade}</Text></Text>
              <Text style={styles.label}>Descrição: <Text style={styles.value}>{userData?.descricao}</Text></Text>

              <Pressable style={styles.botaoEditar} onPress={() => setModalVisible(true)}>
                <Text style={styles.textoBotao}>Editar Perfil</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>Editar Perfil</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome"
                value={editData.nome}
                onChangeText={(text) => setEditData({ ...editData, nome: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={editData.email}
                onChangeText={(text) => setEditData({ ...editData, email: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                keyboardType="phone-pad"
                value={editData.telefone}
                onChangeText={(text) => setEditData({ ...editData, telefone: text })}
              />
              {userData?.tipo === 'nutricionista' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="CRN"
                    value={editData.crn}
                    onChangeText={(text) => setEditData({ ...editData, crn: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Especialização"
                    value={editData.especializacao}
                    onChangeText={(text) => setEditData({ ...editData, especializacao: text })}
                  />
                </>
              )}
              <Pressable style={styles.botaoFechar} onPress={handleUpdateProfile}>
                <Text style={styles.textoBotao}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    marginLeft: 6,
    color: '#097d4c',
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
    marginTop: 10,
  },
  labelText: {
    fontWeight: 'bold',
    color: '#444',
  },
  value: {
    color: '#333',
  },
  botaoEditar: {
    backgroundColor: '#e5a10b',
    paddingVertical: 10,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  botaoFechar: {
    backgroundColor: '#097d4c',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
