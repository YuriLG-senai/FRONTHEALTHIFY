import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, FlatList, Alert, Animated, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

// --- Componente MenuButton ---
function MenuButton({ icon, label, onPress }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const handleHoverIn = () => Animated.spring(translateY, { toValue: -6, useNativeDriver: true }).start();
  const handleHoverOut = () => Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
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

export default function VerConsulta() {
  const [consultas, setConsultas] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // --- ESTADOS ATUALIZADOS ---
  const [clienteCpf, setClienteCpf] = useState('');
  const [nutricionistaCpf, setNutricionistaCpf] = useState(''); // Novo estado para o CPF do nutri
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newConsulta, setNewConsulta] = useState({
    DataConsulta: '',
    TipoConsulta: 'Online',
    Status: 'Agendada',
    Observacoes: '',
    HoraConsulta: '',
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
          marked[date] = { marked: true, dotColor: '#097d4c' };
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
    setNewConsulta((prev) => ({ ...prev, DataConsulta: day.dateString }));
  };

  const findIdByCpf = async (cpf, tipo) => {
    const endpoint = tipo === 'Clientes' ? `http://localhost:5036/api/Clientes/cpf/${cpf}` : `http://localhost:5036/api/Nutricionistas/cpf/${cpf}`;
    const tipoPessoa = tipo === 'Clientes' ? 'Cliente' : 'Nutricionista';
    
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        return tipo === 'Clientes' ? data.clienteId : data.nutricionistaId;
      }
      if (response.status === 404) return null;
      throw new Error(`Erro na resposta do servidor ao buscar ${tipoPessoa}.`);
    } catch (error) {
      console.error(`Erro ao buscar ${tipoPessoa} por CPF:`, error);
      Alert.alert('Erro de Rede', `Não foi possível verificar o CPF do ${tipoPessoa}. Tente novamente.`);
      return 'error';
    }
  };

  const handleCreateConsulta = async () => {
    if (!newConsulta.HoraConsulta || !isHorarioValido(newConsulta.HoraConsulta)) {
      Alert.alert('Horário Inválido', 'Por favor, insira um horário válido no formato HH:MM.');
      return;
    }
    if (!clienteCpf || clienteCpf.length !== 11) {
      Alert.alert('CPF Inválido', 'Por favor, insira o CPF do cliente com 11 dígitos.');
      return;
    }
    if (!nutricionistaCpf || nutricionistaCpf.length !== 11) {
      Alert.alert('CPF Inválido', 'Por favor, insira o CPF do nutricionista com 11 dígitos.');
      return;
    }

    setIsSubmitting(true);

    const clienteIdEncontrado = await findIdByCpf(clienteCpf, 'Clientes');
    if (clienteIdEncontrado === null || clienteIdEncontrado === 'error') {
      if (clienteIdEncontrado === null) Alert.alert('Cliente Não Encontrado', 'Nenhum cliente foi encontrado com o CPF informado.');
      setIsSubmitting(false);
      return;
    }

    const nutricionistaIdEncontrado = await findIdByCpf(nutricionistaCpf, 'Nutricionistas');
    if (nutricionistaIdEncontrado === null || nutricionistaIdEncontrado === 'error') {
      if (nutricionistaIdEncontrado === null) Alert.alert('Nutricionista Não Encontrado', 'Nenhum nutricionista foi encontrado com o CPF informado.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      clienteId: clienteIdEncontrado,
      nutricionistaId: nutricionistaIdEncontrado,
      dataConsulta: new Date(`${newConsulta.DataConsulta}T${newConsulta.HoraConsulta}:00`).toISOString(),
      horaConsulta: newConsulta.HoraConsulta,
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

      if (response.ok) {
        Alert.alert("Sucesso!", "Consulta criada com sucesso!");
        fetchConsultas();
        setIsCreating(false);
        setClienteCpf('');
        setNutricionistaCpf('');
        setNewConsulta({
          DataConsulta: '', TipoConsulta: 'Online', Status: 'Agendada',
          Observacoes: '', HoraConsulta: '',
        });
      } else {
        const responseText = await response.text();
        Alert.alert(`Erro ao criar consulta`, responseText);
      }
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      Alert.alert('Erro Inesperado', 'Não foi possível se conectar ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHorarioValido = (horario) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(horario);

  const handleHorarioChange = (text) => {
    const numeros = text.replace(/[^0-9]/g, '');
    let horarioFormatado = numeros;
    if (numeros.length > 2) {
      horarioFormatado = `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
    }
    setNewConsulta({ ...newConsulta, HoraConsulta: horarioFormatado });
  };

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/perfil' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
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
        <Text style={styles.titulo}>Consultas</Text>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{ ...markedDates, [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: '#097d4c' } }}
          theme={{ 
            todayTextColor: '#097d4c', 
            arrowColor: '#097d4c', 
            monthTextColor: '#097d4c',
            selectedDayBackgroundColor: '#097d4c',
            selectedDayTextColor: '#ffffff'
          }}
          style={styles.calendar}
        />
        <Pressable
          style={styles.createButton}
          onPress={() => {
            if (!selectedDate) {
              Alert.alert("Atenção", "Selecione um dia no calendário para agendar a nova consulta!");
              return;
            }
            setIsCreating(true);
          }}
        >
          <Text style={styles.createButtonText}>Agendar Nova Consulta</Text>
        </Pressable>
      </View>

      <Modal visible={isCreating} animationType="fade" transparent={true} onRequestClose={() => setIsCreating(false)}>
        <Pressable style={styles.modalContainer} onPress={() => setIsCreating(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Agendar Consulta</Text>
            <Text style={styles.modalLabel}>Data Selecionada</Text>
            <TextInput style={[styles.textInput, { backgroundColor: '#e9ecef', color: '#495057' }]} value={newConsulta.DataConsulta} editable={false} />
            
            <Text style={styles.modalLabel}>CPF do Cliente</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Digite os 11 dígitos do CPF"
              keyboardType="numeric"
              value={clienteCpf}
              onChangeText={setClienteCpf}
              maxLength={11}
            />
            
            <Text style={styles.modalLabel}>CPF do Nutricionista</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Digite os 11 dígitos do CPF"
              keyboardType="numeric"
              value={nutricionistaCpf}
              onChangeText={setNutricionistaCpf}
              maxLength={11}
            />

            <Text style={styles.modalLabel}>Horário (HH:MM)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 14:30"
              keyboardType="numeric"
              value={newConsulta.HoraConsulta}
              onChangeText={handleHorarioChange}
              maxLength={5}
            />
            
            <Text style={styles.modalLabel}>Observações</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Alguma observação sobre a consulta?"
              value={newConsulta.Observacoes}
              onChangeText={(text) => setNewConsulta({ ...newConsulta, Observacoes: text })}
              multiline
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setIsCreating(false)} disabled={isSubmitting}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.saveButton]} onPress={handleCreateConsulta} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Agendar</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Consultas em {selectedDate}</Text>
            <FlatList
              data={consultasDoDia}
              keyExtractor={(item) => item.consultaId.toString()}
              renderItem={({ item }) => (
                <View style={styles.consultaItem}>
                  <Text style={styles.modalText}>Cliente: {item.cliente?.usuario?.nome || 'Não informado'}</Text>
                  <Text style={styles.modalText}>Horário: {item.horaConsulta}</Text>
                  <Text style={styles.modalText}>Status: {item.status}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.modalText}>Nenhuma consulta agendada para este dia.</Text>}
            />
            <Pressable style={styles.fecharButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
    backgroundColor: '#f6eecf',
    paddingVertical: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0'
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    color: '#097d4c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calendar: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#097d4c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#097d4c',
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fecharButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  consultaItem: {
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});