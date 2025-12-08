// components/portfolio/StockDetailSheet.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function StockDetailSheet({ stock, showConvertButton = true }) {
    const router = useRouter();
    if (!stock) return null;
    console.log(stock);
    // ─────────────────────────────────────
    // Safe extraction – Dhan holdings fields
    // ─────────────────────────────────────
    const qty = Math.abs(Number(stock.qty || stock.availableQty || stock.holdingQuantity || 0));
    const avgPrice = Number(stock.avgCostPrice || stock.buyAvg || 0);
    const ltp = Number(stock.ltp || 0);
    const investment = Number(stock.investment || avgPrice * qty);
    const currentValue = ltp * qty;
    const unrealizedPL = currentValue - investment;
    const realizedPL = Number(stock.realizedProfitLoss || stock.realisedPL || 0);

    // Day's P&L (if available from live feed, else fallback)
    const daysChange = Number(stock.change || 0);
    const daysPL = daysChange * qty;

    const uplPct = investment > 0 ? (unrealizedPL / investment) * 100 : 0;

    const isProfit = unrealizedPL >= 0;
    const isDayProfit = daysPL >= 0;

    const formatINR = (num) => {
        const n = Number(num) || 0;
        const abs = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
        return `₹${abs}`;
    };

    const formatPct = (num) => {
        const n = Number(num) || 0;
        return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
    };

    const data = [
        { label: 'Exchange', value: stock.exchange || 'NSE' },
        // { label: "Day's P&L", value: formatINR(daysPL), secondary: daysPL !== 0 ? formatPct((daysPL / investment) * 100) : '', color: isDayProfit ? '#05FF93' : '#FF3366' },
        { label: 'Total Qty', value: qty.toLocaleString('en-IN') },
        { label: 'Avg. Cost', value: formatINR(avgPrice) },
        { label: 'Invested', value: formatINR(investment) },
        // { label: 'Current Value', value: formatINR(currentValue), bold: true },
        { label: 'Unrealized P&L', value: formatINR(unrealizedPL), secondary: formatPct(uplPct), color: isProfit ? '#05FF93' : '#FF3366', bold: true },
        // { label: 'Realized P&L', value: formatINR(realizedPL), color: realizedPL >= 0 ? '#05FF93' : '#FF3366' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.symbol}>{stock.tradingSymbol || stock.symbol}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.grid}>
                {data.map((item) => (
                    <View key={item.label} style={styles.row}>
                        <Text style={styles.label}>{item.label}</Text>
                        <View style={styles.valueContainer}>
                            <Text style={[
                                styles.value,
                                item.bold && styles.boldValue,
                                item.color && { color: item.color }
                            ]}>
                                {item.value}
                            </Text>
                            {item.secondary && (
                                <Text style={[styles.secondary, item.color && { color: item.color }]}>
                                    {item.secondary}
                                </Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => router.push({
                        pathname: '/OrderHistoryScreen',
                        params: {
                            securityId: stock.securityId || stock.isin,
                            symbol: stock.tradingSymbol
                        }
                    })}
                >
                    <Text style={styles.historyText}>Transaction History</Text>
                </TouchableOpacity>

                <View style={styles.tradeButtons}>
                    <TouchableOpacity style={[styles.tradeBtn, styles.buyBtn]}>
                        <Text style={styles.tradeText}>Buy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tradeBtn, styles.sellBtn]}>
                        <Text style={styles.tradeText}>Sell</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tradeBtn, styles.quoteBtn]}>
                        <Text style={styles.tradeText}>Quote</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#0F0F1A' },
    header: { alignItems: 'center', marginBottom: 24 },
    symbol: { color: '#FFF', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
    name: { color: '#888', fontSize: 16, marginTop: 4 },

    grid: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#333' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#2A2A3A' },
    label: { color: '#A0A0C0', fontSize: 15, fontWeight: '500' },
    valueContainer: { alignItems: 'flex-end' },
    value: { color: '#FFF', fontSize: 15, fontWeight: '600', textAlign: 'right' },
    secondary: { color: 'inherit', fontSize: 13, marginTop: 2, opacity: 0.9 },
    boldValue: { fontWeight: '800', fontSize: 16 },

    actions: { gap: 16 },
    historyBtn: { backgroundColor: '#FFC107', padding: 16, borderRadius: 16, alignItems: 'center' },
    historyText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    tradeButtons: { flexDirection: 'row', gap: 12 },
    tradeBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    buyBtn: { backgroundColor: '#05FF93' },
    sellBtn: { backgroundColor: '#FF3366' },
    quoteBtn: { backgroundColor: '#3366FF' },
    tradeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});