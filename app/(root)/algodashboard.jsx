import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import { router } from 'expo-router';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import AlgoNavigation from '../../components/AlgoNavigation';

const AlgoDashboard = () => {
    const topOversoldData = [
        { id: '1', label: 'Active Strategies', value: '2' },
        { id: '2', label: 'Total P&L', value: '22,066.55' },
        { id: '3', label: 'Avg Win Rate', value: '61.5%' },
        { id: '4', label: 'Free Stocks', value: '2' },
    ];

    const activeStrategies = [
        {
            id: '1',
            name: 'Momentum Scalper',
            description: 'High-frequency momentum-based trading',
            pnl: '₹15,432.5',
            winRate: '67.3%',
            trades: '245',
            status: 'paused',
        },
        {
            id: '2',
            name: 'Momentum Scalper',
            description: 'High-frequency momentum-based trading',
            pnl: '₹-2,341.25',
            winRate: '45.2%',
            trades: '89',
            status: 'running',
        },
        {
            id: '3',
            name: 'Momentum Scalper',
            description: 'High-frequency momentum-based trading',
            pnl: '₹9,753.0',
            winRate: '72.1%',
            trades: '156',
            status: 'paused',
        },
    ];

    const dashboardData = [
        {
            id: 'header',
            type: 'header',
        },
        {
            id: 'topOversold',
            type: 'topOversold',
            data: topOversoldData,
        },
        {
            id: 'strategies',
            type: 'strategies',
            data: activeStrategies,
        },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'header':
                return (
                    <View style={styles.section}>
                        <View style={styles.actionRow}>
                            <Text className="font-sora-bold text-white text-xl">Algo Trading Dashboard</Text>
                            <TouchableOpacity style={styles.strategyButton}>
                                <MaterialCommunityIcons name="robot" size={20} color="white" />
                                <Text className="font-Questrial-Regular" style={styles.actionText}> Create Strategy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'topOversold':
                return (
                    <View style={styles.section}>
                        <FlatList
                            data={item.data}
                            renderItem={renderOversoldCard}
                            keyExtractor={(item) => item.id}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                );
            case 'strategies':
                return (
                    <View style={styles.bottomsection}>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0, y: 0.5 }}
                            style={styles.strategyCardBorderGradient}
                        >
                            <View style={styles.strategyCard}>
                                <Text style={styles.sectionTitle}>Active Strategies</Text>
                                <FlatList
                                    data={item.data}
                                    renderItem={renderStrategyCard}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                );
            default:
                return null;
        }
    };

    const renderOversoldCard = ({ item }) => (
        <LinearGradient
            colors={['#0155fa', '#000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={styles.cardBorderGradient}
        >
            <LinearGradient
                colors={['#0155fa', '#181822']}
                start={{ x: 2, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                style={styles.cardBgGradient}
            >
                <View style={styles.otherCard}>
                    <MaterialCommunityIcons name="robot" size={20} color="white" style={styles.iconbox} />
                    <Text style={styles.cardLabel}>{item.label}</Text>
                    <Text style={styles.cardText}>{item.value}</Text>
                </View>
            </LinearGradient>
        </LinearGradient>
    );

    const renderStrategyCard = ({ item }) => (
        <LinearGradient
            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
            start={{ x: 0.2, y: 1.2 }}
            end={{ x: 0, y: 0 }}
            style={styles.strategyCardBorderGradient}
        >
            <View style={styles.strategyCard}>
                <View style={styles.strategyHeader}>
                    <Text style={styles.strategyName}>{item.name}</Text>
                    <Text style={styles.strategyDescription}>{item.description}</Text>
                </View>
                <View style={styles.strategyStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>P&L</Text>
                        <Text style={[styles.statValue, { color: item.pnl.startsWith('₹-') ? '#FF0505' : '#05FF93' }]}>
                            {item.pnl}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Win Rate</Text>
                        <Text style={styles.statValue}>{item.winRate}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Trades</Text>
                        <Text style={styles.statValue}>{item.trades}</Text>
                    </View>
                    <View style={styles.strategyActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            {item.status === 'paused' ? (
                                <Feather name="play-circle" size={24} color="#000" className="bg-[#05ff93] p-2 rounded-lg" />
                            ) : (
                                <Feather name="pause-circle" size={24} color="#fff" className="bg-[#FF0505] p-2 rounded-lg" />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Octicons name="gear" size={24} color="#fff" className="bg-[#242431] p-2 rounded-lg" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerbox}>
                <HomeHeader />
            </View>

            <AlgoNavigation />

            <FlatList
                data={dashboardData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerbox}
            />
        </View>
    );
};

export default AlgoDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerbox: {
        paddingHorizontal: 15,
    },
    scrollerbox: {
        // paddingHorizontal: 15,
        marginBottom: 25,
        // paddingTop: 20,
        paddingBottom: 20,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 15,
    },
    bottomsection: {
        marginTop: 20,
        backgroundColor: '#191922',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        borderBottomColor: '#3C3B40',
        borderWidth: 1,
        paddingBottom: 15,
        borderRadius: 20,
    },
    buttonGradientBorder: {
        borderRadius: 100,
        width: '48%',
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    strategyButton: {
        flexDirection: 'row',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0057FF',
        flexGrow: 1,
        paddingVertical: 10,
    },
    actionText: {
        color: '#fff',
        fontSize: 16,
    },
    detailsContainer: {
        padding: 15,
        backgroundColor: '#12121c',
        borderRadius: 20,
    },
    detailsTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'light',
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    inputGroup: {
        width: '48%',
    },
    label: {
        color: '#A9A9A9',
        fontSize: 14,
        marginBottom: 10,
        marginRight: 5,
    },
    inputText: {
        color: '#FFF',
        fontSize: 16,
        backgroundColor: '#1d1d26',
        padding: 10,
        borderRadius: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        marginBottom: 8,
    },
    cardBorderGradient: {
        borderRadius: 20,
        padding: 1,
        marginRight: 12,
    },
    cardBgGradient: {
        borderRadius: 20,
    },
    otherCard: {
        borderRadius: 20,
        padding: 16,
        width: 175,
        height: 130,
        justifyContent: 'center',
        alignItems: 'start',
    },
    iconbox: {
        backgroundColor: '#095dff',
        borderRadius: 20,
        padding: 5,
        width: 30,
    },
    cardLabel: {
        color: '#81818A',
        fontSize: 16,
        marginTop: 8,
    },
    cardText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
    },
    strategyCardBorderGradient: {
        borderRadius: 20,
        padding: 1,
        marginBottom: 15,
    },
    strategyCard: {
        backgroundColor: '#12121c',
        borderRadius: 20,
        padding: 15,
    },
    strategyHeader: {
        marginBottom: 10,
    },
    strategyName: {
        color: '#FFF',
        fontSize: 16,
    },
    strategyDescription: {
        color: '#A9A9A9',
        fontSize: 12,
    },
    strategyStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'start',
        borderWidth: 1,
        borderColor: '#292930',
        padding: 7,
        borderRadius: 13,
        backgroundColor: '#202029',
    },
    statLabel: {
        color: '#A9A9A9',
        fontSize: 12,
    },
    statValue: {
        color: '#FFF',
        fontSize: 14,
        // fontWeight: 'bold',
    },
    strategyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    actionButton: {
        // padding: 5,
        // borderRadius: 10,
    },
});