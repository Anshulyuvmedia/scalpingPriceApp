import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getTemplateLegs } from '@/constants/templateConfigs';
import HomeHeader from '@/components/HomeHeader';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // or your auth method
const API_BASE_URL = 'http://192.168.1.37:3000/api'; // Change in production

const StrategyDetailScreen = () => {
    const { name } = useLocalSearchParams();
    const strategyName = Array.isArray(name) ? name[0] : name;
    const [loading, setLoading] = React.useState(false);

    const legs = React.useMemo(() => {
        const baseLegs = getTemplateLegs(strategyName || '');
        return baseLegs.map(leg => ({ ...leg, currentQty: leg.qty }));
    }, [strategyName]);

    const handleRunStrategy = async () => {
        if (!strategyName || legs.length === 0) {
            Alert.alert('Error', 'Invalid strategy');
            return;
        }

        setLoading(true);

        try {
            // Get auth token (adjust based on how you store it)
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                setLoading(false);
                return;
            }

            // Prepare payload exactly as your LoopBack backend expects
            const payload = {
                strategyName,
                legs: legs.map(leg => ({
                    action: leg.isBuy ? 'BUY' : 'SELL',
                    qty: leg.currentQty || leg.qty,
                    optionType: leg.isCE, // 'CE' or 'PE'
                    expiryType: leg.isWeekly ? 'WEEKLY' : 'MONTHLY',
                    strikeCriteria: leg.firstSelection,     // e.g., "ATM", "ITM 2", etc.
                    strikeValue: leg.secondSelection,
                    slTrigger: leg.slSelection,
                    slQty: leg.slQty,
                    tpTrigger: leg.tpSelection,
                    tpQty: leg.tpQty,
                    entryTiming: leg.onSelection,
                    exitTiming: leg.onSelectionSec,
                })),
                executedAt: new Date().toISOString(),
                status: 'PENDING', // or 'ACTIVE', 'SCANNING'
            };

            const response = await axios.post(
                'https://your-api-domain.com/api/strategies/run', // Change to your actual endpoint
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.id) {
                Alert.alert(
                    'Success',
                    'Strategy submitted successfully! Scanning market now...',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Optionally navigate to active strategies screen
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Run Strategy Error:', error.response || error);

            const message = error.response?.data?.error?.message ||
                error.message ||
                'Failed to run strategy';

            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    if (!strategyName || legs.length === 0) {
        return (
            <View style={styles.container}>
                <HomeHeader page="chatbot" title="Not Found" />
                <Text style={styles.errorText}>Strategy not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.bodyHeader}>
                <HomeHeader page="chatbot" title="Strategy Details" />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={['#D2BDFF', '#723CDF', '#0C0C18']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardBox}>
                        {/* Header & Legs same as before */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.strategyName}>{strategyName}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{legs.length} Legs</Text>
                            </View>
                        </View>

                        {legs.map((leg, index) => (
                            <View key={leg.id} style={styles.legCard}>
                                <Text style={styles.legTitle}>Leg {index + 1}</Text>
                                <View style={styles.row}>
                                    <Metric label="Action" value={leg.isBuy ? 'Buy' : 'Sell'} isBuy={leg.isBuy} />
                                    <Metric label="Qty" value={leg.qty} />
                                    <Metric label="Type" value={leg.isCE === 'CE' ? 'CE' : 'PE'} />
                                </View>
                                <View style={styles.row}>
                                    <Metric label="Expiry" value={leg.isWeekly ? 'Weekly' : 'Monthly'} />
                                    <Metric label="Entry" value={leg.firstSelection} />
                                    <Metric label="Strike" value={leg.secondSelection} />
                                </View>
                                <View style={styles.row}>
                                    <Metric label="SL Trigger" value={leg.slSelection} />
                                    <Metric label="SL Qty" value={leg.slQty} />
                                    <Metric label="Entry On" value={leg.onSelection} />
                                </View>
                                <View style={styles.row}>
                                    <Metric label="TP Trigger" value={leg.tpSelection} />
                                    <Metric label="TP Qty" value={leg.tpQty} />
                                    <Metric label="Exit On" value={leg.onSelectionSec} />
                                </View>
                            </View>
                        ))}
                    </View>
                </LinearGradient>
            </ScrollView>

            {/* Run Button with Loading State */}
            <TouchableOpacity
                style={[styles.runButton, loading && styles.runButtonDisabled]}
                onPress={handleRunStrategy}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.runButtonText}>Run Strategy</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

// Beautiful Metric Component
const Metric = ({ label, value, isBuy }) => (
    <View style={styles.metric}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[
            styles.metricValue,
            isBuy !== undefined ? (isBuy ? styles.buy : styles.sell) : null
        ]}>
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { padding: 16 },
    cardGradient: { borderRadius: 28, padding: 2 },
    cardBox: {
        backgroundColor: '#000',
        borderRadius: 26,
        padding: 20,
    },
    bodyHeader: {
        marginInline: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    strategyName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
    },
    strategyInfo: {
        color: '#AAA',
        fontSize: 14,
        marginTop: 4,
        fontFamily: 'Questrial-Regular',
    },
    badge: {
        backgroundColor: '#723CDF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    badgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 13,
    },
    legCard: {
        backgroundColor: '#111',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#222',
        marginBottom: 10,
    },
    legTitle: {
        color: '#9E68E4',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'black',
        borderRadius: 10,
        paddingBlock: 5,
        marginBottom: 12,
        fontFamily: 'Questrial-Regular',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metric: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    metricLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 4,
        fontFamily: 'Questrial-Regular',
    },
    metricValue: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
    },
    buy: { color: '#4ade80', fontSize: 16 },
    sell: { color: '#f87171', fontSize: 16 },
    runButton: {
        backgroundColor: '#723CDF',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        margin: 10,
    },
    runButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
    },
    errorText: {
        color: '#f87171',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
});

export default StrategyDetailScreen;