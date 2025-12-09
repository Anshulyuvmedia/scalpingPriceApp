// app/(tabs)/strategy-detail.tsx
import HomeHeader from '@/components/HomeHeader';
import { getTemplateLegs } from '@/constants/templateConfigs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const API_BASE_URL = 'http://192.168.1.18:3000/api';

const StrategyDetailScreen = () => {
    const { name } = useLocalSearchParams();
    const strategyName = Array.isArray(name) ? name[0] : name;
    const [loading, setLoading] = React.useState(false);
    const [errorModal, setErrorModal] = React.useState(null);
    const router = useRouter();

    const legs = React.useMemo(() => {
        const baseLegs = getTemplateLegs(strategyName || '');
        return baseLegs.map(leg => ({ ...leg, currentQty: leg.qty }));
    }, [strategyName]);

    const handleRunStrategy = async () => {
        if (!strategyName || legs.length === 0) return;

        setLoading(true);
        setErrorModal(null); // Clear previous error

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setErrorModal('Session expired. Please log in again.');
                setLoading(false);
                return;
            }

            const payload = {
                strategyName,
                legs: legs.map(leg => ({
                    action: leg.isBuy ? 'BUY' : 'SELL',
                    qty: leg.currentQty || leg.qty,
                    optionType: leg.isCE,
                    expiryType: leg.isWeekly ? 'WEEKLY' : 'MONTHLY',
                    strikeCriteria: leg.firstSelection,
                    strikeValue: leg.secondSelection,
                    slTrigger: leg.slSelection,
                    slQty: leg.slQty,
                    tpTrigger: leg.tpSelection,
                    tpQty: leg.tpQty,
                    entryTiming: leg.onSelection,
                    exitTiming: leg.onSelectionSec,
                })),
            };

            const response = await axios.post(
                `${API_BASE_URL}/indicator-strategies/run`,
                payload,
                {
                    headers: {
                        Authorization: token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const result = response.data.result || response.data;

            // SUCCESS → Go directly to results screen (no modal)
            router.push({
                pathname: '/StrategyResult',
                params: {
                    strategyName,
                    strategyId: result.id || result.strategyId || 'N/A',
                    resultData: JSON.stringify(result),
                },
            });

        } catch (error) {
            const msg =
                error.response?.data?.error?.message ||
                error.message ||
                'Failed to run strategy. Please try again.';

            // Show error in modal
            setErrorModal(msg);
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
            {/* Main Content */}
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
                        <View style={styles.header}>
                            <Text style={styles.strategyName}>{strategyName}</Text>
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

            {/* Run Button */}
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

            {/* ERROR MODAL ONLY */}
            <Modal
                transparent
                visible={!!errorModal}
                animationType="fade"
                onRequestClose={() => setErrorModal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.errorModal}>
                        <LinearGradient
                            colors={['#ff4d4d', '#ff1a1a']}
                            style={styles.errorGradient}
                        >
                            <Text style={styles.errorTitle}>Error</Text>
                            <Text style={styles.errorMessage}>{errorModal}</Text>
                            <TouchableOpacity
                                style={styles.errorButton}
                                onPress={() => setErrorModal(null)}
                            >
                                <Text style={styles.errorButtonText}>Close</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const Metric = ({ label, value, isBuy }) => (
    <View style={styles.metric}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, isBuy !== undefined && (isBuy ? styles.buy : styles.sell)]}>
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bodyHeader: { marginHorizontal: 10 },
    scrollContent: { padding: 16 },
    cardGradient: { borderRadius: 28, padding: 2 },
    cardBox: { backgroundColor: '#000', borderRadius: 26, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    strategyName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', fontFamily: 'Questrial-Regular' },
    badge: { backgroundColor: '#723CDF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    legCard: { backgroundColor: '#111', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#222', marginBottom: 10 },
    legTitle: {
        color: '#9E68E4',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'black',
        borderRadius: 10,
        paddingVertical: 5,
        marginBottom: 12,
        fontFamily: 'Questrial-Regular',
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    metric: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
    metricLabel: { color: '#888', fontSize: 12, marginBottom: 4, fontFamily: 'Questrial-Regular' },
    metricValue: { color: '#FFF', fontSize: 15, fontWeight: 'bold', fontFamily: 'Questrial-Regular' },
    buy: { color: '#4ade80', fontSize: 16 },
    sell: { color: '#f87171', fontSize: 16 },
    runButton: { backgroundColor: '#723CDF', paddingVertical: 18, borderRadius: 10, alignItems: 'center', margin: 10 },
    runButtonDisabled: { opacity: 0.6 },
    runButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', fontFamily: 'Questrial-Regular' },
    errorText: { color: '#f87171', fontSize: 18, textAlign: 'center', marginTop: 100 },

    // Error Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorModal: {
        width: '85%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 20,
    },
    errorGradient: {
        padding: 24,
        alignItems: 'center',
    },
    errorTitle: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    errorMessage: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    errorButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
    },
    errorButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default StrategyDetailScreen;