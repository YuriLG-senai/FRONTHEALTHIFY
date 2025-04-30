import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { format, zonedTimeToUtc } from 'date-fns-tz';

export default function ConsultarDisponibilidade() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nutricionistaId, setNutricionistaId] = useState(1); // Definindo o ID do nutricionista

  useEffect(() => {
    // Chama a função que busca os dias ocupados ao carregar o componente
    fetchDiasOcupados(nutricionistaId);
  }, [nutricionistaId]);

  const fetchDiasOcupados = async (id) => {
    try {
      const response = await fetch(`http://SEU_BACKEND/api/consultas/dias-indisponiveis/${id}`);
      const dias = await response.json();

      const datasMarcadas = {};
      dias.forEach(dia => {
        datasMarcadas[dia] = {
          marked: true,
          dotColor: 'red',
        };
      });

      setMarkedDates(datasMarcadas);
    } catch (error) {
      console.error('Erro ao buscar dias ocupados:', error);
    }
  };

  const fetchHorariosOcupados = async (data) => {
    if (!nutricionistaId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://SEU_BACKEND/api/consultas/horarios-ocupados/${nutricionistaId}?data=${data}`);
      const horarios = await response.json();
      setHorariosOcupados(horarios);
    } catch (error) {
      console.error('Erro ao buscar horários ocupados:', error);
      setHorariosOcupados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day) => {
    const dataSelecionada = day.dateString;
    setSelectedDate(dataSelecionada);
    fetchHorariosOcupados(dataSelecionada);

    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach(key => {
      if (newMarked[key]?.selected) delete newMarked[key].selected;
    });

    newMarked[dataSelecionada] = {
      ...(newMarked[dataSelecionada] || {}),
      selected: true,
      selectedColor: '#097d4c',
      selectedTextColor: '#fff',
    };

    setMarkedDates(newMarked);
  };

  const handleTimeSelect = (hour) => {
    // Definir o fuso horário local
    const timeZone = 'America/Sao_Paulo';

    // Criar a string de data e hora usando o horário selecionado
    const dateTimeLocal = `${selectedDate} ${hour}`;

    // Converter a hora local para UTC com o fuso horário correto
    const dateTimeUtc = zonedTimeToUtc(dateTimeLocal, timeZone);

    // Formatar para o formato correto (YYYY-MM-DD HH:mm:00)
    const dateTimeFormatted = format(dateTimeUtc, 'yyyy-MM-dd HH:mm:ss');

    console.log('Data e hora enviada para o backend:', dateTimeFormatted);

    // Enviar para o backend
    fetch("http://SEU_BACKEND/api/consultas", {
        method: "POST",
        body: JSON.stringify({
            // Aqui você envia o horário no formato local correto
            dataConsulta: dateTimeFormatted,
            nutricionistaId: nutricionistaId
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        // Lógica após o envio do horário
    })
    .catch(error => console.error("Erro ao enviar consulta:", error));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Consultar Disponibilidade</Text>
      <Text style={styles.subtitle}>Escolha uma data para ver os horários ocupados.</Text>

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        monthFormat={'yyyy MM'}
        style={styles.calendar}
      />

      {selectedDate && (
        <View style={styles.card}>
          <Ionicons name="time" size={64} color="#097d4c" />
          <Text style={styles.cardText}>Horários ocupados em {selectedDate}:</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#097d4c" style={{ marginTop: 12 }} />
          ) : horariosOcupados.length > 0 ? (
            horariosOcupados.map((hora, index) => (
              <TouchableOpacity key={index} onPress={() => handleTimeSelect(hora)}>
                <Text style={styles.cardText}>{hora}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.cardText}>Nenhum horário ocupado.</Text>
          )}
        </View>
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
    padding: 24,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    color: '#097d4c',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  calendar: {
    width: '100%',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    marginTop: 30,
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
