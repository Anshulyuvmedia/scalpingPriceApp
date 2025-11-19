// components/SignalCard.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MetricItem = ({ label, value, isQuantity, onDecrease, onIncrease, valueStyle }) => (
    <LinearGradient
        colors={['#2D2B33', '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 0.7 }}
        style={styles.metricGradient}
    >
        <View style={styles.metricContainer}>
            <Text style={styles.metricLabel}>{label}</Text>
            {isQuantity ? (
                <View style={styles.quantityControls}>
                    <TouchableOpacity style={styles.quantityBtn} onPress={onDecrease}>
                        <Text style={styles.quantityBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.metricValue}>{value}</Text>
                    <TouchableOpacity style={styles.quantityBtn} onPress={onIncrease}>
                        <Text style={styles.quantityBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={[styles.metricValue, valueStyle]}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                </Text>
            )}
        </View>
    </LinearGradient>
);

const SignalCard = ({ item }) => {
    // Use quantity from API if exists, otherwise default to 1
    const [quantity, setQuantity] = useState(item.quantity || 1);
    const navigation = useNavigation();
    // console.log(item);
    // Extract real data safely
    const instrument = item.instruments?.[0] || {};
    const currentPrice = instrument.price || 0;
    const symbol = instrument.name || 'NIFTY';

    // === REAL Entry, Target, SL from signal ===
    const entryPrice = item.entryPrice || currentPrice * 0.98; // fallback
    const targetPrice = item.targetPrice || entryPrice * 1.08;  // fallback: +8%
    const stopLossPrice = item.stopLossPrice || entryPrice * 0.97; // fallback: -3%

    // Live P&L calculation
    const pnlPercent = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;

    const name = item.strategyName || 'Unknown Strategy';
    const days = item.orderSettings?.days?.join(', ') || 'MON-FRI';
    const startTime = item.orderSettings?.startTime || '09:16';
    const interval = item.orderSettings?.interval ? `${item.orderSettings.interval} min` : 'Time-based';

    const handleViewDetails = () => {
        navigation.navigate('SignalDetails', {
            signal: item,
            quantity, // pass current selected quantity
        });
    };

    return (
        <LinearGradient
            colors={['#723CDF', '#9D7BEF', '#0C0C18']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
        >
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.dot, { backgroundColor: '#05FF93' }]} />
                        <View>
                            <Text style={styles.strategyName}>{name}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.header}>
                    <View>
                        <Text style={styles.symbolText}>{symbol}</Text>
                        <Text style={styles.dateText}>{days}</Text>
                    </View>
                    <View style={styles.liveBadge}>
                        <Feather name="zap" size={14} color="#000" />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>

                {/* Metrics */}
                <View style={styles.metricsRow}>
                    <MetricItem label="Entry Time" value={startTime} />
                    <MetricItem label="Interval" value={interval} />
                </View>

                <View style={styles.metricsRow}>
                    <MetricItem label="Entry" value={entryPrice} />
                    <MetricItem label="Current" value={currentPrice} />
                    <MetricItem
                        label="P&L"
                        value={
                            <Text style={{ color: pnlPercent > 0 ? '#05FF93' : '#FF05A1' }}>
                                {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </Text>
                        }
                    />
                </View>

                <View style={styles.metricsRow}>
                    <MetricItem label="Target" value={targetPrice} />
                    <MetricItem label="StopLoss" value={stopLossPrice} />
                    <MetricItem label="Quantity" value={quantity} />
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={handleViewDetails}>
                        <Text style={styles.secondaryBtnText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

export default SignalCard;

const styles = StyleSheet.create({
    cardGradient: {
        borderRadius: 28,
        padding: 1.5,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    card: {
        backgroundColor: '#000',
        borderRadius: 26,
        padding: 18,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 12,
        marginTop: 4,
    },
    strategyName: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: 'bold',
        fontFamily: 'Sora-ExtraBold',
    },
    typeText: {
        color: '#9D7BEF',
        fontSize: 13,
        fontFamily: 'Sora-SemiBold',
        marginTop: 2,
    },
    dateText: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#05FF93',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    liveText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 4,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
    },
    metricGradient: {
        borderRadius: 12,
        padding: 1,
        flex: 1,
        marginHorizontal: 4,
    },
    metricContainer: {
        backgroundColor: '#0F0F0F',
        borderRadius: 11,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    metricLabel: {
        color: '#888',
        fontSize: 12,
        fontFamily: 'Sora-Medium',
        marginBottom: 4,
    },
    metricValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Sora-Bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    quantityBtn: {
        backgroundColor: '#723CDF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBtnText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: '#723CDF',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    secondaryBtn: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#723CDF',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#723CDF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    symbolText: {
        color: '#05FF93',
        fontSize: 13,
        fontFamily: 'Sora-Medium',
        marginTop: 2,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
});