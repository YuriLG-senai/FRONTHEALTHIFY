import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, 
    Alert, Modal, TextInput, Pressable 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para formatar a data
const formatDate = (isoDate) => {
    if (!isoDate) return 'Data não especificada';
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(isoDate).toLocaleDateString('pt-BR', options);
};

export default function DiarioCliente() {
    const router = useRouter();
    const [entradas, setEntradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clienteId, setClienteId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Estados para a nova entrada do diário
    const [novaRefeicao, setNovaRefeicao] = useState('');
    const [novoSintoma, setNovoSintoma] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) throw new Error("Utilizador não autenticado.");

                const perfilResponse = await fetch('http://localhost:5036/api/Usuarios/perfil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!perfilResponse.ok) throw new Error("Não foi possível obter o perfil.");
                const perfilData = await perfilResponse.json();
                
                if (perfilData.cliente?.clienteId) {
                    setClienteId(perfilData.cliente.clienteId);
                    await fetchDiario(perfilData.cliente.clienteId);
                } else {
                    throw new Error("Perfil de cliente não encontrado.");
                }
            } catch (error) {
                console.error("Erro inicial:", error);
                Alert.alert("Erro", "Não foi possível carregar os seus dados.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const fetchDiario = async (cId) => {
        if (!cId) return;
        try {
            const response = await fetch(`http://localhost:5036/api/Diario/cliente/${cId}`);
            if (response.ok) {
                const data = await response.json();
                setEntradas(data);
            } else {
                setEntradas([]); // Limpa a lista se não encontrar nada (erro 404)
            }
        } catch (error) {
            console.error("Erro ao buscar diário:", error);
        }
    };

    const handleSalvarEntrada = async () => {
        if (!novaRefeicao.trim() && !novoSintoma.trim()) {
            Alert.alert("Atenção", "Preencha pelo menos um dos campos para salvar.");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                clienteId: clienteId,
                dataEntrada: new Date().toISOString(),
                refeicoes: novaRefeicao,
                sintomas: novoSintoma,
            };
            const response = await fetch('http://localhost:5036/api/Diario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Falha ao salvar a entrada.");

            Alert.alert("Sucesso", "A sua entrada no diário foi salva!");
            setModalVisible(false);
            setNovaRefeicao('');
            setNovoSintoma('');
            await fetchDiario(clienteId); // Atualiza a lista
        } catch (error) {
            console.error("Erro ao salvar entrada:", error);
            Alert.alert("Erro", "Não foi possível salvar a sua entrada no diário.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#097d4c" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/dashboard')}>
                    <Ionicons name="arrow-back" size={24} color="#097d4c" />
                    <Text style={styles.backButtonText}>Voltar ao Dashboard</Text>
                </TouchableOpacity>

                <Text style={styles.titulo}>Meu Diário Alimentar</Text>
                <Text style={styles.subtitulo}>Registe as suas refeições e como se sentiu.</Text>

                {entradas.length > 0 ? (
                    entradas.map(entrada => (
                        <View key={entrada.diarioId} style={styles.card}>
                            <Text style={styles.cardDate}>{formatDate(entrada.dataEntrada)}</Text>
                            {entrada.refeicoes && (
                                <View style={styles.cardSection}>
                                    <Text style={styles.cardTitle}>O que comeu:</Text>
                                    <Text style={styles.cardText}>{entrada.refeicoes}</Text>
                                </View>
                            )}
                            {entrada.sintomas && (
                                <View style={styles.cardSection}>
                                    <Text style={styles.cardTitle}>Como se sentiu:</Text>
                                    <Text style={styles.cardText}>{entrada.sintomas}</Text>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={60} color="#b0b0b0" />
                        <Text style={styles.emptyText}>O seu diário está vazio.</Text>
                        <Text style={styles.emptySubText}>Clique no botão '+' para adicionar o seu primeiro registo.</Text>
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={() => {}}>
                        <Text style={styles.modalTitle}>Novo Registo</Text>
                        <Text style={styles.modalLabel}>O que comeu hoje?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Café da manhã: pão com ovo. Almoço: frango com salada..."
                            multiline
                            value={novaRefeicao}
                            onChangeText={setNovaRefeicao}
                        />
                        <Text style={styles.modalLabel}>Sentiu algum sintoma?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Senti-me com mais energia, tive uma leve dor de cabeça..."
                            multiline
                            value={novoSintoma}
                            onChangeText={setNovoSintoma}
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={handleSalvarEntrada} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6eecf' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    backButton: { flexDirection: 'row', alignItems: 'center', paddingTop: 30, marginBottom: 15 },
    backButtonText: { color: '#097d4c', fontSize: 16, marginLeft: 8, fontWeight: '500' },
    titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    subtitulo: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#097d4c',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    cardSection: { marginBottom: 10 },
    cardTitle: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 5, textTransform: 'uppercase' },
    cardText: { fontSize: 16, color: '#444', lineHeight: 24 },
    emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: '#888', marginTop: 15 },
    emptySubText: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 5 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#097d4c',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#097d4c',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: '#097d4c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
