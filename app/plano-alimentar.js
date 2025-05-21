import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
export const options = {
  headerShown: false, 
};
const PlanoAlimentar = () => {
  const router = useRouter();

  const [dadosPlano, setDadosPlano] = useState([
    {
      id: '1',
      nome: 'Café da manhã',
      horario: '08:00 AM',
      alimentos: 'Ovos, Pão integral, Suco de laranja',
    },
    {
      id: '2',
      nome: 'Almoço',
      horario: '12:00 PM',
      alimentos: 'Frango grelhado, Arroz integral, Salada de folhas',
    },
    {
      id: '3',
      nome: 'Lanche da tarde',
      horario: '15:00 PM',
      alimentos: 'Iogurte com granola',
    },
    {
      id: '4',
      nome: 'Jantar',
      horario: '19:00 PM',
      alimentos: 'Peixe assado, Legumes cozidos',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [novaRefeicao, setNovaRefeicao] = useState({
    nome: '',
    horario: '',
    alimentos: '',
    periodo: 'AM',
  });

  const handleAdicionarRefeicao = () => {
    if (novaRefeicao.nome && novaRefeicao.horario && novaRefeicao.alimentos) {
      setDadosPlano([
        ...dadosPlano,
        {
          id: (dadosPlano.length + 1).toString(),
          nome: novaRefeicao.nome,
          horario: novaRefeicao.horario + ' ' + novaRefeicao.periodo,
          alimentos: novaRefeicao.alimentos,
        },
      ]);
      setModalVisible(false);
      setNovaRefeicao({ nome: '', horario: '', alimentos: '', periodo: 'AM' });
    } else {
      alert('Por favor, preencha todos os campos');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.titulo}>{item.nome}</Text>
      <Text style={styles.horario}>{item.horario}</Text>
      <Text style={styles.alimentos}>{item.alimentos}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.tituloPagina}>Plano Alimentar</Text>
      <FlatList
        data={dadosPlano}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity style={styles.botao} onPress={() => setModalVisible(true)}>
        <Text style={styles.textoBotao}>Adicionar Nova Refeição</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voltarBotao} onPress={() => router.back()}>
        <Text style={styles.textoBotao}>Voltar para Dashboard</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Adicionar Refeição</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Refeição"
              value={novaRefeicao.nome}
              onChangeText={(text) => setNovaRefeicao({ ...novaRefeicao, nome: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Horário (ex: 08:00)"
              value={novaRefeicao.horario}
              keyboardType="numeric"
              onChangeText={(text) => setNovaRefeicao({ ...novaRefeicao, horario: text })}
            />
            <Picker
              selectedValue={novaRefeicao.periodo}
              style={styles.picker}
              onValueChange={(itemValue) => setNovaRefeicao({ ...novaRefeicao, periodo: itemValue })}
            >
              <Picker.Item label="Manhã (AM)" value="AM" />
              <Picker.Item label="Tarde (PM)" value="PM" />
              <Picker.Item label="Noite (PM)" value="PM" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Alimentos"
              value={novaRefeicao.alimentos}
              onChangeText={(text) => setNovaRefeicao({ ...novaRefeicao, alimentos: text })}
            />
            <Button title="Adicionar" onPress={handleAdicionarRefeicao} color="#097d4c" />
            <Button title="Fechar" color="gray" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6eecf',
  },
  tituloPagina: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  horario: {
    fontSize: 16,
    color: '#777',
    marginVertical: 5,
  },
  alimentos: {
    fontSize: 14,
    color: '#555',
  },
  botao: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  voltarBotao: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
});

export default PlanoAlimentar;