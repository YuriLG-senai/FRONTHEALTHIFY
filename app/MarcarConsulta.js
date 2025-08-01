import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConsultarDisponibilidade() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nutricionistasData, setNutricionistasData] = useState({});
  const [clienteIdLogado, setClienteIdLogado] = useState(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  const fetchUsuarioLogado = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const res = await fetch('http://localhost:5036/api/Usuarios/logado', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Erro ao buscar usuário logado');
      const usuario = await res.json();

      const clienteId = await fetchClienteIdPorUsuario(usuario.usuarioId);
      setClienteIdLogado(clienteId);
    } catch (err) {
      console.error('Erro ao buscar usuário logado:', err);
    }
  };

  const fetchClienteIdPorUsuario = async (usuarioId) => {
    try {
      const res = await fetch(`http://localhost:5036/api/Usuarios/Clientes/usuario/${usuarioId}`);
      if (!res.ok) throw new Error('Erro ao buscar cliente pelo usuário');
      const cliente = await res.json();
      return cliente.clienteId;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const fetchDiasOcupados = async () => {
    try {
      const res = await fetch('http://localhost:5036/api/consultas');
      if (!res.ok) throw new Error('Erro ao buscar consultas');
      const todasConsultas = await res.json();

      const consultasCliente = todasConsultas.filter(
        c => String(c.clienteId) === String(clienteIdLogado)
      );

      const datasMarcadas = {};

      consultasCliente.forEach(c => {
        const data = c.dataConsulta.split('T')[0];
        datasMarcadas[data] = {
          marked: true,
          dotColor: '#cc3b3b',
          selected: selectedDate === data,
        };
      });

      setMarkedDates(datasMarcadas);
    } catch (err) {
      console.error('Erro ao buscar dias ocupados:', err);
    }
  };

  // Esta função pode ser simplificada ou removida se o GET principal já traz o telefone
  const fetchDadosNutricionista = async (nutri) => {
    if (!nutri?.usuario?.telefone) { // Verifica se o telefone já veio na consulta
        if (nutricionistasData[nutri.nutricionistaId]) {
            return nutricionistasData[nutri.nutricionistaId];
        }
        // Se não veio, busca separadamente (lógica de fallback)
        try {
            const res = await fetch(`http://localhost:5036/api/Usuarios/${nutri.usuarioId}`);
            if (!res.ok) return nutri;
            const usuario = await res.json();
            const dadosCompletos = { ...nutri, usuario: {...nutri.usuario, telefone: usuario.telefone } };
            setNutricionistasData(prev => ({...prev, [nutri.nutricionistaId]: dadosCompletos }));
            return dadosCompletos;
        } catch (e) {
            return nutri;
        }
    }
    return nutri;
  };

  const fetchConsultasPorData = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5036/api/Consultas');
      if (!res.ok) throw new Error('Erro ao buscar consultas');
      const todasConsultas = await res.json();

      const consultasFiltradas = todasConsultas.filter(consulta => {
        const dataConsultaISO = consulta.dataConsulta ? consulta.dataConsulta.split('T')[0] : null;
        return (
          dataConsultaISO === data &&
          String(consulta.clienteId) === String(clienteIdLogado)
        );
      });
      
      // Processa os dados para garantir que o estado local (nutricionistasData) seja preenchido
      const consultasProcessadas = await Promise.all(
        consultasFiltradas.map(async (consulta) => {
          if (consulta.nutricionista) {
            const nutriCompleto = await fetchDadosNutricionista(consulta.nutricionista);
            return { ...consulta, nutricionista: nutriCompleto };
          }
          return consulta;
        })
      );

      setConsultas(consultasProcessadas);
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
    
    setMarkedDates(prev => {
        const newMarked = {...prev};
        Object.keys(newMarked).forEach(date => {
            newMarked[date].selected = false;
        });
        newMarked[selected] = {
            ...newMarked[selected],
            selected: true,
            selectedColor: '#097d4c'
        };
        return newMarked;
    });

    fetchConsultasPorData(selected);
  };

  useEffect(() => {
    fetchUsuarioLogado();
  }, []);

  useEffect(() => {
    if (clienteIdLogado !== null && clienteIdLogado !== undefined) {
      const loadInitialData = async () => {
        setIsLoadingCalendar(true);
        await fetchDiasOcupados();
        setIsLoadingCalendar(false);
      };
      loadInitialData();
    }
  }, [clienteIdLogado]);

  if (clienteIdLogado === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#097d4c" />
        <Text style={styles.loadingText}>Carregando usuário...</Text>
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

      {isLoadingCalendar ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#097d4c" />
            <Text style={styles.loadingText}>Carregando suas consultas...</Text>
        </View>
      ) : (
        <>
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

            {Object.keys(markedDates).length === 0 && !selectedDate && (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="calendar-outline" size={60} color="#b0b0b0" />
                    <Text style={styles.emptyStateText}>Nenhuma consulta agendada</Text>
                    <Text style={styles.emptyStateSubText}>
                        Quando você agendar uma nova consulta, ela aparecerá marcada aqui.
                    </Text>
                </View>
            )}

            {selectedDate && (
                <ScrollView contentContainerStyle={styles.scheduleContainer}>
                    <Text style={styles.scheduleTitle}>Consultas em {selectedDate}</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#097d4c" />
                    ) : consultas.length > 0 ? (
                        consultas.map((item, idx) => {
                            const nutri = item.nutricionista;
                            // --- CORREÇÃO APLICADA AQUI ---
                            // O nome e o telefone agora estão dentro do objeto 'usuario'
                            const nomeNutri = nutri?.usuario?.nome || 'Desconhecido';
                            const telefoneNutri = nutri?.usuario?.telefone;

                            return (
                                <View key={idx} style={[styles.timeSlot, styles.occupied]}>
                                    <Ionicons name="person-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                                    <View>
                                        <Text style={[styles.timeText, { color: '#fff' }]}>Horário: {item.horaConsulta}</Text>
                                        <Text style={styles.nutriName}>Nutricionista: {nomeNutri}</Text>
                                        {telefoneNutri && (
                                            <Text style={styles.nutriName}>Telefone: {telefoneNutri}</Text>
                                        )}
                                        {item.observacoes && (
                                            <Text style={styles.nutriName}>Observações: {item.observacoes}</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyMessage}>Nenhuma consulta marcada para este dia.</Text>
                    )}
                </ScrollView>
            )}
        </>
      )}
    </View>
  );
}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 30,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    marginTop: 15,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
    textAlign: 'center',
  },
});
