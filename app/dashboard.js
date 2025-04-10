import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();

  const features = [
    { icon: 'calendar-outline', label: 'Marcar Consulta', route: '/marcar-consulta' },
    { icon: 'document-text-outline', label: 'Questionário', route: '/questionario' },
    { icon: 'restaurant-outline', label: 'Plano Alimentar', route: '/plano-alimentar' },
    { icon: 'barbell-outline', label: 'Treino', route: '/treino' },
    { icon: 'stats-chart-outline', label: 'Progresso', route: '/progresso' },
    { icon: 'chatbubble-ellipses-outline', label: 'Chat com Nutricionista', route: '/chat' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
        <Text style={styles.backText}>Sair / Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Painel do Usuário</Text>

      <View style={styles.grid}>
        {features.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={() => router.push(item.route)}>
            <Ionicons name={item.icon} size={36} color="#097d4c" />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f6eecf',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    color: '#097d4c',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#097d4c',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    width: 140,
    height: 140,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    marginTop: 10,
    textAlign: 'center',
    color: '#097d4c',
    fontWeight: '600',
  },
});
