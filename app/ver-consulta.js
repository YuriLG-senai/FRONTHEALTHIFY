import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, FlatList, Alert, Animated } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function VerConsulta() {
  const [consultas, setConsultas] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newConsulta, setNewConsulta] = useState({
    ClienteId: '',
    NutricionistaId: '',
    DataConsulta: '',
    TipoConsulta: 'Online',
    Status: 'Agendada',
    Observacoes: '',
    HoraConsulta: '', // Adicionando a hora da consulta
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
      const marked = {};
      consultasArray.forEach((c) => {
        if (c.dataConsulta) {
          const date = new Date(c.dataConsulta).toISOString().split('T')[0];
          marked[date] = {
            marked: true,
            selectedColor: '#097d4c',
            dotColor: '#097d4c',
          };
        }
      });
      setMarkedDates(marked);
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
    setModalVisible(true);
    setNewConsulta((prev) => ({
      ...prev,
      DataConsulta: day.dateString,
    }));
  };

  const handleCreateConsulta = async () => {
    if (!selectedTime) {
      alert('Selecione um horário para a consulta!');
      return;
    }

    const payload = {
      clienteId: parseInt(newConsulta.ClienteId),
      nutricionistaId: parseInt(newConsulta.NutricionistaId),
      dataConsulta: new Date(`${newConsulta.DataConsulta}T${selectedTime}`).toISOString(), // Incluindo hora
      tipoConsulta: newConsulta.TipoConsulta,
      status: newConsulta.Status,
      observacoes: newConsulta.Observacoes,
    };

    try {
      const response = await fetch('http://localhost:5036/api/Consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Resposta do servidor:", responseText);

      if (response.ok) {
        alert("Consulta criada com sucesso!");
        fetchConsultas();
        setIsCreating(false);
      } else {
        alert(`Erro ao criar consulta: ${responseText}`);
      }
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      alert('Erro inesperado ao criar consulta');
    }
  };

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Cadastrar Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Cadastrar Receitas', route: '/cadastrar-receitas' },
    { icon: 'chatbubble-ellipses-outline', label: 'Chat com Cliente', route: '/chat-com-cliente' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
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

      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Sair / Voltar</Text>
        </Pressable>

        <Text style={styles.titulo}>Consultas</Text>

        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#097d4c',
              selectedTextColor: '#fff',
            },
          }}
          theme={{
            todayTextColor: '#097d4c',
            selectedDayBackgroundColor: '#097d4c',
            selectedDayTextColor: '#fff',
            arrowColor: '#097d4c',
            monthTextColor: '#097d4c',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />

        <Pressable
          style={styles.createButton}
          onPress={() => {
            if (!selectedDate) {
              alert("Selecione um dia no calendário primeiro!");
              return;
            }
            setIsCreating(true);
            setModalVisible(false); // Garante que o outro modal feche
          }}
        >
          <Text style={styles.createButtonText}>Nova Consulta</Text>
        </Pressable>
      </View>

      {/* Modal de criação */}
      <Modal visible={isCreating} animationType="slide" transparent={true} onRequestClose={() => setIsCreating(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Nova Consulta</Text>

            <TextInput style={[styles.textInput, { backgroundColor: '#eee' }]} value={newConsulta.DataConsulta} editable={false} />

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

            <Text style={styles.pickerLabel}>Tipo de Consulta</Text>
            <Picker
              selectedValue={newConsulta.TipoConsulta}
              style={styles.picker}
              onValueChange={(itemValue) => setNewConsulta({ ...newConsulta, TipoConsulta: itemValue })}
            >
              <Picker.Item label="Online" value="Online" />
              <Picker.Item label="Presencial" value="Presencial" />
            </Picker>

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

            <Text style={styles.pickerLabel}>Horário</Text>
            <Picker
              selectedValue={selectedTime}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedTime(itemValue)}
            >
              <Picker.Item label="09:00 - 10:00" value="09:00" />
              <Picker.Item label="14:00 - 15:00" value="14:00" />
              <Picker.Item label="16:00 - 17:00" value="16:00" />
            </Picker>

            <TextInput
              style={styles.textInput}
              placeholder="Observações"
              value={newConsulta.Observacoes}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, Observacoes: text })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Pressable style={[styles.button, { flex: 1, marginRight: 5 }]} onPress={handleCreateConsulta}>
                <Text style={styles.buttonText}>Criar Consulta</Text>
              </Pressable>
              <Pressable style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]} onPress={() => setIsCreating(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Consultas do Dia */}
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
                  <Text style={styles.modalText}>Observações: {item.observacoes}</Text>
                  <Text style={styles.modalText}>Horário: {new Date(item.dataConsulta).toLocaleTimeString()}</Text>
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
  calendar: {
    flex: 1,
    marginTop: 20,
    height: '80%',
    borderRadius: 10,
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
    marginBottom: 20,
  },
  backText: {
    marginLeft: 5,
    color: '#097d4c',
    fontWeight: 'bold',
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#097d4c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 8,
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#097d4c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  fecharButton: {
    backgroundColor: '#097d4c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  consultaItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
});
