import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';



export default function MarcarConsulta() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="#097d4c" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Marcar Consulta</Text>
      <Text style={styles.subtitle}>Essa é uma tela ilustrativa.</Text>

      <View style={styles.card}>
        <Ionicons name="calendar" size={64} color="#097d4c" />
        <Text style={styles.cardText}>Em breve você poderá escolher uma data e horário aqui!</Text>
      </View>
    </View>
    
  );
}

export const options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6eecf',
    padding: 24,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  cardText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
