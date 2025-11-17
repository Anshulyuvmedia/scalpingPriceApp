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

const MetricItem = ({ label, value, isQuantity, onDecrease, onIncrease }) => (
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
                <Text style={styles.metricValue}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                </Text>
            )}
        </View>
    </LinearGradient>
);

const SignalCard = ({ item }) => {
    const [quantity, setQuantity] = useState(1);

    const handleDecrease = () => quantity > 1 && setQuantity(q => q - 1);
    const handleIncrease = () => setQuantity(q => q + 1);

    // Extract data safely
    const name = item.strategyName || 'Unknown Strategy';
    const type = item.strategyType === 'indicatorbased' ? 'Indicator Based' :
        item.strategyType === 'timebased' ? 'Time Based' : 'Custom';
    const interval = item.orderSettings?.interval
        ? `${item.orderSettings.interval} min`
        : 'No Interval (Time-based)';
    const startTime = item.orderSettings?.startTime || '09:16';
    const days = item.orderSettings?.days?.join(', ') || 'MON-FRI';
    const created = new Date(item.createdAt).toLocaleDateString('en-IN');

    // Mock live P&L (you'll replace with real later)
    const entryPrice = 1780;
    const currentPrice = 1825.50;
    const target = 1950;
    const stopLoss = 1720;
    const pnl = ((currentPrice - entryPrice) / entryPrice * 100).toFixed(2);

    return (
        <LinearGradient
            colors={['#723CDF', '#9D7BEF', '#0C0C18']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
        >
            <View style={styles.card}>
                {/* Header */}
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
                        <Text style={styles.typeText}>{type}</Text>
                        <Text style={styles.dateText}>{days}</Text>
                    </View>
                    <View style={styles.liveBadge}>
                        <Feather name="zap" size={14} color="#000" />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>

                {/* Metrics Row 1 */}
                <View style={styles.metricsRow}>
                    <MetricItem label="Entry Time" value={startTime} />
                    <MetricItem label="Interval" value={interval} />
                </View>

                {/* Metrics Row 2 - Live Trading */}
                <View style={styles.metricsRow}>
                    <MetricItem label="Entry" value={entryPrice} />
                    <MetricItem
                        label="Current"
                        value={currentPrice}
                    />
                    <MetricItem
                        label="P&L"
                        value={
                            <Text style={{ color: pnl > 0 ? '#05FF93' : '#FF05A1' }}>
                                {pnl > 0 ? '+' : ''}{pnl}%
                            </Text>
                        }
                    />
                </View>

                {/* Metrics Row 3 */}
                <View style={styles.metricsRow}>
                    <MetricItem label="Target" value={target} />
                    <MetricItem label="StopLoss" value={stopLoss} />
                    <MetricItem
                        label="Quantity"
                        value={quantity}
                        isQuantity
                        onDecrease={handleDecrease}
                        onIncrease={handleIncrease}
                    />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>Execute Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryBtn}>
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
});