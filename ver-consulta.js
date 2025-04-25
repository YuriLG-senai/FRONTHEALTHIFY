import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, FlatList, Alert, Picker } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newConsulta, setNewConsulta] = useState({
    ClienteId: '',
    NutricionistaId: '',
    DataConsulta: '',
    TipoConsulta: 'Online', // Valor inicial do Tipo de Consulta
    Status: 'Agendada', // Valor inicial do Status
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
      const consultasArray = Array.isArray(data) ? data : [data];
      setConsultas(consultasArray);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    }
  };

  const consultasDoDia = consultas.filter((c) => {
    if (!c.dataConsulta) return false;
    const data = new Date(c.dataConsulta);
    if (isNaN(data)) return false;
    return data.toISOString().split('T')[0] === selectedDate;
  });

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setNewConsulta((prev) => ({
      ...prev,
      DataConsulta: new Date(day.dateString).toISOString(),
    }));
    setIsCreating(true);
  };

  const handleCreateConsulta = async () => {
    const payload = {
      Cliente: newConsulta.ClienteId,  // Alterado para "Cliente"
      Nutricionista: newConsulta.NutricionistaId,  // Alterado para "Nutricionista"
      DataConsulta: newConsulta.DataConsulta,
      TipoConsulta: newConsulta.TipoConsulta,
      Status: newConsulta.Status,
      Observacoes: newConsulta.Observacoes
    };
  
    console.log(payload);  // Verifique no console se os valores de Cliente e Nutricionista estão corretos
  
    try {
      const response = await fetch('http://localhost:5036/api/Consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Envia os dados como JSON
      });
  
      const responseText = await response.text();
      console.log("Resposta do servidor:", responseText);
  
      if (response.ok) {
        alert("Consulta criada com sucesso!");
        fetchConsultas();  // Atualiza a lista de consultas
        setIsCreating(false);  // Fecha o modal de criação da consulta
      } else {
        alert(`Erro ao criar consulta: ${responseText}`);
      }
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      alert('Erro inesperado ao criar consulta');
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

      <Modal visible={isCreating} animationType="slide" transparent={true} onRequestClose={() => setIsCreating(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Nova Consulta</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Cliente Id"
              keyboardType="numeric"
              value={newConsulta.ClienteId}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, ClienteId: text })}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Nutricionista Id"
              keyboardType="numeric"
              value={newConsulta.NutricionistaId}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, NutricionistaId: text })}
            />

            {/* Picker para Tipo de Consulta */}
            <Text style={styles.pickerLabel}>Tipo de Consulta</Text>
            <Picker
              selectedValue={newConsulta.TipoConsulta}
              style={styles.picker}
              onValueChange={(itemValue) => setNewConsulta({ ...newConsulta, TipoConsulta: itemValue })}
            >
              <Picker.Item label="Online" value="Online" />
              <Picker.Item label="Presencial" value="Presencial" />
            </Picker>

            {/* Picker para Status */}
            <Text style={styles.pickerLabel}>Status</Text>
            <Picker
              selectedValue={newConsulta.Status}
              style={styles.picker}
              onValueChange={(itemValue) => setNewConsulta({ ...newConsulta, Status: itemValue })}
            >
              <Picker.Item label="Agendada" value="Agendada" />
              <Picker.Item label="Concluída" value="Concluída" />
              <Picker.Item label="Cancelada" value="Cancelada" />
            </Picker>

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

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
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
  pickerLabel: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
    color: '#097d4c',
  },
  picker: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
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
