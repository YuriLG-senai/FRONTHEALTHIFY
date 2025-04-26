import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

export default function ConsultarDisponibilidade() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(null);

  // Função para lidar com a seleção de uma data
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Consultar Disponibilidade</Text>
      <Text style={styles.subtitle}>Escolha uma data para ver os horários disponíveis.</Text>

      {/* Calendário interativo */}
      <Calendar
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#097d4c',
            selectedTextColor: '#fff',
          },
        }}
        onDayPress={handleDateSelect}
        monthFormat={'yyyy MM'}
        style={styles.calendar}
      />

      {/* Card informativo sobre horários */}
      {selectedDate && (
        <View style={styles.card}>
          <Ionicons name="time" size={64} color="#097d4c" />
          <Text style={styles.cardText}>
            Horários disponíveis para {selectedDate}:
          </Text>
          <Text style={styles.cardText}>09:00 - 10:00</Text>
          <Text style={styles.cardText}>14:00 - 15:00</Text>
          <Text style={styles.cardText}>16:00 - 17:00</Text>
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
