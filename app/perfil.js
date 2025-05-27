import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PerfilUsuario() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    nome: '',
    email: '',
    telefone: '',
    // outros campos do perfil
  });

  const router = useRouter();

  // Menu similar ao que você já tem
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
      // Substitua pela sua API endpoint
      const response = await fetch('http://localhost:5036/api/Usuario/perfil');
      const data = await response.json();
      setUserData(data);
      setEditData(data); // Preenche os dados para edição
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
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
      {/* Menu lateral - igual ao que você já tem */}
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
          <View style={styles.profileContainer}>
            {/* Seção de visualização */}
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
              
              {/* Adicione mais campos conforme necessário */}
              
              <Pressable 
                style={styles.editButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </Pressable>
            </View>

            {/* Seção específica para nutricionistas */}
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
          </View>
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
              onChangeText={(text) => setEditData({...editData, nome: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editData.email}
              onChangeText={(text) => setEditData({...editData, email: text})}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={editData.telefone}
              onChangeText={(text) => setEditData({...editData, telefone: text})}
              keyboardType="phone-pad"
            />
            
            {/* Campos específicos para nutricionistas */}
            {userData?.tipo === 'nutricionista' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="CRN"
                  value={editData.crn}
                  onChangeText={(text) => setEditData({...editData, crn: text})}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Especialização"
                  value={editData.especializacao}
                  onChangeText={(text) => setEditData({...editData, especializacao: text})}
                />
              </>
            )}
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Mantenha o componente MenuButton que você já tem

const styles = StyleSheet.create({
  // Mantenha os estilos que você já tem e adicione esses:
  profileContainer: {
    flex: 1,
    padding: 15,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 120,
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#e5a10b',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Adicione outros estilos conforme necessário
});