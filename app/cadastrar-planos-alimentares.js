import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, Animated, Alert, ActivityIndicator, Modal, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componente do Botão do Menu (sem alterações)
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

const MultiSelectButtons = ({ options, selectedOptions, onSelectionChange }) => {
    const toggleSelection = (option) => {
        const isSelected = selectedOptions.includes(option);
        if (isSelected) {
            onSelectionChange(selectedOptions.filter(item => item !== option));
        } else {
            onSelectionChange([...selectedOptions, option]);
        }
    };

    return (
        <View style={styles.multiSelectContainer}>
            {options.map(option => (
                <TouchableOpacity
                    key={option}
                    style={[
                        styles.multiSelectButton,
                        selectedOptions.includes(option) && styles.multiSelectButtonSelected
                    ]}
                    onPress={() => toggleSelection(option)}
                >
                    <Text style={[
                        styles.multiSelectButtonText,
                        selectedOptions.includes(option) && styles.multiSelectButtonTextSelected
                    ]}>
                        {option}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};


export default function CriarPlanoAlimentar() {
  const router = useRouter();

  const [clienteCpf, setClienteCpf] = useState('');
  const [nutricionistaCpf, setNutricionistaCpf] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [nomePlano, setNomePlano] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [receitas, setReceitas] = useState([]);
  const [listaReceitas, setListaReceitas] = useState([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const diasDaSemanaOptions = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const refeicaoOptions = ['Café', 'Lanche', 'Almoço', 'Jantar', 'Ceia'];

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

  const adicionarReceita = () => {
    setReceitas([...receitas, { 
        receitaId: '', 
        quantidadePorcao: '', 
        diaSemana: [], 
        refeicao: [] 
    }]);
  };

  const removerReceita = (index) => {
    const novasReceitas = [...receitas];
    novasReceitas.splice(index, 1);
    setReceitas(novasReceitas);
  };

  const atualizarReceita = (index, campo, valor) => {
    const novasReceitas = [...receitas];
    novasReceitas[index][campo] = valor;
    setReceitas(novasReceitas);
  };

  const findIdByCpf = async (cpf, tipo) => {
    const endpoint = tipo === 'cliente' ? `http://localhost:5036/api/Clientes/cpf/${cpf}` : `http://localhost:5036/api/Nutricionistas/cpf/${cpf}`;
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        return tipo === 'cliente' ? data.clienteId : data.nutricionistaId;
      }
      if (response.status === 404) return null;
      throw new Error(`Erro na resposta do servidor ao buscar ${tipo}.`);
    } catch (error) {
      console.error(`Erro ao buscar ${tipo} por CPF:`, error);
      Alert.alert('Erro de Rede', `Não foi possível verificar o CPF do ${tipo}. Tente novamente.`);
      return 'error';
    }
  };

  // --- NOVA FUNÇÃO PARA FORMATAR A DATA ENQUANTO O UTILIZADOR DIGITA ---
  const formatDateInput = (text) => {
    const numeros = text.replace(/[^0-9]/g, '');
    let dataFormatada = numeros;
    if (numeros.length > 2) {
      dataFormatada = `${numeros.slice(0, 2)}-${numeros.slice(2)}`;
    }
    if (numeros.length > 4) {
      dataFormatada = `${numeros.slice(0, 2)}-${numeros.slice(2, 4)}-${numeros.slice(4, 8)}`;
    }
    return dataFormatada;
  };

  const handleDataInicioChange = (text) => {
    setDataInicio(formatDateInput(text));
  };

  const handleDataFimChange = (text) => {
    setDataFim(formatDateInput(text));
  };

  const salvarPlano = async () => {
    if (!clienteCpf || !nutricionistaCpf || !nomePlano || !dataInicio || !dataFim) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os dados principais do plano.');
      return;
    }

    setIsSaving(true);

    const clienteId = await findIdByCpf(clienteCpf, 'cliente');
    if (clienteId === null || clienteId === 'error') {
      if (clienteId === null) Alert.alert('Cliente Não Encontrado', 'Nenhum cliente foi encontrado com o CPF informado.');
      setIsSaving(false);
      return;
    }

    const nutricionistaId = await findIdByCpf(nutricionistaCpf, 'nutricionista');
    if (nutricionistaId === null || nutricionistaId === 'error') {
      if (nutricionistaId === null) Alert.alert('Nutricionista Não Encontrado', 'Nenhum nutricionista foi encontrado com o CPF informado.');
      setIsSaving(false);
      return;
    }

    // --- CONVERTE A DATA PARA O FORMATO DA API ANTES DE ENVIAR ---
    const [diaInicio, mesInicio, anoInicio] = dataInicio.split('-');
    const dataInicioFormatada = `${anoInicio}-${mesInicio}-${diaInicio}`;

    const [diaFim, mesFim, anoFim] = dataFim.split('-');
    const dataFimFormatada = `${anoFim}-${mesFim}-${diaFim}`;

    const payload = {
      clienteId,
      nutricionistaId,
      nomePlano,
      dataInicio: dataInicioFormatada,
      dataFim: dataFimFormatada,
      observacoes,
      receitas: receitas.map(r => ({
        receitaId: parseInt(r.receitaId),
        quantidadePorcao: parseInt(r.quantidadePorcao),
        diaSemana: r.diaSemana.join(','),
        refeicao: r.refeicao.join(','),
      })),
    };

    try {
      const response = await fetch('http://localhost:5036/api/PlanosAlimentares/com-receitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessModalVisible(true);
      } else {
        const errorText = await response.text();
        Alert.alert('Erro ao Salvar', `Não foi possível salvar o plano: ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    router.push('/dashnutri');
  };

  const menuItems = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/perfil' },
  ];

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
          <Text style={styles.backText}>Voltar ao Dashboard</Text>
        </Pressable>

        <Text style={styles.titulo}>Criar Novo Plano Alimentar</Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Dados Gerais do Plano</Text>
          <TextInput style={styles.input} placeholder="CPF do Cliente (apenas números)" keyboardType="numeric" value={clienteCpf} onChangeText={setClienteCpf} maxLength={11} />
          <TextInput style={styles.input} placeholder="CPF do Nutricionista (apenas números)" keyboardType="numeric" value={nutricionistaCpf} onChangeText={setNutricionistaCpf} maxLength={11} />
          <TextInput style={styles.input} placeholder="Nome do Plano (ex: Plano de Definição)" value={nomePlano} onChangeText={setNomePlano} />
          
          {/* --- INPUTS DE DATA ATUALIZADOS --- */}
          <TextInput style={styles.input} placeholder="Data de Início (DD-MM-AAAA)" keyboardType="numeric" value={dataInicio} onChangeText={handleDataInicioChange} maxLength={10} />
          <TextInput style={styles.input} placeholder="Data de Fim (DD-MM-AAAA)" keyboardType="numeric" value={dataFim} onChangeText={handleDataFimChange} maxLength={10} />
          
          <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Observações..." multiline value={observacoes} onChangeText={setObservacoes} />

          <Text style={styles.sectionTitle}>Receitas do Plano</Text>

          {receitas.map((receita, index) => (
            <View key={index} style={styles.receitaCard}>
              <View style={styles.receitaHeader}>
                <Text style={styles.receitaTitle}>Receita {index + 1}</Text>
                <Pressable onPress={() => removerReceita(index)}>
                    <Ionicons name="trash-outline" size={22} color="#c85c5c" />
                </Pressable>
              </View>
              
              <Text style={styles.pickerLabel}>Selecione uma Receita</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={receita.receitaId} onValueChange={val => atualizarReceita(index, 'receitaId', val)}>
                  <Picker.Item label="Selecione..." value="" />
                  {listaReceitas.map((r) => (
                    <Picker.Item key={r.receitaId} label={r.nome} value={r.receitaId} />
                  ))}
                </Picker>
              </View>

              <TextInput style={styles.input} placeholder="Quantidade de Porções" keyboardType="numeric" value={receita.quantidadePorcao} onChangeText={val => atualizarReceita(index, 'quantidadePorcao', val)} />
              
              <Text style={styles.pickerLabel}>Dias da Semana</Text>
              <MultiSelectButtons 
                options={diasDaSemanaOptions}
                selectedOptions={receita.diaSemana}
                onSelectionChange={(newSelection) => atualizarReceita(index, 'diaSemana', newSelection)}
              />

              <Text style={styles.pickerLabel}>Tipos de Refeição</Text>
               <MultiSelectButtons 
                options={refeicaoOptions}
                selectedOptions={receita.refeicao}
                onSelectionChange={(newSelection) => atualizarReceita(index, 'refeicao', newSelection)}
              />
            </View>
          ))}

          <Pressable style={styles.addButton} onPress={adicionarReceita}>
            <Ionicons name="add-circle-outline" size={22} color="#097d4c" />
            <Text style={styles.addButtonText}>Adicionar Receita</Text>
          </Pressable>

          <Pressable style={styles.saveButton} onPress={salvarPlano} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar Plano Completo</Text>}
          </Pressable>
        </ScrollView>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={80} color="#fff" />
            </View>
            <Text style={styles.successModalTitle}>Sucesso!</Text>
            <Text style={styles.successModalText}>O plano alimentar foi cadastrado com sucesso.</Text>
            <Pressable style={styles.successModalButton} onPress={handleCloseSuccessModal}>
              <Text style={styles.buttonText}>Voltar ao Dashboard</Text>
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
  },
  scroll: {
    marginTop: 15,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#097d4c',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#097d4c',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    marginLeft: 5,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  receitaCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 16,
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  receitaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  receitaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#e8f5e9',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#097d4c',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#097d4c',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#097d4c',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#097d4c',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rightMenu: {
    width: 220,
    backgroundColor: '#f6eecf',
    paddingVertical: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
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
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  multiSelectButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
  },
  multiSelectButtonSelected: {
    backgroundColor: '#097d4c',
    borderColor: '#097d4c',
  },
  multiSelectButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  multiSelectButtonTextSelected: {
    color: '#fff',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    width: '90%',
    maxWidth: 320,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#097d4c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  successModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  successModalButton: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
});
