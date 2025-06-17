import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';

export const options = {
  headerShown: false,
};

const Hidratacao = () => {
  const router = useRouter();


  const [inputAgua, setInputAgua] = useState('');
  const [totalAgua, setTotalAgua] = useState(0);
  const [metaDiaria, setMetaDiaria] = useState(null);
  const [peso, setPeso] = useState('');
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [mensagemExagero, setMensagemExagero] = useState('');


  const [historico, setHistorico] = useState({});


  const hoje = (() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  })();

  const registrarAgua = () => {
    const quantidade = parseInt(inputAgua);
    if (isNaN(quantidade) || quantidade <= 0) {
      alert('Por favor, insira uma quantidade válida em ml.');
      return;
    }

    const novoTotal = totalAgua + quantidade;

    let exageroAtual = false;
    if (metaDiaria !== null && novoTotal > metaDiaria + 1000) {
      setMensagemExagero('⚠️ Cuidado! Ingestão muito alta pode ser prejudicial.');
      exageroAtual = true;
    } else if (metaDiaria === null && novoTotal > 3000) {
      setMensagemExagero('⚠️ Cuidado! Ingestão muito alta pode ser prejudicial.');
      exageroAtual = true;
    } else {
      setMensagemExagero('');
    }

    setTotalAgua(novoTotal);
    setInputAgua('');

    // Atualiza o histórico do dia atual
    setHistorico((prev) => ({
      ...prev,
      [hoje]: { total: novoTotal, exagero: exageroAtual },
    }));
  };

  const calcularMeta = () => {
    const pesoNum = parseFloat(peso);
    if (isNaN(pesoNum) || pesoNum <= 0) {
      alert('Insira um peso válido.');
      return;
    }
    const novaMeta = Math.round(pesoNum * 35);
    setMetaDiaria(novaMeta);
    setMostrarCalculadora(false);
  };

  const redefinir = () => {
    setTotalAgua(0);
    setMetaDiaria(null);
    setPeso('');
    setInputAgua('');
  };

  const progresso = metaDiaria ? Math.min((totalAgua / metaDiaria) * 100, 100).toFixed(0) : '0';

  const gerarMensagem = () => {
    if (mensagemExagero) return mensagemExagero;
    if (totalAgua === 0) return 'Comece a beber água!';
    if (totalAgua < 1000) return 'Continue! Seu corpo agradece.';
    if (metaDiaria && totalAgua < metaDiaria) return 'Quase lá! Mantenha o ritmo.';
    return 'Parabéns! Meta de hidratação alcançada!';
  };

  // Construir marcações para o calendário
  // Verde se meta alcançada (total >= metaDiaria)
  // Vermelho se exagero (exagero === true)
  // Caso contrário, sem marcação

  const marcarDias = () => {
    const marcas = {};

    for (const dia in historico) {
      const info = historico[dia];
      if (info.exagero) {
        marcas[dia] = {
          customStyles: {
            container: {
              backgroundColor: '#ff6347', // vermelho tomate
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
          // Use um emoji gota para representar (em texto)
          // Se quiser imagem ou ícone, precisa personalizar mais
          // Como alternativa, vamos colocar uma gotinha na legenda abaixo
        };
      } else if (metaDiaria !== null && info.total >= metaDiaria) {
        marcas[dia] = {
          customStyles: {
            container: {
              backgroundColor: '#097d4c', // verde escuro
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        };
      }
    }
    return marcas;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/dashboard')}>
        <Ionicons name="arrow-back" size={24} color="#097d4c" />
        <Text style={styles.backText}>Voltar para Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Rastreamento de Hidratação</Text>

      <TouchableOpacity style={styles.botaoCalcular} onPress={() => setMostrarCalculadora(!mostrarCalculadora)}>
        <Text style={styles.textoBotao}>Calcular Meta</Text>
      </TouchableOpacity>

      {mostrarCalculadora && (
        <View style={styles.boxCalculadora}>
          <Text style={styles.label}>Digite seu peso (kg):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
            placeholder="Ex: 70"
          />
          <TouchableOpacity style={styles.botao} onPress={calcularMeta}>
            <Text style={styles.textoBotao}>Calcular</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Quantidade de água ingerida (ml)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={inputAgua}
        onChangeText={setInputAgua}
        placeholder="Ex: 250"
      />

      <TouchableOpacity style={styles.botao} onPress={registrarAgua}>
        <Text style={styles.textoBotao}>Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, { backgroundColor: '#999' }]} onPress={redefinir}>
        <Text style={styles.textoBotao}>Redefinir Tudo</Text>
      </TouchableOpacity>

      {metaDiaria !== null && (
        <View style={styles.recomendacaoBox}>
          <Text style={styles.recomendacaoTitulo}>Progresso Diário</Text>
          <Text style={styles.recomendacaoTexto}>
            Total ingerido: {totalAgua} ml de {metaDiaria} ml ({progresso}%)
          </Text>
          <Text style={styles.recomendacaoTexto}>{gerarMensagem()}</Text>
        </View>
      )}

      {/* Calendário com título e legenda */}
      <Text style={[styles.title, { marginTop: 30, fontSize: 22 }]}>Dias de metas</Text>
      <Calendar
        markingType={'custom'}
        markedDates={marcarDias()}
        // Opções de estilo do calendário podem ser adicionadas aqui
      />

      <View style={styles.legendaContainer}>
        <View style={styles.legendaItem}>
          <View style={[styles.gotinha, { backgroundColor: '#097d4c' }]} />
          <Text style={styles.legendaTexto}>Meta alcançada</Text>
        </View>
        <View style={styles.legendaItem}>
          <View style={[styles.gotinha, { backgroundColor: '#ff6347' }]} />
          <Text style={styles.legendaTexto}>Ingestão excessiva de água</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  botao: {
    backgroundColor: '#097d4c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoCalcular: {
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  recomendacaoBox: {
    marginTop: 30,
    backgroundColor: '#ffffffcc',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#097d4c',
  },
  recomendacaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
    textAlign: 'center',
  },
  recomendacaoTexto: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
    lineHeight: 22,
    textAlign: 'center',
  },
  boxCalculadora: {
    marginBottom: 20,
    backgroundColor: '#ffffffaa',
    padding: 16,
    borderRadius: 10,
    borderColor: '#00796b',
    borderWidth: 1,
  },
  legendaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  gotinha: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  legendaTexto: {
    fontSize: 14,
    color: '#333',
  },
});

export default Hidratacao;
