import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PlanoAlimentarScreen() {
  const [clientes, setClientes] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [plano, setPlano] = useState({
    segunda: { cafe: [], almoco: [], jantar: [] },
    terca: { cafe: [], almoco: [], jantar: [] },
    // ... até domingo
  });

  // Simular fetch de API
  useEffect(() => {
    fetchClientes();
    fetchReceitas();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Clientes');
      const data = await response.json();
      console.log('Clientes:', data);
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceitas = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Receitas');
      const data = await response.json();
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const adicionarReceita = (dia, refeicao, receita) => {
    setPlano(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [refeicao]: [...prev[dia][refeicao], receita]
      }
    }));
  };

  const salvarPlano = async () => {
    // chamada à API para salvar plano alimentar para o cliente
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: "#f6eecf" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#097d4c" }}>Criar Plano Alimentar</Text>

      {/* Seletor de cliente */}
      <Text style={{ marginTop: 20 }}>Selecione um cliente:</Text>
      <ScrollView horizontal>
        {clientes.map(cliente => (
          <TouchableOpacity
            key={cliente.id}
            onPress={() => setClienteSelecionado(cliente)}
            style={{
              padding: 10,
              margin: 5,
              backgroundColor: clienteSelecionado?.id === cliente.id ? "#097d4c" : "#fff",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#ccc"
            }}
          >
            <Text style={{ color: clienteSelecionado?.id === cliente.id ? "#fff" : "#000" }}>
              {cliente.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plano por dia e refeição */}
      {Object.keys(plano).map(dia => (
        <View key={dia} style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#097d4c" }}>{dia.toUpperCase()}</Text>

          {["cafe", "almoco", "jantar"].map(refeicao => (
            <View key={refeicao} style={{ marginVertical: 10 }}>
              <Text style={{ fontWeight: "bold" }}>{refeicao.toUpperCase()}</Text>
              <ScrollView horizontal>
                {receitas.map(receita => (
                  <TouchableOpacity
                    key={receita.id}
                    onPress={() => adicionarReceita(dia, refeicao, receita)}
                    style={{
                      backgroundColor: "#fff",
                      padding: 10,
                      margin: 5,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#097d4c"
                    }}
                  >
                    <Text>{receita.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Mostrar receitas já adicionadas */}
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {plano[dia][refeicao].map((r, idx) => (
                  <View key={idx} style={{ backgroundColor: "#d1e7dd", margin: 5, padding: 5, borderRadius: 5 }}>
                    <Text>{r.nome}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity
        onPress={salvarPlano}
        style={{
          backgroundColor: "#097d4c",
          padding: 15,
          marginTop: 30,
          borderRadius: 10,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Salvar Plano</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
