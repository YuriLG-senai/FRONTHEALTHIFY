import React, { useState } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Modal, 
    Pressable,
    ScrollView,
    Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const options = {
  headerShown: false, 
};

// Componente para o Card de Refeição, para deixar o código mais limpo
const RefeicaoCard = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <View style={styles.horarioContainer}>
                <Ionicons name="time-outline" size={16} color="#097d4c" />
                <Text style={styles.horario}>{item.horario}</Text>
            </View>
        </View>
        <Text style={styles.alimentos}>{item.alimentos}</Text>
    </View>
);

const PlanoAlimentar = () => {
    const router = useRouter();

    const [dadosPlano, setDadosPlano] = useState([
        { id: '1', nome: 'Café da manhã', horario: '08:00', alimentos: 'Ovos, Pão integral, Suco de laranja' },
        { id: '2', nome: 'Almoço', horario: '12:30', alimentos: 'Frango grelhado, Arroz integral, Salada de folhas' },
        { id: '3', nome: 'Lanche da tarde', horario: '15:30', alimentos: 'Iogurte com granola' },
        { id: '4', nome: 'Jantar', horario: '19:00', alimentos: 'Peixe assado, Legumes cozidos' },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [novaRefeicao, setNovaRefeicao] = useState({
        nome: '',
        horario: '',
        alimentos: '',
    });

    // --- FUNÇÃO PARA VALIDAR O HORÁRIO ---
    const isHorarioValido = (horario) => {
        if (!/^\d{2}:\d{2}$/.test(horario)) {
            return false; // Formato deve ser HH:MM
        }
        const [horas, minutos] = horario.split(':').map(Number);
        if (horas < 0 || horas > 23) {
            return false; // Horas devem estar entre 00 e 23
        }
        if (minutos < 0 || minutos > 59) {
            return false; // Minutos devem estar entre 00 e 59
        }
        return true;
    };

    const handleAdicionarRefeicao = () => {
        // Validação dos campos
        if (!novaRefeicao.nome.trim() || !novaRefeicao.horario.trim() || !novaRefeicao.alimentos.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
            return;
        }

        // Validação específica do horário
        if (!isHorarioValido(novaRefeicao.horario)) {
            Alert.alert('Horário Inválido', 'Por favor, insira um horário válido no formato 24h (ex: 08:00 ou 19:30).');
            return;
        }

        setDadosPlano([
            ...dadosPlano,
            {
                id: (dadosPlano.length + 1 + Math.random()).toString(), // ID mais robusto
                nome: novaRefeicao.nome,
                horario: novaRefeicao.horario,
                alimentos: novaRefeicao.alimentos,
            },
        ]);
        setModalVisible(false);
        setNovaRefeicao({ nome: '', horario: '', alimentos: '' });
    };

    // --- FUNÇÃO PARA FORMATAR O HORÁRIO ENQUANTO O USUÁRIO DIGITA ---
    const handleHorarioChange = (text) => {
        // Remove tudo que não for número
        const numeros = text.replace(/[^0-9]/g, '');
        let horarioFormatado = numeros;

        if (numeros.length > 2) {
            // Adiciona o ":" depois das horas
            horarioFormatado = `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
        }
        
        // Limita o tamanho para 5 caracteres (HH:MM)
        if (horarioFormatado.length > 5) {
            horarioFormatado = horarioFormatado.slice(0, 5);
        }

        setNovaRefeicao({ ...novaRefeicao, horario: horarioFormatado });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#097d4c" />
                </TouchableOpacity>
                <Text style={styles.tituloPagina}>Plano Alimentar</Text>
            </View>

            <FlatList
                data={dadosPlano}
                renderItem={({ item }) => <RefeicaoCard item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }} // Espaço para o botão flutuante
            />

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
                        <ScrollView>
                            <Text style={styles.modalTitulo}>Adicionar Refeição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome da Refeição (ex: Café da manhã)"
                                value={novaRefeicao.nome}
                                onChangeText={(text) => setNovaRefeicao({ ...novaRefeicao, nome: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Horário (HH:MM)"
                                value={novaRefeicao.horario}
                                keyboardType="numeric"
                                onChangeText={handleHorarioChange} // Usa a nova função de formatação
                                maxLength={5}
                            />
                            <TextInput
                                style={styles.inputMultiLine}
                                placeholder="Alimentos (ex: Ovos, Pão integral...)"
                                value={novaRefeicao.alimentos}
                                onChangeText={(text) => setNovaRefeicao({ ...novaRefeicao, alimentos: text })}
                                multiline
                            />
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAdicionarRefeicao}>
                                    <Text style={styles.modalButtonText}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6eecf',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 40,
        paddingBottom: 15,
        backgroundColor: '#f6eecf',
    },
    backButton: {
        padding: 5,
    },
    tituloPagina: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#097d4c',
        marginLeft: 15,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginHorizontal: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    horarioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    horario: {
        fontSize: 14,
        color: '#097d4c',
        marginLeft: 5,
        fontWeight: '600',
    },
    alimentos: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitulo: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    inputMultiLine: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        paddingTop: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#aaa',
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#097d4c',
        marginLeft: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PlanoAlimentar;
