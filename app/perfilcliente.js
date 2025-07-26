import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatDateForDisplay = (isoDate) => {
  if (!isoDate) return 'Não informada';
  try {
    const date = new Date(isoDate);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
};

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
    id: null,
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    sexo: '',
    endereco: '',
    dataNascimento: '',
    tipo: '',
    crn: '',
    especializacao: ''
  });

  const router = useRouter();

  const features = [
    { icon: 'calendar-outline', label: 'Consultar Disponibilidade', route: '/MarcarConsulta' },
    { icon: 'document-text-outline', label: 'Questionário', route: '/questionario' },
    { icon: 'restaurant-outline', label: 'Plano Alimentar', route: '/plano-alimentar' },
    { icon: 'water-outline', label: 'Hidratação', route: '/hidratacao' },
    { icon: 'stats-chart-outline', label: 'Progresso', route: '/progresso' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/perfilcliente' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
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

      console.log('DADOS RECEBIDOS DA API DE PERFIL:', data);

      setUserData(data);
      setEditData({
        id: data.usuarioId || null, // Corrigido para data.UsuarioId conforme o retorno da sua API
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        cpf: data.cpf || '',
        sexo: data.sexo || '',
        endereco: data.endereco || '',
        dataNascimento: data.dataNascimento || '',
        tipo: data.tipoUsuario || '', // Corrigido para data.tipoUsuario
        crn: data.Nutricionista?.crn || '', // Acessando dados aninhados
        especializacao: data.Nutricionista?.especializacao || ''
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editData.id) {
        alert('Erro: ID do usuário não encontrado.');
        return;
    }

    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token de autenticação não encontrado.');
        
        const updatePayload = {
            nome: editData.nome,
            email: editData.email,
            telefone: editData.telefone,
            endereco: editData.endereco,
            sexo: editData.sexo,
            dataNascimento: editData.dataNascimento
        };

        const response = await fetch(`http://localhost:5036/api/Usuarios/${editData.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            try {
                const parsedError = JSON.parse(errorBody);
                const errorMessages = Object.values(parsedError.errors).flat().join('\n');
                throw new Error(`Falha ao atualizar perfil:\n${errorMessages}`);
            } catch {
                throw new Error(`Falha ao atualizar perfil: ${errorBody}`);
            }
        }

        await fetchUserData(); 
        setModalVisible(false);
        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert(error.message);
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
        <Pressable style={styles.backButton} onPress={() => router.push('/dashboard')}>
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
                <Text style={styles.infoLabel}>CPF:</Text>
                <Text style={styles.infoValue}>{userData?.cpf || 'Não informado'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>{userData?.telefone || 'Não informado'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sexo:</Text>
                <Text style={styles.infoValue}>{userData?.sexo || 'Não informado'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Endereço:</Text>
                <Text style={styles.infoValue}>{userData?.endereco || 'Não informado'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nascimento:</Text>
                <Text style={styles.infoValue}>{formatDateForDisplay(userData?.dataNascimento)}</Text>
              </View>

              <Pressable style={styles.editButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </Pressable>
            </View>

            {userData?.tipoUsuario === 'Nutricionista' && (
              <View style={styles.profileSection}>
                <Text style={styles.sectionTitle}>Informações Profissionais</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CRN:</Text>
                  <Text style={styles.infoValue}>{userData?.Nutricionista?.crn || 'Não informado'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Especialização:</Text>
                  <Text style={styles.infoValue}>{userData?.Nutricionista?.especializacao || 'Não informada'}</Text>
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
          <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
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
                placeholder="CPF"
                value={editData.cpf}
                editable={false} // CPF não deve ser editável
              />
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={editData.telefone}
                onChangeText={(text) => setEditData({ ...editData, telefone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Sexo"
                value={editData.sexo}
                onChangeText={(text) => setEditData({ ...editData, sexo: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Endereço Completo"
                value={editData.endereco}
                onChangeText={(text) => setEditData({ ...editData, endereco: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Data de Nascimento (AAAA-MM-DD)"
                value={editData.dataNascimento ? editData.dataNascimento.split('T')[0] : ''}
                onChangeText={(text) => setEditData({ ...editData, dataNascimento: text })}
              />
              {userData?.tipoUsuario === 'Nutricionista' && (
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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  pageContainer: {
    flex: 1, 
    flexDirection: 'row-reverse',
    backgroundColor: '#f6eecf',
  },
  rightMenu: {
    width: 240,
    backgroundColor: '#f6eecf',
    paddingTop: 40,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  menuButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: 'transparent',
  },
  menuButtonText: {
    marginTop: 6,
    fontSize: 14,
    color: '#00713c',
    fontWeight: '500',
    textAlign: 'center',
  },
  container: {
    flex: 1, 
    backgroundColor: '#f6eecf',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#097d4c',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 6,
  },
  profileContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
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
    alignItems: 'flex-start', 
  },
  infoLabel: {
    fontWeight: '600',
    width: 120,
    color: '#555',
    fontSize: 16, 
  },
  infoValue: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#097d4c',
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
    borderRadius: 10,
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
    height: 50,
    borderWidth: 1,
    borderColor: '#097d4c',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1, 
    paddingVertical: 12,
    borderRadius: 10,
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