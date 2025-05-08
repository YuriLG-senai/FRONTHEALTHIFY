import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

export default function ConsultarDisponibilidade() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [diasIndisponiveis, setDiasIndisponiveis] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [nutricionistaData, setNutricionistaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nutricionistaId] = useState(1);

  useEffect(() => {
    fetchDiasOcupados(nutricionistaId);
  }, [nutricionistaId]);

  const fetchDiasOcupados = async (id) => {
    try {
      const res = await fetch('http://localhost:5036/api/consultas/dias-indisponiveis/' + id);
      const dias = await res.json();

      const datasFormatadas = dias.map(dia =>
        dia.length === 10 ? dia : new Date(dia).toISOString().split('T')[0]
      );

      setDiasIndisponiveis(datasFormatadas);
      atualizarMarcacoes(selectedDate, datasFormatadas);
    } catch (err) {
      console.error('Erro ao buscar dias ocupados:', err);
    }
  };

  const atualizarMarcacoes = (dataSelecionada, dias = diasIndisponiveis) => {
    const novaMarcacao = {};

    dias.forEach((dia) => {
      if (dia !== dataSelecionada) {
        novaMarcacao[dia] = {
          marked: true,
          dotColor: '#cc3b3b',
        };
      }
    });

    if (dataSelecionada) {
      novaMarcacao[dataSelecionada] = {
        selected: true,
        selectedColor: '#097d4c',
        selectedTextColor: '#fff',
      };
    }

    setMarkedDates(novaMarcacao);
  };

  const fetchHorariosOcupados = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5036/api/consultas/horarios-ocupados?data=' + data);
      const horarios = await res.json();
      setHorariosOcupados(horarios);

      if (horarios.length > 0 && horarios[0].nutricionistaId) {
        fetchNutricionistaData(horarios[0].nutricionistaId);
      } else {
        setNutricionistaData(null);
      }
    } catch (e) {
      console.error('Erro ao buscar horários:', e);
      setHorariosOcupados([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNutricionistaData = async (id) => {
    try {
      const res = await fetch('http://localhost:5036/api/nutricionistas/' + id);
      const data = await res.json();
      setNutricionistaData(data);
    } catch (e) {
      console.error('Erro ao buscar dados do nutricionista:', e);
      setNutricionistaData(null);
    }
  };

  const handleDateSelect = (day) => {
    const selected = day.dateString;
    setSelectedDate(selected);
    fetchHorariosOcupados(selected);
    atualizarMarcacoes(selected);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Quadro de Horários</Text>
      <Text style={styles.subtitle}>Selecione uma data marcada para ver os horários.</Text>

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: '#097d4c',
          todayTextColor: '#097d4c',
          arrowColor: '#097d4c',
          monthTextColor: '#097d4c',
        }}
        enableSwipeMonths
      />

      {selectedDate && (
        <ScrollView contentContainerStyle={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Consultas em {selectedDate}</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#097d4c" />
          ) : horariosOcupados.length > 0 ? (
            horariosOcupados.map((item, idx) => (
              <View key={idx} style={[styles.timeSlot, styles.occupied]}>
                <Ionicons name="person-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                <View>
                  <Text style={[styles.timeText, { color: '#fff' }]}>Horário: {item.hora}</Text>
                  <Text style={styles.nutriName}>Nutricionista: {item.nutricionistaNome}</Text>
                  {item.nutricionistaTelefone && (
                    <Text style={styles.nutriName}>Contato: {item.nutricionistaTelefone}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyMessage}>Nenhuma consulta marcada neste dia.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

export const options = {
  headerShown: false,
};

const styles = StyleSheet.create({
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
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scheduleContainer: {
    paddingBottom: 20,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 6,
    marginHorizontal: 12,
  },
  occupied: {
    backgroundColor: '#097d4c',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nutriName: {
    fontSize: 12,
    color: '#f0f0f0',
    fontStyle: 'italic',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
  },
});
