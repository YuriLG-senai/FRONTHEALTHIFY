import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Modal, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CadastrarReceitas() {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    nome: '',
    ingredientes: '',
    instrucoes: '',
    caloriasPorPorcao: '',
    categoria: '',
    tipo: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchReceitas();
  }, []);

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

  const handleCreateRecipe = async () => {
    try {
      const response = await fetch('http://localhost:5036/api/Receitas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecipe),
      });

      const data = await response.json();
      setReceitas([...receitas, data]); // Adiciona a nova receita na lista
      setNewRecipe({
        nome: '',
        ingredientes: '',
        instrucoes: '',
        caloriasPorPorcao: '',
        categoria: '',
        tipo: '',
      }); // Limpa os campos do formulário
      setModalVisible(false); // Fecha o modal
    } catch (error) {
      console.error('Erro ao criar receita:', error);
    }
  };

  const handleCancel = () => {
    setNewRecipe({
      nome: '',
      ingredientes: '',
      instrucoes: '',
      caloriasPorPorcao: '',
      categoria: '',
      tipo: '',
    }); // Limpa os campos
    setModalVisible(false); // Fecha o modal
  };

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Cadastrar Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Cadastrar Receitas', route: '/cadastrar-receitas' },
    { icon: 'chatbubble-ellipses-outline', label: 'Chat com Cliente', route: '/chat-com-cliente' },
  ];

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
      {/* Menu lateral */}
      <View style={styles.rightMenu}>
        {features.map((item, index) => (
          <MenuButton
            key={index}
            icon={item.icon}
            label={item.label}
            onPress={() => router.push(item.route)}
          />
        ))}
      </View>

      {/* Conteúdo principal */}
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Sair / Voltar</Text>
        </Pressable>

        <Text style={styles.titulo}>Cadastrar Receitas</Text>

        {/* Botão para criar nova receita */}
        <Pressable style={styles.criarReceitaButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.criarReceitaText}>Criar Nova Receita</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator size="large" color="#097d4c" />
        ) : (
          <FlatList
            data={receitas}
            keyExtractor={(item) => item.receitaId.toString()}
            renderItem={({ item }) => (
              <View style={styles.receitaCard}>
                <Text style={styles.receitaNome}>{item.nome}</Text>
                <Text style={styles.receitaInfo}>Descrição: {item.instrucoes}</Text>

                <View style={styles.actions}>
                  <Pressable
                    style={styles.botaoEditar}
                    onPress={() => router.push(`/editar-receita/${item.receitaId}`)}
                  >
                    <Text style={styles.textoBotao}>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.botaoExcluir}
                    onPress={() => excluirReceita(item.receitaId)}
                  >
                    <Text style={styles.textoBotao}>Excluir</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Modal para criar nova receita */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Receita</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Receita"
              value={newRecipe.nome}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, nome: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Ingredientes"
              value={newRecipe.ingredientes}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, ingredientes: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Instruções"
              value={newRecipe.instrucoes}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, instrucoes: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Calorias por Porção"
              value={newRecipe.caloriasPorPorcao}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, caloriasPorPorcao: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Categoria"
              value={newRecipe.categoria}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, categoria: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tipo"
              value={newRecipe.tipo}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, tipo: text })}
            />
    

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleCreateRecipe}>
                <Text style={styles.buttonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  async function excluirReceita(receitaId) {
    try {
      await fetch(`http://localhost:5036/api/Receitas/${receitaId}`, { method: 'DELETE' });
      setReceitas((prevReceitas) => prevReceitas.filter((receita) => receita.receitaId !== receitaId));
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  }
}

function MenuButton({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: 16 }}>
      <View style={styles.card}>
        <Ionicons name={icon} size={30} color="#097d4c" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6eecf',
  },
  rightMenu: {
    width: 220,
    height: '100%',
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
    fontSize: 14,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 5,
    color: '#097d4c',
    fontWeight: 'bold',
  },
  receitaCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  receitaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 4,
  },
  receitaInfo: {
    fontSize: 14,
    color: '#444',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  botaoEditar: {
    backgroundColor: '#e5a10b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botaoExcluir: {
    backgroundColor: '#d9534f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  criarReceitaButton: {
    backgroundColor: '#097d4c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criarReceitaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#097d4c',
  },
  input: {
    height: 40,
    borderColor: '#097d4c',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#097d4c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
