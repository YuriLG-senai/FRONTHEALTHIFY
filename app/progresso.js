import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para formatar a data
const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    try {
        const date = new Date(isoDate);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
};

// --- FUNÇÃO ATUALIZADA PARA LIDAR COM MÚLTIPLOS DIAS ---
const groupPlanByDay = (receitas) => {
    if (!receitas || receitas.length === 0) return {};

    const diasOrdenados = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    
    const grouped = receitas.reduce((acc, receita) => {
        // Verifica se diaSemana é uma string e divide-a
        const dias = typeof receita.diaSemana === 'string' ? receita.diaSemana.split(',') : [];
        
        dias.forEach(dia => {
            const diaLimpo = dia.trim();
            if (diaLimpo) {
                if (!acc[diaLimpo]) {
                    acc[diaLimpo] = [];
                }
                acc[diaLimpo].push(receita);
            }
        });
        return acc;
    }, {});

    const orderedGrouped = {};
    diasOrdenados.forEach(dia => {
        if (grouped[dia]) {
            orderedGrouped[dia] = grouped[dia];
        }
    });

    return orderedGrouped;
};


// --- COMPONENTE ATUALIZADO PARA O CARTÃO DE UM ÚNICO PLANO ---
const PlanoCard = ({ plano }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const receitasDoPlano = plano.planoReceita || [];
    const planoAgrupado = groupPlanByDay(receitasDoPlano);
    const diasDaSemana = Object.keys(planoAgrupado);

    return (
        <View style={styles.planoCard}>
            <View style={styles.planoCardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.planoTitle}>{plano.nomePlano}</Text>
                    <Text style={styles.planoDates}>Válido de: {formatDate(plano.dataInicio)} a {formatDate(plano.dataFim)}</Text>
                </View>
                <TouchableOpacity style={styles.detailsButton} onPress={() => setIsExpanded(!isExpanded)}>
                    <Text style={styles.detailsButtonText}>{isExpanded ? 'Ocultar' : 'Ver Detalhes'}</Text>
                    <Ionicons name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {isExpanded && (
                <View style={styles.planoDetails}>
                    {plano.observacoes && (
                        <View style={styles.obsContainer}>
                            <Ionicons name="information-circle-outline" size={20} color="#097d4c" />
                            <Text style={styles.obsText}>{plano.observacoes}</Text>
                        </View>
                    )}
                    {diasDaSemana.map(dia => (
                        <View key={dia} style={styles.dayCard}>
                            <Text style={styles.dayTitle}>{dia}</Text>
                            {planoAgrupado[dia].map((item, index) => (
                                <View key={index} style={styles.mealCard}>
                                    <Text style={styles.mealTitle}>{item.receita?.nome || '(Receita não encontrada)'}</Text>
                                    
                                    <View style={styles.mealDetailsContainer}>
                                        <View style={styles.mealDetailItem}>
                                            <Ionicons name="restaurant-outline" size={16} color="#555" />
                                            {/* Exibe todas as refeições selecionadas */}
                                            <Text style={styles.mealDetailText}><Text style={styles.mealDetailLabel}>Refeição:</Text> {item.refeicao}</Text>
                                        </View>
                                        <View style={styles.mealDetailItem}>
                                            <Ionicons name="pie-chart-outline" size={16} color="#555" />
                                            <Text style={styles.mealDetailText}><Text style={styles.mealDetailLabel}>Porção:</Text> {item.quantidadePorcao}</Text>
                                        </View>
                                    </View>

                                    {item.receita?.instrucoes && (
                                        <View style={styles.ingredientesContainer}>
                                            <Text style={styles.ingredientesTitle}>Modo de Preparo:</Text>
                                            <Text style={styles.mealFood}>{item.receita.instrucoes}</Text>
                                        </View>
                                    )}
                                    
                                    {item.receita?.ingredientes && (
                                        <View style={styles.ingredientesContainer}>
                                            <Text style={styles.ingredientesTitle}>Ingredientes:</Text>
                                            <Text style={styles.mealFood}>{item.receita.ingredientes}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default function PlanoAlimentarCliente() {
    const router = useRouter();
    const [planosAlimentares, setPlanosAlimentares] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlano = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) throw new Error("Utilizador não autenticado.");

                const perfilResponse = await fetch('http://localhost:5036/api/Usuarios/perfil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!perfilResponse.ok) throw new Error("Não foi possível obter o perfil do utilizador.");
                const perfilData = await perfilResponse.json();
                const clienteId = perfilData.cliente?.clienteId;

                if (!clienteId) {
                    setPlanosAlimentares([]);
                    setLoading(false);
                    return;
                };

                const planosResponse = await fetch('http://localhost:5036/api/PlanosAlimentares');
                if (!planosResponse.ok) throw new Error("Não foi possível carregar os planos alimentares.");
                const todosOsPlanos = await planosResponse.json();
                
                const planosDoClienteIds = todosOsPlanos
                    .filter(plano => plano.clienteId === clienteId)
                    .map(plano => plano.planoId);

                if (planosDoClienteIds.length === 0) {
                    setPlanosAlimentares([]);
                    setLoading(false);
                    return;
                }

                const planosDetalhadosPromises = planosDoClienteIds.map(id =>
                    fetch(`http://localhost:5036/api/PlanosAlimentares/${id}`).then(res => {
                        if (!res.ok) {
                            console.warn(`Não foi possível buscar detalhes para o plano ID: ${id}`);
                            return null;
                        }
                        return res.json();
                    })
                );
                
                const planosDetalhados = await Promise.all(planosDetalhadosPromises);
                
                setPlanosAlimentares(planosDetalhados.filter(p => p !== null));

            } catch (error) {
                console.error("Erro ao carregar plano alimentar:", error);
                Alert.alert("Erro", "Não foi possível carregar os seus planos alimentares. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlano();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#097d4c" />
                <Text style={styles.loadingText}>A carregar os seus planos...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/dashboard')}>
                <Ionicons name="arrow-back" size={24} color="#097d4c" />
                <Text style={styles.backButtonText}>Voltar ao Dashboard</Text>
            </TouchableOpacity>

            <Text style={styles.titulo}>Meus Planos Alimentares</Text>

            {planosAlimentares.length > 0 ? (
                planosAlimentares.map(plano => (
                    <PlanoCard key={plano.planoId} plano={plano} />
                ))
            ) : (
                <View style={styles.centerContent}>
                    <Ionicons name="document-text-outline" size={80} color="#b0b0b0" />
                    <Text style={styles.emptyTitle}>Nenhum Plano Encontrado</Text>
                    <Text style={styles.emptySubtitle}>Parece que o seu nutricionista ainda não criou um plano alimentar para si.</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6eecf',
        paddingHorizontal: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        marginBottom: 15,
    },
    backButtonText: {
        color: '#097d4c',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#555',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 24,
    },
    planoCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    planoCardHeader: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    planoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#097d4c',
    },
    planoDates: {
        fontSize: 14,
        color: '#777',
        fontStyle: 'italic',
        marginTop: 4,
    },
    detailsButton: {
        backgroundColor: '#097d4c',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 5,
    },
    planoDetails: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    obsContainer: {
        backgroundColor: '#e8f5e9',
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    obsText: {
        flex: 1,
        marginLeft: 10,
        color: '#097d4c',
        fontSize: 15,
    },
    dayCard: {
        marginBottom: 20,
    },
    dayTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#097d4c',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#097d4c',
        paddingBottom: 5,
    },
    mealCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    mealTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    mealDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        flexWrap: 'wrap', // Permite que os itens quebrem a linha se não couberem
    },
    mealDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5, // Espaçamento entre os itens
    },
    mealDetailText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#555',
        flexShrink: 1, // Permite que o texto quebre a linha se for muito longo
    },
    mealDetailLabel: {
        fontWeight: 'bold',
    },
    mealDescription: {
        fontSize: 15,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    ingredientesContainer: {
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    ingredientesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 5,
    },
    mealFood: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    mealPortion: {
        fontSize: 14,
        color: '#777',
        fontStyle: 'italic',
        textAlign: 'right',
        marginTop: 10,
    },
});