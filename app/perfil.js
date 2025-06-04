import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const MenuButton = ({ icon, label, onPress }) => {
  return (
    <Pressable style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#097d4c" />
      <Text style={styles.menuButtonText}>{label}</Text>
    </Pressable>
  );
};

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
      if (!token) throw new Error('Token não encontrado');


      const response = await fetch('http://localhost:5036/api/Usuarios/perfil', {
        method: 'GET',
          headers: {
          'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
      },
      });

      if (!response.ok) throw new Error('Erro na resposta do servidor');

      const data = await response.json();
      setUserData(data);
      setEditData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        crn: data.crn || '',
        especializacao: data.especializacao || ''
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Usuario/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

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
    <View style={styles.pageContainer}>
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

        <Text style={styles.title}>Meu Perfil</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#097d4c" style={{ marginTop: 30 }} />
        ) : (
          <ScrollView style={styles.profileContainer} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Informações Pessoais */}
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome:</Text>
                <Text style={styles.infoValue}>{userData?.nome}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{userData?.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>{userData?.telefone || 'Não informado'}</Text>
              </View>

              <Pressable style={styles.editButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </Pressable>
            </View>

            {/* Informações profissionais para nutricionista */}
            {userData?.tipo === 'nutricionista' && (
              <View style={styles.profileSection}>
                <Text style={styles.sectionTitle}>Informações Profissionais</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CRN:</Text>
                  <Text style={styles.infoValue}>{userData?.crn || 'Não informado'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Especialização:</Text>
                  <Text style={styles.infoValue}>{userData?.especializacao || 'Não informada'}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal de edição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={editData.nome}
              onChangeText={(text) => setEditData({ ...editData, nome: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editData.email}
              onChangeText={(text) => setEditData({ ...editData, email: text })}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={editData.telefone}
              onChangeText={(text) => setEditData({ ...editData, telefone: text })}
              keyboardType="phone-pad"
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

            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>

              <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    backgroundColor: '#f7faf7',
  },
  rightMenu: {
    width: 160,
    backgroundColor: '#e0f0db',
    paddingTop: 40,
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderColor: '#c5d6bc',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  menuButtonPressed: {
    backgroundColor: '#c0d4af',
  },
  menuButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#097d4c',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: '#097d4c',
    marginLeft: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#097d4c',
    marginBottom: 20,
  },
  profileContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#097d4c',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f0d7',
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: '600',
    width: 120,
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#e5a10b',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#b27e05',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#097d4c',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b0c89a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#aaa',
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#097d4c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

