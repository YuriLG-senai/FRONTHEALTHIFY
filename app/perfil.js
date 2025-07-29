import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para formatar a data
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

// Gera um CRN aleatório como placeholder
const generateRandomCRN = () => {
    const region = '3'; // Exemplo para SP/MS
    const number = Math.floor(10000 + Math.random() * 90000);
    return `CRN-${region} / ${number}`;
};

// Componente do Botão do Menu
const MenuButton = ({ icon, label, onPress }) => {
  return (
    <Pressable style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#097d4c" />
      <Text style={styles.menuButtonText}>{label}</Text>
    </Pressable>
  );
};

// Componente principal da página de Perfil do Nutricionista
export default function PerfilNutricionista() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [editData, setEditData] = useState({
    usuarioId: null,
    nutricionistaId: null,
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    sexo: '',
    endereco: '',
    dataNascimento: '',
    crn: '',
    especializacao: '',
    descricao: '',
  });

  const router = useRouter();

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'people-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Meu Perfil', route: '/perfil-nutricionista' },
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro na resposta do servidor');
      const data = await response.json();

      let crnValue = data.nutricionista?.crn;
      if (!crnValue) {
        crnValue = generateRandomCRN();
      }

      const especialidadeValue = data.nutricionista?.Especialidade || data.nutricionista?.especialidade || '';

      const updatedUserData = {
        ...data,
        nutricionista: {
            ...data.nutricionista,
            crn: crnValue,
            especializacao: especialidadeValue,
        }
      };
      setUserData(updatedUserData);

      setEditData({
        usuarioId: data.usuarioId || null,
        nutricionistaId: data.nutricionista?.nutricionistaId || null,
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        cpf: data.cpf || '',
        sexo: data.sexo || '',
        endereco: data.endereco || '',
        dataNascimento: data.dataNascimento || '',
        crn: crnValue,
        especializacao: especialidadeValue,
        descricao: data.nutricionista?.descricao || '',
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO ATUALIZADA COM DEBUG MAIS DETALHADO ---
  const handleUpdateProfile = async () => {
    console.log("1. A iniciar handleUpdateProfile...");
    // Log para ver o estado exato dos dados antes de qualquer ação
    console.log("Dados atuais no estado de edição (editData):", editData);

    // Validações separadas para um feedback mais claro
    if (!editData.usuarioId) {
      Alert.alert('Erro Crítico', 'O ID do Usuário não foi encontrado. Não é possível salvar.');
      return;
    }
    if (!editData.nutricionistaId) {
      Alert.alert('Erro Crítico', 'O ID do Nutricionista não foi encontrado. Verifique se os dados do perfil foram carregados corretamente.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token de autenticação não encontrado.');
      console.log("2. Token obtido com sucesso.");
      
      const usuarioPayload = {
        nome: editData.nome,
        email: editData.email,
        telefone: editData.telefone,
        endereco: editData.endereco,
        sexo: editData.sexo,
        dataNascimento: editData.dataNascimento,
      };

      const nutricionistaPayload = {
        crn: editData.crn,
        Especialidade: editData.especializacao,
        descricao: editData.descricao,
        usuarioId: editData.usuarioId,
        nutricionistaId: editData.nutricionistaId,
      };
      console.log("3. Payloads criados:", { usuarioPayload, nutricionistaPayload });

      console.log("4. A enviar requisição para atualizar dados do USUÁRIO...");
      const userResponse = await fetch(`http://localhost:5036/api/Usuarios/${editData.usuarioId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioPayload),
      });
      console.log("5. Resposta da atualização do USUÁRIO recebida:", userResponse.status);

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`Falha ao atualizar dados pessoais: ${errorText}`);
      }
      console.log("6. Dados pessoais atualizados com sucesso.");

      console.log("7. A enviar requisição para atualizar dados do NUTRICIONISTA...");
      const nutriResponse = await fetch(`http://localhost:5036/api/Nutricionistas/${editData.nutricionistaId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(nutricionistaPayload),
      });
      console.log("8. Resposta da atualização do NUTRICIONISTA recebida:", nutriResponse.status);

      if (!nutriResponse.ok) {
        const errorText = await nutriResponse.text();
        throw new Error(`Falha ao atualizar dados profissionais: ${errorText}`);
      }
      console.log("9. Dados profissionais atualizados com sucesso.");

      console.log("10. Ambas as requisições foram bem-sucedidas. A atualizar dados no ecrã...");
      await fetchUserData(); 
      setModalVisible(false);
      Alert.alert('Sucesso!', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('ERRO DETALHADO ao atualizar perfil:', error);
      Alert.alert('Erro ao Salvar', error.message);
    }
  };

  return (
    <View style={styles.pageContainer}>
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

        <Text style={styles.title}>Meu Perfil</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#097d4c" style={{ marginTop: 30 }} />
        ) : (
          <ScrollView style={styles.profileContainer} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Nome:</Text><Text style={styles.infoValue}>{userData?.nome}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Email:</Text><Text style={styles.infoValue}>{userData?.email}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>CPF:</Text><Text style={styles.infoValue}>{userData?.cpf || 'Não informado'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Telefone:</Text><Text style={styles.infoValue}>{userData?.telefone || 'Não informado'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Endereço:</Text><Text style={styles.infoValue}>{userData?.endereco || 'Não informado'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Nascimento:</Text><Text style={styles.infoValue}>{formatDateForDisplay(userData?.dataNascimento)}</Text></View>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Informações Profissionais</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>CRN:</Text><Text style={styles.infoValue}>{userData?.nutricionista?.crn || 'Não informado'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Especialização:</Text><Text style={styles.infoValue}>{userData?.nutricionista?.especializacao || 'Não informada'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Descrição:</Text><Text style={styles.infoValue}>{userData?.nutricionista?.descricao || 'Não informada'}</Text></View>
            </View>
            
            <Pressable style={styles.editButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.editButtonText}>Editar Perfil Completo</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              
              <Text style={styles.modalSectionHeader}>Dados Pessoais</Text>
              <TextInput style={styles.input} placeholder="Nome" value={editData.nome} onChangeText={(text) => setEditData({ ...editData, nome: text })} />
              <TextInput style={styles.input} placeholder="Email" value={editData.email} onChangeText={(text) => setEditData({ ...editData, email: text })} keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Telefone" value={editData.telefone} onChangeText={(text) => setEditData({ ...editData, telefone: text })} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Endereço Completo" value={editData.endereco} onChangeText={(text) => setEditData({ ...editData, endereco: text })} />
              
              <Text style={styles.modalSectionHeader}>Dados Profissionais</Text>
              <TextInput style={styles.input} placeholder="CRN" value={editData.crn} onChangeText={(text) => setEditData({ ...editData, crn: text })} />
              <TextInput style={styles.input} placeholder="Especialização" value={editData.especializacao} onChangeText={(text) => setEditData({ ...editData, especializacao: text })} />
              <TextInput
                style={styles.inputMultiLine}
                placeholder="Descrição (fale um pouco sobre você)"
                value={editData.descricao}
                onChangeText={(text) => setEditData({ ...editData, descricao: text })}
                multiline
              />
              
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    menuButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#00713c',
        fontWeight: '500',
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
        marginBottom: 20,
    },
    profileContainer: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
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
        paddingBottom: 10,
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
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    modalBackground: {
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#097d4c',
        textAlign: 'center',
    },
    modalSectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    inputMultiLine: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
        height: 'auto',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1, 
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#aaa',
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#097d4c',
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});