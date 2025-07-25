import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, ScrollView, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para gerar um CRN aleatório (APENAS PARA EXHIBIÇÃO/TESTE)
const generateRandomCRN = () => {
  const regionNumber = Math.floor(Math.random() * 10) + 1; // CRN/1 a CRN/10
  const registrationNumber = Math.floor(10000 + Math.random() * 90000); // Número de 5 dígitos
  return `CRN/${regionNumber}-${registrationNumber}`;
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
    cpf: '',
    endereco: '',
    dataNascimento: '',
    descricao: '',
  });

  const router = useRouter();

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/perfilnutri' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      let nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
      let generatedCRN = await AsyncStorage.getItem('generatedCRN'); // <--- Novo: Tenta pegar o CRN gerado

      if (!nutricionistaId && token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          nutricionistaId = decodedToken.UsuarioId;
          await AsyncStorage.setItem('nutricionistaId', nutricionistaId.toString());
        } catch (decodeError) {
          console.error('Erro ao decodificar token:', decodeError);
          throw new Error('Token inválido ou ID não encontrado no token.');
        }
      }
      
      console.log('Dados decodificados do token (no fetchUserData):', token ? JSON.parse(atob(token.split('.')[1])) : 'N/A');
      console.log('Nutricionista ID (no fetchUserData):', nutricionistaId);

      if (!token || !nutricionistaId) {
        console.error('Token ou ID do nutricionista não encontrados para buscar dados.');
        throw new Error('Token ou ID não encontrado para buscar dados.');
      }

      const response = await fetch(`http://localhost:5036/api/Nutricionistas/${nutricionistaId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta da API ao buscar:', response.status, errorText);
        throw new Error(`Erro ao buscar perfil do nutricionista: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados do nutricionista recebidos:', data);

      // Lógica para usar o CRN real ou gerar um e salvá-lo
      let crnToDisplay = data.crn;
      if (!crnToDisplay || crnToDisplay === '') { // Se o CRN do backend estiver vazio
        if (!generatedCRN) { // Se não houver um CRN gerado salvo
          generatedCRN = generateRandomCRN();
          await AsyncStorage.setItem('generatedCRN', generatedCRN); // Salva o CRN gerado
          console.log('CRN aleatório gerado e salvo:', generatedCRN);
        } else {
          console.log('Usando CRN aleatório salvo:', generatedCRN);
        }
        crnToDisplay = generatedCRN; // Usa o CRN gerado/salvo
      } else {
        // Se o backend retornou um CRN real, garante que não há um CRN aleatório salvo para este usuário
        // (Isso é uma decisão de UX: se o CRN se torna real, removemos o "placeholder")
        await AsyncStorage.removeItem('generatedCRN');
        console.log('Backend retornou CRN real. Removendo CRN aleatório salvo, se existir.');
      }

      setUserData({ ...data, crn: crnToDisplay }); // Atualiza userData com o CRN final

      setEditData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        crn: data.crn || '', // Para edição, sempre use o valor do backend
        especializacao: data.especialidade || '',
        cpf: data.cpf || '',
        endereco: data.endereco || '',
        dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '',
        descricao: data.descricao || '',
      });
    } catch (error) {
      console.error('Erro ao buscar dados do nutricionista:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');

      if (!token || !nutricionistaId) {
        throw new Error('Token ou ID do nutricionista não encontrados para atualização.');
      }

      const dataToUpdate = {
        id: parseInt(nutricionistaId),
        nome: editData.nome,
        email: editData.email,
        telefone: editData.telefone,
        crn: editData.crn,
        especialidade: editData.especializacao,
        cpf: editData.cpf,
        endereco: editData.endereco,
        dataNascimento: editData.dataNascimento,
        descricao: editData.descricao,
      };
      console.log('Dados sendo enviados para atualização:', dataToUpdate);

      const response = await fetch(`http://localhost:5036/api/Nutricionistas/${nutricionistaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta da API ao atualizar:', response.status, errorText);
        throw new Error(`Falha ao atualizar perfil: ${response.status} - ${errorText}`);
      }

      // Se o backend aceitou a atualização do CRN, remove o CRN gerado anteriormente (se existir)
      if (editData.crn && editData.crn !== '') {
        await AsyncStorage.removeItem('generatedCRN');
      }
      
      await fetchUserData();
      setModalVisible(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
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
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              <Text style={styles.labelField}>Nome: <Text style={styles.value}>{userData?.nome}</Text></Text>
              <Text style={styles.labelField}>Email: <Text style={styles.value}>{userData?.email}</Text></Text>
              <Text style={styles.labelField}>Telefone: <Text style={styles.value}>{userData?.telefone || 'Não informado'}</Text></Text>
              <Text style={styles.labelField}>CPF: <Text style={styles.value}>{userData?.cpf || 'Não informado'}</Text></Text>
              <Text style={styles.labelField}>Endereço: <Text style={styles.value}>{userData?.endereco || 'Não informado'}</Text></Text>
              <Text style={styles.labelField}>Data de Nascimento: <Text style={styles.value}>{userData?.dataNascimento ? new Date(userData.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'}</Text></Text>
              {/* Exibindo o CRN (real ou gerado) */}
              <Text style={styles.labelField}>CRN: <Text style={styles.value}>{userData?.crn || 'Não informado'}</Text></Text>
              <Text style={styles.labelField}>Especialidade: <Text style={styles.value}>{userData?.especialidade || 'Não informado'}</Text></Text>
              <Text style={styles.labelField}>Descrição: <Text style={styles.value}>{userData?.descricao || 'Não informado'}</Text></Text>

              <Pressable style={styles.botaoEditar} onPress={() => setModalVisible(true)}>
                <Text style={styles.textoBotao}>Editar Perfil</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* Modal */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
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
              <TextInput
                style={styles.input}
                placeholder="CPF"
                value={editData.cpf}
                onChangeText={(text) => setEditData({ ...editData, cpf: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Endereço"
                value={editData.endereco}
                onChangeText={(text) => setEditData({ ...editData, endereco: text })}
              />
               <TextInput
                style={styles.input}
                placeholder="Data de Nascimento (YYYY-MM-DD)"
                value={editData.dataNascimento}
                onChangeText={(text) => setEditData({ ...editData, dataNascimento: text })}
              />
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
               <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Descrição"
                value={editData.descricao}
                onChangeText={(text) => setEditData({ ...editData, descricao: text })}
                multiline={true}
                numberOfLines={4}
              />
              <Pressable style={styles.botaoSalvarModal} onPress={handleUpdateProfile}>
                <Text style={styles.textoBotao}>Salvar</Text>
              </Pressable>
              <Pressable style={[styles.botaoFecharModal, {marginTop: 10}]} onPress={() => setModalVisible(false)}>
                <Text style={styles.textoBotao}>Cancelar</Text>
              </Pressable>
            </Pressable>
          </Pressable>
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
          <Text style={styles.menuLabelText}>{label}</Text>
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
  menuLabelText: {
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
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
    marginTop: 10,
  },
  labelField: {
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5,
  },
  value: {
    fontWeight: 'normal',
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
    maxHeight: '90%',
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
  botaoSalvarModal: {
    backgroundColor: '#097d4c',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoFecharModal: {
    backgroundColor: '#e5a10b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});