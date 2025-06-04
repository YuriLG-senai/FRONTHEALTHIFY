import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';


export default function CriarPlanoAlimentar() {
  const router = useRouter();

  const [clienteId, setClienteId] = useState('');
  const [nutricionistaId, setNutricionistaId] = useState('');
  const [nomePlano, setNomePlano] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [receitas, setReceitas] = useState([]);
  const [listaReceitas, setListaReceitas] = useState([]);


  const adicionarReceita = () => {
    setReceitas([
      ...receitas,
      {
        receitaId: '',
        quantidadePorcao: '',
        diaSemana: '',
        refeicao: '',
      },
    ]);
  };

  const atualizarReceita = (index, campo, valor) => {
    const novasReceitas = [...receitas];
    novasReceitas[index][campo] = valor;
    setReceitas(novasReceitas);
  };


useEffect(() => {
  const buscarReceitas = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Receitas');
      const data = await response.json();
      setListaReceitas(data);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    }
  };

  buscarReceitas();
}, []);


  const salvarPlano = async () => {
    const payload = {
      clienteId: parseInt(clienteId),
      nutricionistaId: parseInt(nutricionistaId),
      nomePlano,
      dataInicio,
      dataFim,
      observacoes,
      receitas: receitas.map(r => ({
        receitaId: parseInt(r.receitaId),
        quantidadePorcao: parseInt(r.quantidadePorcao),
        diaSemana: r.diaSemana,
        refeicao: r.refeicao,
      })),
    };

    try {
      const response = await fetch('http://localhost:5036/api/PlanosAlimentares/com-receitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Plano alimentar salvo com sucesso!');
        router.push('/dashnutri');
      } else {
        alert('Erro ao salvar plano alimentar');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor');
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
      <View style={styles.rightMenu}>
        {menuItems.map((item, index) => (
          <MenuButton key={index} icon={item.icon} label={item.label} onPress={() => router.push(item.route)} />
        ))}
      </View>

      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Sair / Voltar</Text>
        </Pressable>

        <Text style={styles.titulo}>Criar Plano Alimentar</Text>

        <ScrollView style={styles.scroll}>
          <TextInput style={styles.input} placeholder="ID do Cliente" keyboardType="numeric" value={clienteId} onChangeText={setClienteId} />
          <TextInput style={styles.input} placeholder="ID do Nutricionista" keyboardType="numeric" value={nutricionistaId} onChangeText={setNutricionistaId} />
          <TextInput style={styles.input} placeholder="Nome do Plano" value={nomePlano} onChangeText={setNomePlano} />
          <TextInput style={styles.input} placeholder="Data de Início (YYYY-MM-DD)" value={dataInicio} onChangeText={setDataInicio} />
          <TextInput style={styles.input} placeholder="Data de Fim (YYYY-MM-DD)" value={dataFim} onChangeText={setDataFim} />
          <TextInput style={[styles.input, { height: 100 }]} placeholder="Observações" multiline value={observacoes} onChangeText={setObservacoes} />

          <Text style={styles.sectionTitle}>Receitas</Text>

          {receitas.map((receita, index) => (
            <View key={index} style={styles.receitaCard}>
              <Text style={{ marginBottom: 4, color: '#097d4c' }}>Selecione uma Receita</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={receita.receitaId}
                  onValueChange={val => atualizarReceita(index, 'receitaId', val)}
                >
                  <Picker.Item label="Selecione uma receita..." value="" />
                  {listaReceitas.map((r) => (
                    <Picker.Item key={r.receitaId} label={r.nome} value={r.receitaId} />
                  ))}
                </Picker>
              </View>

              <TextInput style={styles.input} placeholder="Quantidade de Porções" keyboardType="numeric" value={receita.quantidadePorcao} onChangeText={val => atualizarReceita(index, 'quantidadePorcao', val)} />
              <TextInput style={styles.input} placeholder="Dia da Semana" value={receita.diaSemana} onChangeText={val => atualizarReceita(index, 'diaSemana', val)} />
              <TextInput style={styles.input} placeholder="Refeição (ex: Almoço)" value={receita.refeicao} onChangeText={val => atualizarReceita(index, 'refeicao', val)} />
            </View>
          ))}

          <Pressable style={[styles.button, { backgroundColor: '#ccc' }]} onPress={adicionarReceita}>
            <Text style={styles.buttonText}>+ Adicionar Receita</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={salvarPlano}>
            <Text style={styles.buttonText}>Salvar Plano</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const menuItems = [
  { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
  { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
  { icon: 'restaurant-outline', label: 'Cadastrar Planos Alimentares', route: '/cadastrar-planos-alimentares' },
  { icon: 'book-outline', label: 'Cadastrar Receitas', route: '/cadastrar-receitas' },
  { icon: 'person-circle-outline', label: 'Perfil', route: '/perfil' },
];

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6eecf',
    padding: 20,
  },
  scroll: {
    marginTop: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#097d4c',
    marginTop: 20,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },  
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  receitaCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#097d4c',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#097d4c',
    fontSize: 16,
    marginLeft: 8,
  },
  rightMenu: {
    width: 220,
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
  },
});
