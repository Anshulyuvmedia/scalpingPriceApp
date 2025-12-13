// components/portfolio/StockListItem.jsx
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Remove the name conflict – just use anonymous function or proper name
const StockListItem = React.memo(({ item, onPress }) => {
    // ─────── ALL HOOKS FIRST ───────
    const prevLTP = useRef(item?.ltp ?? 0);
    const prevPL = useRef(item?.profitLoss ?? 0);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const flashAnim = useRef(new Animated.Value(0)).current;
    // console.log('item', item);

    // Live animation logic
    useEffect(() => {
        const newLTP = Number(item.ltp) || 0;
        const newPL = Number(item.profitLoss) || 0;

        if (newLTP !== prevLTP.current) {
            pulseAnim.setValue(1.04);
            Animated.spring(pulseAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }).start();
            prevLTP.current = newLTP;
        }

        if (Math.abs(newPL - prevPL.current) > 10) {
            flashAnim.setValue(0.12);
            Animated.timing(flashAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }).start();
            prevPL.current = newPL;
        }
    }, [item.ltp, item.profitLoss]);

    // Safe early return after hooks
    if (!item || Number(item.qty) === 0) {
        return null;
    }
    // Calculations
    const qty = Math.abs(Number(item.availableQty) || 0);
    const avgPrice = Number(item.avgCostPrice) || 0;
    const ltp = Number(item.lastTradedPrice) || 0;
    const investment = Number(item.investment) || avgPrice * qty;
    const currentValue = ltp * qty;
    const unrealizedPL = Number(item.profitLoss) || currentValue - investment;
    const realisedPL = Number(item.realisedPL) || 0;
    const plPct = investment > 0 ? (unrealizedPL / investment) * 100 : 0;
    const dailyChangePct = item.changePercent || 0;

    const isProfit = unrealizedPL > 0;
    const isLoss = unrealizedPL < 0;
    const isDayUp = dailyChangePct > 0;
    const isDayDown = dailyChangePct < 0;

    const format = (n) =>
        Math.abs(n).toFixed(n % 1 === 0 ? 0 : 2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.container}>
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: isProfit ? '#05FF93' : '#FF3366', opacity: flashAnim },
                        ]}
                    />

                    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.card}>
                        {/* Row 1 */}
                        <View style={styles.row1}>
                            <Text style={styles.symbol} numberOfLines={1}>
                                {item.tradingSymbol}
                            </Text>
                                <Text style={styles.exchange}>
                                    ({item.exchange})
                                </Text>
                            <View style={styles.right}>
                                <Text className="text-white">
                                    LTP: <Text style={[styles.ltp, ltp > 0 ? styles.green : ltp < 0 ? styles.red : styles.gray]}>₹{ltp.toFixed(2)}</Text>
                                </Text>
                                {/* <Text
                                    style={[
                                        styles.dailyPct,
                                        isDayUp ? styles.green : isDayDown ? styles.red : styles.gray,
                                    ]}
                                >
                                    ({isDayUp ? 'Up' : isDayDown ? 'Down' : ''}{Math.abs(dailyChangePct).toFixed(2)}%)
                                </Text> */}
                            </View>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.row2}>
                            <View className="flex-row gap-2">
                                <Text style={styles.info}>
                                    Qty: <Text style={styles.infowhite}>{qty.toLocaleString()}</Text>
                                </Text>
                                <Text style={styles.info}>
                                    Avg: <Text style={styles.infowhite}> ₹{avgPrice.toFixed(2)}</Text>
                                </Text>
                            </View>
                            <View style={styles.plBox}>
                                <Text
                                    style={[
                                        styles.pl,
                                        isProfit ? styles.green : isLoss ? styles.red : styles.gray,
                                    ]}
                                >
                                    <Text style={styles.infowhite}>U. P&L:</Text> {unrealizedPL === 0 ? '' : isProfit ? '+' : '-'}₹{format(unrealizedPL)}
                                </Text>

                            </View>
                        </View>

                        {/* Row 3 */}
                        <View style={styles.row3}>
                            <Text style={styles.marketVal}>
                                Investment: ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </Text>
                            <Text
                                style={[
                                    styles.plPct,
                                    isProfit ? styles.green : isLoss ? styles.red : styles.gray,
                                ]}
                            >
                                ({plPct === 0 ? '' : isProfit ? '+' : ''}{plPct.toFixed(2)}%)
                            </Text>
                            {/* <Text style={[styles.realised, realisedPL > 0 ? styles.green : realisedPL < 0 ? styles.red : styles.gray]}>
                                <Text style={styles.infowhite}>R. P&L:</Text> {realisedPL > 0 ? '+' : realisedPL < 0 ? '-' : ''}₹ {format(realisedPL)}
                            </Text> */}
                        </View>
                    </LinearGradient>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
});

// Optional: Give it a display name for debugging
StockListItem.displayName = 'StockListItem';

export default StockListItem;

// ─────── Styles ───────
const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    card: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 14,
    },
    row1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    symbol: { color: '#FFF', fontSize: 16.5, fontWeight: '800', flex: 1,},
    exchange: { color: '#AAA', fontSize: 12, fontWeight: '800', flex: 1,},
    right: { alignItems: 'flex-end', flexDirection: 'row', gap: 3 },
    ltp: { fontSize: 16, fontWeight: '800' },
    dailyPct: { fontSize: 11.5, fontWeight: '700', marginTop: 1 },

    row2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    info: { color: '#AAA', fontSize: 12.8, fontWeight: '600' },
    infowhite: { color: '#fff', fontSize: 12.8, fontWeight: '600' },
    plBox: { alignItems: 'flex-end', flexDirection: 'col', gap: 3 },
    pl: { fontSize: 14.5, fontWeight: '900' },
    plPct: { fontSize: 11.5, fontWeight: '700', marginTop: 1 },

    row3: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    marketVal: { color: '#AAA', fontSize: 12.8, fontWeight: '600' },
    realised: { fontSize: 11.8, fontWeight: '700' },

    green: { color: '#05FF93' },
    red: { color: '#FF3366' },
    gray: { color: '#888' },
});