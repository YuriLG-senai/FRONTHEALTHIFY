import { View, Text, StyleSheet, Animated, Pressable, Image, Modal, ScrollView, Easing, TouchableOpacity } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();
  // --- NOVO ESTADO PARA CONTROLAR O MODAL ---
  const [modalVisible, setModalVisible] = useState(false);

  const features = [
    { icon: 'calendar-outline', label: 'Consultar Disponibilidade', route: '/MarcarConsulta' },
    { icon: 'document-text-outline', label: 'Questionário', route: '/questionario' },
    { icon: 'restaurant-outline', label: 'Plano Alimentar', route: '/plano-alimentar' },
    { icon: 'water-outline', label: 'Hidratação', route: '/hidratacao' },
    { icon: 'stats-chart-outline', label: 'Progresso', route: '/progresso' },
    { icon: 'person-circle-outline', label: 'Perfil', route: '/perfilcliente' },
  ];

  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const itemAnim = useRef(features.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(backgroundAnim, {
      toValue: 0.1,
      duration: 1600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.stagger(100,
      features.map((_, index) =>
        Animated.timing(itemAnim[index], {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  // --- FUNÇÃO PARA LIDAR COM A SAÍDA ---
  const handleSair = () => {
    setModalVisible(false);
    router.push('/');
  };

  return (
    <View style={styles.wrapper}>
      <Animated.Image
        source={{ uri: 'https://i.imgur.com/YC3XmHz.png' }}
        style={[styles.backgroundImageAnimated, { opacity: backgroundAnim }]}
        resizeMode="cover"
        blurRadius={1}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* --- LÓGICA DO BOTÃO ATUALIZADA --- */}
        <TouchableOpacity style={styles.backButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Sair / Voltar</Text>
        </TouchableOpacity>

        <Animated.Text
          style={[styles.title, {
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
          }]}>
          Painel do Usuário
        </Animated.Text>
        <View style={styles.titleUnderline} />

        <View style={styles.grid}>
          {features.map((item, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: itemAnim[index],
                transform: [
                  { translateY: itemAnim[index].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                ],
              }}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(item.route)}
              >
                <Ionicons name={item.icon} size={48} color="#097d4c" />
                <Text style={styles.label}>{item.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f6eecf',
  },
  backgroundImageAnimated: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    color: '#097d4c',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 10,
  },
  titleUnderline: {
    width: '60%',
    height: 3,
    backgroundColor: '#097d4c',
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: 180,
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    marginTop: 12,
    textAlign: 'center',
    color: '#097d4c',
    fontWeight: '600',
    fontSize: 16,
  },
  // --- ESTILOS PARA O MODAL ---
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
    backgroundColor: '#d9534f',
    marginLeft: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
