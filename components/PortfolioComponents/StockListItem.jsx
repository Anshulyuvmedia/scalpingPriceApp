// components/portfolio/StockListItem.jsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function StockListItem({ item, onPress }) {
    if (!item || item.qty === 0) return null;

    const qty = Number(item.qty) || 0;
    const avgPrice = Number(item.avgPrice) || 0;
    const ltp = Number(item.ltp) || 0;
    const investment = Number(item.investment) || (avgPrice * qty);
    const currentValue = ltp * qty;
    const unrealizedPL = Number(item.profitLoss) || (currentValue - investment);
    const realisedPL = Number(item.realisedPL) || 0;

    const plPct = investment > 0 ? (unrealizedPL / investment) * 100 : 0;
    const dailyChangePct = item.changePercent || 0;

    const isProfit = unrealizedPL >= 0;
    const isDayUp = dailyChangePct >= 0;

    const f = (n) => Math.abs(n).toLocaleString('en-IN');

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <View style={styles.container}>
                {/* Subtle profit/loss glow */}
                <LinearGradient
                    colors={isProfit
                        ? ['rgba(5,255,147,0.08)', 'transparent']
                        : ['rgba(255,51,102,0.08)', 'transparent']
                    }
                    style={StyleSheet.absoluteFill}
                />

                <LinearGradient colors={['#1A1A2A', '#12121A']} style={styles.card}>
                    {/* Row 1: Symbol + LTP + Daily % */}
                    <View style={styles.row1}>
                        <Text style={styles.symbol}>{item.symbol}</Text>
                        <View style={styles.right}>
                            <Text style={styles.ltp}>₹{ltp.toFixed(1)}</Text>
                            <Text style={[styles.dailyPct, isDayUp ? styles.green : styles.red]}>
                                {isDayUp ? '↑' : '↓'}{Math.abs(dailyChangePct).toFixed(2)}%
                            </Text>
                        </View>
                    </View>

                    {/* Row 2: Qty • Avg • Unrealized P&L */}
                    <View style={styles.row2}>
                        <View className="flex-row gap-3">
                            <Text style={styles.info}>Qty: <Text style={styles.bold}>{qty.toLocaleString()}</Text></Text>
                            <Text style={styles.info}>Avg: <Text style={styles.bold}>₹{avgPrice.toFixed(0)}</Text></Text>
                        </View>
                        <View style={styles.plBox}>
                            <Text style={[styles.pl, isProfit ? styles.green : styles.red]}>
                                {isProfit ? '+' : '-'}₹{f(unrealizedPL)}
                            </Text>
                            <Text style={[styles.plPct, isProfit ? styles.green : styles.red]}>
                                ({isProfit ? '+' : ''}{plPct.toFixed(1)}%)
                            </Text>
                        </View>
                    </View>

                    {/* Row 3: Market Value + Realised */}
                    <View style={styles.row3}>
                        <Text style={styles.marketVal}>Mkt: <Text style={styles.bold}>₹{currentValue.toLocaleString('en-IN')}</Text></Text>
                        <Text style={[styles.realised, realisedPL > 0 ? styles.green : realisedPL < 0 ? styles.red : styles.white]}>
                            Realised: {realisedPL >= 0 ? '+' : '-'}₹{f(realisedPL)}
                        </Text>
                    </View>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 9,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    card: {
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 12,
    },

    // Row 1
    row1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    symbol: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    right: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 5,
    },
    ltp: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    dailyPct: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 1,
    },

    // Row 2
    row2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    info: {
        color: '#AAA',
        fontSize: 12.5,
    },
    bold: {
        color: '#FFF',
        fontWeight: '600',
    },
    plBox: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 5,
    },
    pl: {
        fontSize: 13.5,
        fontWeight: '800',
    },
    plPct: {
        fontSize: 11,
        marginTop: 1,
    },

    // Row 3
    row3: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    marketVal: {
        color: '#AAA',
        fontSize: 12.5,
        fontWeight: '600',
    },
    realised: {
        fontSize: 11.5,
        fontWeight: '700',
    },

    green: { color: '#05FF93' },
    red: { color: '#FF3366' },
    white: { color: '#fff' },
});