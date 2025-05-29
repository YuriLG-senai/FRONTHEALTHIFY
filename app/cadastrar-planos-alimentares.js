import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CriarPlanoAlimentar() {
  const router = useRouter();
  const [clienteId, setClienteId] = useState('');
  const [observacoes, setObservacoes] = useState('');

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
      {/* Menu lateral */}
      <View style={styles.rightMenu}>
        {menuItems.map((item, index) => (
          <MenuButton key={index} icon={item.icon} label={item.label} onPress={() => router.push(item.route)} />
        ))}
      </View>

      {/* Conteúdo principal */}
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashnutri')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <Text style={styles.titulo}>Criar Plano Alimentar</Text>

        <ScrollView style={styles.scroll}>
          <TextInput
            style={styles.input}
            placeholder="ID do Cliente"
            keyboardType="numeric"
            value={clienteId}
            onChangeText={setClienteId}
          />

          {/* Aqui você pode adicionar os campos para selecionar receitas, porções, dias da semana, tipo de refeição */}

          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Observações"
            multiline
            value={observacoes}
            onChangeText={setObservacoes}
          />

          <Pressable style={styles.button}>
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

  const handleHoverIn = () => {
    Animated.spring(translateY, { toValue: -6, useNativeDriver: true }).start();
  };

  const handleHoverOut = () => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
  };

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
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderColor: '#ccc',
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
