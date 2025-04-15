import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();

  const features = [
    { icon: 'calendar-outline', label: 'Marcar Consulta', route: '/MarcarConsulta' },
    { icon: 'document-text-outline', label: 'Questionário', route: '/questionario' },
    { icon: 'restaurant-outline', label: 'Plano Alimentar', route: '/plano-alimentar' },
    { icon: 'barbell-outline', label: 'Treino', route: '/treino' },
    { icon: 'stats-chart-outline', label: 'Progresso', route: '/progresso' },
    { icon: 'chatbubble-ellipses-outline', label: 'Chat com Nutricionista', route: '/chat' },
  ];

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={{ uri: 'https://i.imgur.com/YC3XmHz.png' }} // Imagem de fundo
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage} // Aplicando a opacidade na imagem
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
            <Text style={styles.backText}>Sair / Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Painel do Usuário</Text>
          <View style={styles.titleUnderline} />

          <View style={styles.grid}>
            {features.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => router.push(item.route)}
              >
                <Ionicons name={item.icon} size={48} color="#097d4c" />
                <Text style={styles.label}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f6eecf', // Cor de fundo que você pediu
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImage: {
    opacity: 0.05, // Opacidade da imagem de fundo mais fraca
  },
  container: {
    flex: 1,
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
