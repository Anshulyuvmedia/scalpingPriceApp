// components/portfolio/PositionListItem.jsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const PositionListItem = ({ item, onPress }) => {
    // Safe parsing
    const qty = Number(item.qty) || 0;
    const avgPrice = Number(item.avgPrice) || 0;
    const investment = Number(item.investment) || 0;
    const profitLoss = Number(item.profitLoss) || 0;
    const realisedPL = Number(item.realisedPL) || 0;

    const currentValue = investment + profitLoss;
    const currentPrice = qty !== 0 ? currentValue / qty : avgPrice;
    const priceChangePct = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
    const uplPct = investment > 0 ? (profitLoss / investment) * 100 : 0;

    const formatINR = (n) => {
        const num = Number(n) || 0;
        return num === 0 ? '₹0' : `₹${Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View style={styles.container}>
                <LinearGradient
                    colors={profitLoss >= 0
                        ? ['rgba(5, 255, 147, 0.15)', 'transparent']
                        : ['rgba(255, 51, 102, 0.15)', 'transparent']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.glow}
                />

                <LinearGradient
                    colors={['#1E1E2F', '#16213E']}
                    style={styles.card}
                >
                    <View style={styles.header}>
                        <Text style={styles.symbol}>{item.symbol}</Text>
                        <Text style={styles.positionType}>
                            {item.positionType} • {item.productType}
                        </Text>
                    </View>

                    <View style={styles.grid}>
                        <View>
                            <Text style={styles.label}>Qty</Text>
                            <Text style={styles.value}>{qty.toLocaleString('en-IN')}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Avg</Text>
                            <Text style={styles.value}>₹{avgPrice.toFixed(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>LTP</Text>
                            <Text style={[styles.value, styles.bold, priceChangePct >= 0 ? styles.positive : styles.negative]}>
                                ₹{currentPrice.toFixed(0)}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.label}>P&L</Text>
                            <Text style={[styles.value, styles.bold, profitLoss >= 0 ? styles.positive : styles.negative]}>
                                {profitLoss >= 0 ? '+' : ''}{formatINR(profitLoss)}
                            </Text>
                            <Text style={[styles.pct, profitLoss >= 0 ? styles.positive : styles.negative]}>
                                ({uplPct.toFixed(1)}%)
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
};

export default PositionListItem;

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    glow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
    },
    card: {
        padding: 18,
        borderRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    symbol: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    positionType: {
        color: '#888',
        fontSize: 12,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        color: '#888',
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    bold: {
        fontWeight: '800',
        fontSize: 16,
    },
    pct: {
        fontSize: 12,
        marginTop: 2,
    },
    positive: { color: '#05FF93' },
    negative: { color: '#FF3366' },
});