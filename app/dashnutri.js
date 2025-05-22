import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import { useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';



export default function DashboardScreen() {
  const router = useRouter();

  const features = [
    { icon: 'calendar-outline', label: 'Consultas', route: '/ver-consulta' },
    { icon: 'document-text-outline', label: 'Clientes', route: '/ver-clientes' },
    { icon: 'restaurant-outline', label: 'Cadastrar Planos Alimentares', route: '/cadastrar-planos-alimentares' },
    { icon: 'book-outline', label: 'Cadastrar Receitas', route: '/cadastrar-receitas' },
    { icon: 'person-circle-outline', label: 'perfil', route: '/chat-com-cliente' },
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

  return (
    <View style={styles.pageContainer}>
      <View style={styles.leftSide}>
        <Pressable style={styles.backButton} onPress={() => router.push('/')}>
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
});
