import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

export default function ConsultarDisponibilidade() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nutricionistasData, setNutricionistasData] = useState({});
  const [clienteIdLogado, setClienteIdLogado] = useState(null);

  // Busca usuário logado
  const fetchUsuarioLogado = async () => {
    try {
      const res = await fetch('http://localhost:5036/api/usuarios/logado');
      if (!res.ok) throw new Error('Erro ao buscar usuário logado');
      const usuario = await res.json();
      setClienteIdLogado(usuario.usuarioId || usuario.id); // ajuste conforme seu backend
    } catch (err) {
      console.error('Erro ao buscar usuário logado:', err);
    }
  };

  // Busca consultas do cliente logado para marcar datas no calendário
  const fetchDiasOcupados = async () => {
    try {
      const res = await fetch('http://localhost:5036/api/consultas');
      if (!res.ok) throw new Error('Erro ao buscar consultas');
      const todasConsultas = await res.json();

      // Filtra consultas só do cliente logado
      const consultasCliente = todasConsultas.filter(
        c => String(c.clienteId) === String(clienteIdLogado)
      );

      const datasMarcadas = {};
      consultasCliente.forEach(c => {
        const data = c.dataConsulta.split('T')[0];
        datasMarcadas[data] = {
          marked: true,
          dotColor: '#cc3b3b',
        };
      });

      setMarkedDates(datasMarcadas);
    } catch (err) {
      console.error('Erro ao buscar dias ocupados:', err);
    }
  };

  // Busca telefone do nutricionista (para exibir junto)
  const fetchTelefoneUsuario = async (usuarioId) => {
    try {
      const res = await fetch(`http://localhost:5036/api/usuarios/${usuarioId}`);
      if (!res.ok) throw new Error('Erro ao buscar usuário');
      const usuario = await res.json();
      return usuario.telefone || null;
    } catch (e) {
      console.error('Erro ao buscar telefone do usuário:', e);
      return null;
    }
  };

  // Busca dados do nutricionista e salva no estado para não buscar repetido
  const fetchDadosNutricionista = async (nutri) => {
    if (!nutri?.usuarioId) return null;

    if (nutricionistasData[nutri.usuarioId]) {
      return nutricionistasData[nutri.usuarioId];
    }

    try {
      const telefone = await fetchTelefoneUsuario(nutri.usuarioId);
      const dadosComTelefone = { ...nutri, telefone };
      setNutricionistasData(prev => ({
        ...prev,
        [nutri.usuarioId]: dadosComTelefone,
      }));
      return dadosComTelefone;
    } catch (e) {
      console.error('Erro ao buscar dados do nutricionista:', e);
      return null;
    }
  };

  // Busca consultas do cliente logado filtradas pela data selecionada
  const fetchConsultasPorData = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5036/api/consultas');
      if (!res.ok) throw new Error('Erro ao buscar consultas');
      const todasConsultas = await res.json();

      const consultasFiltradas = todasConsultas.filter(consulta => {
        const dataConsultaISO = consulta.dataConsulta ? consulta.dataConsulta.split('T')[0] : null;
        return (
          dataConsultaISO === data &&
          String(consulta.clienteId) === String(clienteIdLogado)
        );
      });

      await Promise.all(
        consultasFiltradas.map(async (consulta) => {
          if (consulta.nutricionista) {
            await fetchDadosNutricionista(consulta.nutricionista);
          }
        })
      );

      setConsultas(consultasFiltradas);
    } catch (e) {
      console.error('Erro ao buscar consultas:', e);
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day) => {
    const selected = day.dateString;
    setSelectedDate(selected);
    fetchConsultasPorData(selected);
  };

  useEffect(() => {
    fetchUsuarioLogado();
  }, []);

  useEffect(() => {
    if (clienteIdLogado !== null) {
      fetchDiasOcupados();
    }
  }, [clienteIdLogado]);

  if (clienteIdLogado === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#097d4c" />
        <Text>Carregando usuário...</Text>
      </View>
    );
  }

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
          ) : consultas.length > 0 ? (
            consultas.map((item, idx) => {
              const nutri = item.nutricionista;
              const dadosNutri = nutri && nutricionistasData[nutri.usuarioId];

              return (
                <View key={idx} style={[styles.timeSlot, styles.occupied]}>
                  <Ionicons name="person-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <View>
                    <Text style={[styles.timeText, { color: '#fff' }]}>Horário: {item.horaConsulta}</Text>
                    <Text style={styles.nutriName}>Nutricionista: {nutri?.nome || 'Desconhecido'}</Text>
                    {dadosNutri?.telefone && (
                      <Text style={styles.nutriName}>Telefone: {dadosNutri.telefone}</Text>
                    )}
                    {item.observacoes && (
                      <Text style={styles.nutriName}>Observações: {item.observacoes}</Text>
                    )}
                  </View>
                </View>
              );
            })
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
