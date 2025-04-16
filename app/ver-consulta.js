import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [notas, setNotas] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // Para controlar se estamos criando uma nova consulta
  const [newConsulta, setNewConsulta] = useState({
    ClienteId: '',
    NutricionistaId: '',
    DataConsulta: '',
    TipoConsulta: 'Online', // Por padrão
    Status: 'Agendada', // Por padrão
    Observacoes: '',
  });

  const router = useRouter();

  useEffect(() => {
    fetchConsultas();
  }, []);

  const fetchConsultas = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Consultas');
      const data = await response.json();
      setConsultas(data);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    }
  };

  const consultasDoDia = consultas.filter(
    (c) => new Date(c.dataConsulta).toISOString().split('T')[0] === selectedDate
  );

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handleCreateConsulta = async () => {
    if (!newConsulta.ClienteId || !newConsulta.NutricionistaId || !newConsulta.DataConsulta) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
  
    console.log("Criando consulta com os dados:", newConsulta); // Log dos dados que estamos tentando criar
  
    try {
      const response = await fetch('http://localhost:5036/api/Consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConsulta),
      });
  
      if (response.ok) {
        console.log("Consulta criada com sucesso!"); // Se tudo ocorrer bem
        fetchConsultas(); // Recarregar consultas após criação
        setIsCreating(false); // Fechar o modal
      } else {
        console.error('Erro ao criar consulta: ', response); // Log do erro
      }
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
        <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
        <Text style={styles.backText}>Sair / Voltar</Text>
      </Pressable>

      <Text style={styles.titulo}>Consultas</Text>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#097d4c' },
        }}
        theme={{
          todayTextColor: '#097d4c',
          selectedDayBackgroundColor: '#097d4c',
          arrowColor: '#097d4c',
        }}
      />

      {/* Modal para nova consulta */}
      <Modal
        visible={isCreating}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreating(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Nova Consulta</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Cliente Id"
              value={newConsulta.ClienteId}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, ClienteId: text })}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Nutricionista Id"
              value={newConsulta.NutricionistaId}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, NutricionistaId: text })}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Data da Consulta"
              value={newConsulta.DataConsulta}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, DataConsulta: text })}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Observações"
              value={newConsulta.Observacoes}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, Observacoes: text })}
            />

            <Pressable style={styles.button} onPress={handleCreateConsulta}>
              <Text style={styles.buttonText}>Criar Consulta</Text>
            </Pressable>

            <Pressable style={styles.fecharButton} onPress={() => setIsCreating(false)}>
              <Text style={styles.fecharText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable style={styles.createButton} onPress={() => setIsCreating(true)}>
        <Text style={styles.createButtonText}>Nova Consulta</Text>
      </Pressable>

      {/* Modal tipo bloco de notas */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Consultas em {selectedDate}</Text>
            <FlatList
              data={consultasDoDia}
              keyExtractor={(item) => item.consultaId.toString()}
              renderItem={({ item }) => (
                <View style={styles.consultaItem}>
                  <Text style={styles.modalText}>Tipo: {item.tipoConsulta}</Text>
                  <Text style={styles.modalText}>Status: {item.status}</Text>
                </View>
              )}
            />

            <Pressable style={styles.fecharButton} onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6eecf',
    padding: 20,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    color: '#097d4c',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '90%',
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#444',
  },
  consultaItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
  },
  textInput: {
    marginTop: 10,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  button: {
    marginTop: 15,
    backgroundColor: '#097d4c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fecharButton: {
    marginTop: 15,
    backgroundColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  fecharText: {
    color: '#fff',
    fontWeight: '600',
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#097d4c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
