// screens/SignalDetails.jsx
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Keyboard, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useStrategies } from '@/contexts/StrategyContext';

const SignalDetails = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const signal = params.signal ? JSON.parse(params.signal) : null;
    const initialQuantity = params.quantity ? String(params.quantity) : '';
    const { executeStrategy, executing } = useStrategies();

    const [selectedBroker, setSelectedBroker] = useState('');
    const [quantity, setQuantity] = useState(initialQuantity ? String(initialQuantity) : '');
    const [quantityError, setQuantityError] = useState('');
    const [brokerError, setBrokerError] = useState('');

    // Safely extract data
    const instrument = signal?.instruments?.[0] || {};
    const currentPrice = instrument.price || 0;
    const instrumentType = instrument.type || 'N/A';
    const exchange = instrument.exchange || 'N/A';
    const lotsize = instrument.lot || 0;

    const positions = signal?.optionPositionBuilder?.positions?.[0] || {};
    const defaultQty = useMemo(() => {
        return lotsize && positions.qty ? lotsize * positions.qty : lotsize || 50;
    }, [lotsize, positions.qty]);

    // console.log('positions:', positions);
    // Fixed: lotCount defined early and only once
    const lotCount = useMemo(() => {
        const qty = quantity.trim() ? parseInt(quantity, 10) : defaultQty;
        if (isNaN(qty) || lotsize <= 0) return 0;
        return Math.floor(qty / lotsize);
    }, [quantity, defaultQty, lotsize]);

    if (!signal) {
        return (
            <View style={styles.container}>
                <HomeHeader page="chatbot" title="Signal Details" />
                <View style={styles.centerWrapper}>
                    <Text style={styles.noData}>No signal data available</Text>
                </View>
            </View>
        );
    }

    const brokers = ['Stratzy', '5Paisa', 'AngelOne', 'IFL', 'Kotak', 'Master'];

    const validateInputs = () => {
        let valid = true;

        if (!selectedBroker) {
            setBrokerError('Please select a broker');
            valid = false;
        } else {
            setBrokerError('');
        }

        const qty = quantity.trim();
        if (qty) {
            const num = parseInt(qty, 10);
            if (isNaN(num) || num <= 0) {
                setQuantityError('Invalid quantity');
                valid = false;
            } else if (lotsize > 0 && num < lotsize) {
                setQuantityError(`Minimum ${lotsize} (1 lot)`);
                valid = false;
            } else if (lotsize > 0 && num % lotsize !== 0) {
                setQuantityError(`Must be multiple of lot size (${lotsize})`);
                valid = false;
            } else {
                setQuantityError('');
            }
        } else {
            setQuantityError('');
        }

        return valid;
    };

    const handleExecute = async () => {
        Keyboard.dismiss();
        if (!validateInputs()) return;

        const qty = quantity.trim() ? parseInt(quantity.trim(), 10) : undefined;

        try {
            const result = await executeStrategy(signal.id, selectedBroker, qty);

            router.push({
                pathname: '/SignalResult',
                params: {
                    strategyId: result.data?.strategyId || result.executionId || signal.id,
                    resultData: JSON.stringify(result),
                },
            });
        } catch (error) {
            Alert.alert('Execution Failed', error.message || 'Something went wrong');
        }
    };

    // Sections data
    const sections = [
        { type: 'hero', key: 'hero' },
        { type: 'section', title: 'Instrument Details', key: 'instrument' },
        { type: 'section', title: 'Order Details', key: 'order' },
        { type: 'section', title: 'Position Settings', key: 'position' },
        { type: 'section', title: 'Trading Schedule', key: 'schedule' },
        { type: 'section', title: 'Risk Management', key: 'risk' },
        { type: 'execute', key: 'execute' },
    ];

    const renderItem = ({ item }) => {
        if (item.type === 'hero') {
            return (
                <LinearGradient colors={['#723CDF', '#9D7BEF']} style={styles.heroGradient}>
                    <View style={styles.heroTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.strategyName}>{signal.strategyName || 'Strategy'}</Text>
                            <Text style={styles.symbol}>{instrument.name || 'Symbol'}</Text>
                        </View>
                        <View style={styles.liveBadge}>
                            <Feather name="zap" size={16} color="#000" />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    </View>
                    <View style={styles.heroBottomRow}>
                        <View style={styles.heroMetric}>
                            <Text style={styles.heroMetricLabel}>Current Price</Text>
                            <Text style={styles.heroMetricValue}>₹{currentPrice.toFixed(2)}</Text>
                        </View>
                        <View style={styles.heroMetric}>
                            <Text style={styles.heroMetricLabel}>Lot Size</Text>
                            <Text style={styles.heroMetricValue}>{lotsize || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Performance Ratio</Text>
                        <View style={{ flexDirection: 'row', borderRadius: 12, overflow: 'hidden' }}>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#22c55e' }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Up 68.4%</Text>
                            </View>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#ef4444' }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Down 31.6%</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            );
        }

        if (item.type === 'section') {
            switch (item.key) {
                case 'instrument':
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Instrument Details</Text>
                            <View style={styles.cardRow}>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Type</Text>
                                    <Text style={styles.metricValue}>{instrumentType}</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Exchange</Text>
                                    <Text style={styles.metricValue}>{exchange}</Text>
                                </View>
                            </View>
                        </View>
                    );

                case 'order':
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Details</Text>
                            <View style={styles.cardRow}>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Order Type</Text>
                                    <Text style={styles.metricValue}>{signal.orderSettings?.orderType || '-'}</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Transaction</Text>
                                    <Text style={styles.metricValue}>{signal.orderSettings?.transactionType || '-'}</Text>
                                </View>
                            </View>
                            <View style={styles.cardRow}>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Chart Type</Text>
                                    <Text style={styles.metricValue}>{signal.orderSettings?.chartType || '-'}</Text>
                                </View>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Interval</Text>
                                    <Text style={styles.metricValue}>
                                        {signal.orderSettings?.interval ? `${signal.orderSettings.interval} min` : '-'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );

                case 'position':
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Position Settings</Text>
                            <View style={styles.card}>
                                <View style={styles.positionGrid}>
                                    <PositionItem label="Action" value={positions.isBuy} />
                                    <PositionItem label="When Long Condition" value={positions.longIsCE} />
                                    <PositionItem label="When Short Condition" value={positions.shortIsCE} />
                                    <PositionItem label="Expiry" value={positions.isWeekly} />
                                    <PositionItem label={`Target Profit (${positions.tpSelection})`} value={positions.tpValue} />
                                    <PositionItem label="Target Profit Execution" value={positions.tpOn} />
                                    <PositionItem label={`Stoploss (${positions.slSelection})`} value={positions.slValue} />
                                    <PositionItem label="Stoploss Execution" value={positions.slOn} />

                                    <PositionItem label={positions.firstSelection} value={positions.secondSelection} />
                                </View>
                            </View>
                        </View>
                    );

                case 'schedule':
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Trading Schedule</Text>
                            <View style={styles.card}>
                                <InfoRow icon="clock" label="Start Time" value={signal.orderSettings?.startTime || '09:16'} />
                                <InfoRow icon="square" label="Square Off" value={signal.orderSettings?.squareOff || '15:15'} />
                                <InfoRow icon="calendar" label="Days" value={signal.orderSettings?.days?.join(', ') || 'MON - FRI'} />
                            </View>
                        </View>
                    );

                case 'risk':
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Risk Management</Text>
                            <View style={styles.cardRow}>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Max Trades / Day</Text>
                                    <Text style={styles.metricValue}>{signal.riskManagement?.total || 'Unlimited'}</Text>
                                </View>
                            </View>
                        </View>
                    );

                default:
                    return null;
            }
        }

        if (item.type === 'execute') {
            return (
                <View style={[styles.section, { marginBottom: 20 }]}>
                    <Text style={styles.sectionTitle}>Execute with Broker</Text>

                    {/* Broker Selection */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={styles.quantityLabel}>Select Broker</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={brokers}
                            keyExtractor={(item) => item}
                            renderItem={({ item: broker }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.brokerChip,
                                        selectedBroker === broker ? styles.brokerActive : styles.brokerInactive,
                                        brokerError && styles.brokerChipError,
                                    ]}
                                    onPress={() => {
                                        setSelectedBroker(broker);
                                        setBrokerError('');
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.brokerText,
                                            selectedBroker === broker && styles.brokerTextActive,
                                        ]}
                                    >
                                        {broker}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.brokerListContent}
                        />
                        {brokerError && <Text style={styles.errorText}>{brokerError}</Text>}
                    </View>

                    {/* Enhanced Quantity Input with + / – Buttons */}
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>Quantity</Text>
                        <View style={styles.quantityInputWrapper}>
                            <TextInput
                                style={[
                                    styles.quantityInput,
                                    quantityError && styles.inputError,
                                ]}
                                value={quantity}
                                onChangeText={(text) => {
                                    const nums = text.replace(/[^0-9]/g, '');
                                    setQuantity(nums);
                                    setQuantityError('');
                                }}
                                placeholder={`Default: ${defaultQty} (${lotCount} lot${lotCount !== 1 ? 's' : ''})`}
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                editable={true}
                            />

                            {/* Stepper Buttons (+ / –) */}
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => {
                                        const current = parseInt(quantity || '0') || defaultQty;
                                        const newQty = Math.max(lotsize, current - lotsize); // min 1 lot
                                        setQuantity(String(newQty));
                                        setQuantityError('');
                                    }}
                                >
                                    <Text style={styles.stepperText}>−</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => {
                                        const current = parseInt(quantity || '0') || defaultQty;
                                        const newQty = current + lotsize;
                                        setQuantity(String(newQty));
                                        setQuantityError('');
                                    }}
                                >
                                    <Text style={styles.stepperText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Clear Button */}
                            {quantity ? (
                                <TouchableOpacity style={styles.clearQtyBtn} onPress={() => setQuantity('')}>
                                    <Feather name="x" size={20} color="#888" />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {quantityError ? <Text style={styles.errorText}>{quantityError}</Text> : null}

                    </View>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <View style={{ marginHorizontal: 12 }}>
                <HomeHeader page="chatbot" title="Signal Details" />
            </View>

            <FlatList
                data={sections}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.executeBtn,
                                (!selectedBroker || executing) && { opacity: 0.6 },
                            ]}
                            onPress={handleExecute}
                            disabled={!selectedBroker || executing}
                        >
                            <Text style={styles.executeText}>
                                {executing ? 'Executing...' : `Execute with ${selectedBroker}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

// Helper Components (must be defined before use or inside file)
const PositionItem = ({ label, value }) => (
    <View style={styles.positionItem}>
        <Text style={styles.positionLabel}>{label}</Text>
        <Text style={styles.positionValue}>
            {value !== undefined && value !== null ? String(value) : '-'}
        </Text>
    </View>
);

const InfoRow = ({ icon, label, value }) => (
    <>
        <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
                <Feather name={icon} size={16} color="#C1A5FF" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
        <View style={styles.infoDivider} />
    </>
);

export default SignalDetails;

// Styles remain unchanged — you already had them perfectly
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050509' },
    centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noData: { color: '#FFFFFF', textAlign: 'center', fontSize: 16, opacity: 0.8 },

    heroGradient: { marginHorizontal: 16, marginTop: 12, borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18 },
    heroTopRow: { flexDirection: 'row', alignItems: 'center' },
    heroBottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
    strategyName: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Sora-SemiBold' },
    symbol: { fontSize: 13, color: '#E6E2FF', marginTop: 4 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#05FF93', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
    liveText: { color: '#000', fontWeight: '700', marginLeft: 6, fontSize: 11 },
    heroMetricLabel: { fontSize: 11, color: '#E3D9FF', opacity: 0.9 },
    heroMetricValue: { fontSize: 18, color: '#FFFFFF', fontWeight: '700', marginTop: 4 },

    section: { paddingHorizontal: 16, marginTop: 18 },
    sectionTitle: { color: '#C1A5FF', fontSize: 15, fontWeight: '600', marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase' },

    card: { backgroundColor: '#0B0B12', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#181828' },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
    metricCard: { flex: 1, backgroundColor: '#0B0B12', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#181828' },
    metricLabel: { color: '#8A8FA6', fontSize: 12 },
    metricValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },

    positionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    positionItem: { width: '48%', backgroundColor: '#10101A', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 10 },
    positionLabel: { fontSize: 11, color: '#8A8FA6' },
    positionValue: { marginTop: 3, fontSize: 14, color: '#FFFFFF', fontWeight: '600' },

    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    infoIconWrapper: { width: 28, height: 28, borderRadius: 999, backgroundColor: '#181828', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    infoLabel: { color: '#8A8FA6', fontSize: 11 },
    infoValue: { color: '#FFFFFF', fontSize: 14, marginTop: 2 },
    infoDivider: { height: 1, backgroundColor: '#151523', marginVertical: 4 },

    brokerListContent: { paddingVertical: 4 },
    brokerChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8, borderWidth: 1 },
    brokerActive: { backgroundColor: '#723CDF', borderColor: '#723CDF' },
    brokerInactive: { backgroundColor: 'transparent', borderColor: '#26263A' },
    brokerText: { color: '#A4A8C0', fontSize: 13, fontWeight: '500' },
    brokerTextActive: { color: '#FFFFFF' },

    quantityContainer: { marginBottom: 16 },
    quantityLabel: { color: '#C1A5FF', fontSize: 14, marginBottom: 8, fontWeight: '600' },
    quantityInputWrapper: { position: 'relative' },
    quantityInput: { backgroundColor: '#0F0F1A', color: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#26263A' },
    clearQtyBtn: { position: 'absolute', right: 12, top: 14, zIndex: 1 },
    inputError: { borderColor: '#FF4444', borderWidth: 1.5 },
    brokerChipError: { borderColor: '#FF4444' },
    lotHint: { color: '#888', fontSize: 12, marginTop: 6, textAlign: 'center' },
    errorText: { color: '#FF6666', fontSize: 12, marginTop: 6, fontWeight: '500' },

    footer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4, backgroundColor: 'rgba(5,5,9,0.96)', borderTopWidth: 1, borderTopColor: '#141425' },
    executeBtn: { backgroundColor: '#723CDF', paddingVertical: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    executeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    stepperContainer: {
        position: 'absolute',
        right: 8,
        top: 4,
        bottom: 4,
        flexDirection: 'row',
        backgroundColor: '#1A1A2E',
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: 10,
    },
    stepperBtn: {
        width: 40,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#333',
    },
    stepperText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '600',
        includeFontPadding: false,
    },
});