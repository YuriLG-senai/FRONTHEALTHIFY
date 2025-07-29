import { View, Text, StyleSheet, Animated, Pressable, Image, Modal } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();
  // --- NOVO ESTADO PARA CONTROLAR O MODAL ---
  const [modalVisible, setModalVisible] = useState(false);

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Cadastrar Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Cadastrar Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/perfil' },
  ];

  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSair = () => {
    setModalVisible(false);
    router.push('/');
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.leftSide}>
        {/* --- LÓGICA DO BOTÃO ATUALIZADA --- */}
        <Pressable style={styles.backButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Sair / Voltar</Text>
        </Pressable>

        <View style={styles.logoContainer}>
          <Text style={styles.welcomeText}>Bem-vindo, vamos trabalhar!</Text>
          <Animated.Image
            source={{ uri: 'https://i.imgur.com/YC3XmHz.png' }}
            style={[styles.logo, { transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
        </View>
      </View>

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

      {/* --- NOVO MODAL DE CONFIRMAÇÃO --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Saída</Text>
            <Text style={styles.modalText}>Você tem certeza que deseja sair e voltar para a tela inicial?</Text>
            <View style={styles.modalButtonContainer}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={handleSair}>
                <Text style={styles.modalButtonText}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuButton({ icon, label, onPress }) {
  const translateY = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    Animated.spring(translateY, {
      toValue: -6,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverOut = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      style={{ marginBottom: 16 }}
    >
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
  pageContainer: {
    flex: 1,
    backgroundColor: '#f6eecf',
    flexDirection: 'row',
  },
  leftSide: {
    flex: 3,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#097d4c',
    marginBottom: 20,
  },
  logo: {
    width: 400,
    height: 400,
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
  backButton: {
    position: 'absolute',
    top: 30,
    left: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    color: '#097d4c',
    fontSize: 16,
    fontWeight: '600',
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
  // --- NOVOS ESTILOS PARA O MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#d9534f', // Vermelho para ação de "sair"
    marginLeft: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});