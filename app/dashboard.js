import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();

  // Definição de 'features' antes do useEffect
  const features = [
    { icon: 'calendar-outline', label: 'Marcar Consulta', route: '/MarcarConsulta' },
    { icon: 'document-text-outline', label: 'Questionário', route: '/questionario' },
    { icon: 'restaurant-outline', label: 'Plano Alimentar', route: '/plano-alimentar' },
    { icon: 'barbell-outline', label: 'Treino', route: '/treino' },
    { icon: 'stats-chart-outline', label: 'Progresso', route: '/progresso' },
    { icon: 'chatbubble-ellipses-outline', label: 'Chat com Nutricionista', route: '/chat' },
  ];

  const backgroundAnim = useRef(new Animated.Value(0)).current; // Animação de fade-in para a imagem de fundo
  const titleAnim = useRef(new Animated.Value(0)).current; // Animação do título
  const itemAnim = useRef(features.map(() => new Animated.Value(0))).current; // Animação das opções

  useEffect(() => {
    // Animação de fade-in para a imagem de fundo
    Animated.timing(backgroundAnim, {
      toValue: 0.1, // De 0 (invisível) para 1 (visível)
      duration: 1600, // 1,6 segundos para a animação
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Animação do título
    Animated.timing(titleAnim, {
      toValue: 1, // De 0 (invisível) para 1 (visível)
      duration: 1000, // 1 segundo para a animação
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Animação das opções
    Animated.stagger(100, // Intervalo entre as animações
      features.map((_, index) => 
        Animated.timing(itemAnim[index], {
          toValue: 1,
          duration: 1000, // 1 segundo para cada item
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      )
    ).start();
  }, []); // Dependências vazias, roda apenas uma vez após o carregamento

  return (
    <View style={styles.wrapper}>
      {/* Imagem de fundo animada */}
      <Animated.Image
        source={{ uri: 'https://i.imgur.com/YC3XmHz.png' }}
        style={[styles.backgroundImageAnimated, { opacity: backgroundAnim }]} // Aplica o fade-in na imagem
        resizeMode="cover"
        blurRadius={1}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
          <Text style={styles.backText}>Sair / Voltar</Text>
        </TouchableOpacity>

        {/* Título animado */}
        <Animated.Text
          style={[styles.title, {
            opacity: titleAnim, // Efeito de fade-in
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] // Deslocamento suave para cima
          }]}>
          Painel do Usuário
        </Animated.Text>
        <View style={styles.titleUnderline} />

        <View style={styles.grid}>
          {features.map((item, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: itemAnim[index], // Animação de fade-in
                transform: [
                  { translateY: itemAnim[index].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                ], // Deslocamento suave para cima
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
    zIndex: -1, // Garante que a imagem fique no fundo
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
});
