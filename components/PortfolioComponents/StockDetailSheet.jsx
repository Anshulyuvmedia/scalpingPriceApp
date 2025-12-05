// components/portfolio/StockDetailSheet.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function StockDetailSheet({ stock }) {
    const router = useRouter();
    if (!stock) return null;

    const qty = Number(stock.qty) || 0;
    const avgPrice = Number(stock.avgPrice) || 0;
    const investment = Number(stock.investment) || 0;
    const currentValue = Number(stock.current) || investment + (Number(stock.profitLoss) || 0);
    const profitLoss = Number(stock.profitLoss) || 0;
    const realisedPL = Number(stock.realisedPL) || 0;
    const daysPL = Number(stock.daysPL) || 0;

    const uplPct = investment > 0 ? (profitLoss / investment) * 100 : 0;
    const isPositive = profitLoss >= 0;
    const isDayPositive = daysPL >= 0;

    const formatINR = (num) => {
        const n = Number(num) || 0;
        return `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };

    const formatQty = (num) => (Number(num) || 0).toLocaleString('en-IN');

    const data = [
        { label: 'Exchange', value: stock.exchange || 'NSE' },
        { label: "Day's P&L", value: formatINR(daysPL), color: isDayPositive ? '#05FF93' : '#FF3366' },
        { label: 'Total Qty', value: formatQty(qty) },
        { label: 'Avg Price', value: formatINR(avgPrice) },
        { label: 'Invested Amount', value: formatINR(investment) },
        { label: 'Current Value', value: formatINR(currentValue), bold: true },
        { label: 'Unrealized P&L', value: `${formatINR(profitLoss)} (${isPositive ? '+' : ''}${uplPct.toFixed(2)}%)`, color: isPositive ? '#05FF93' : '#FF3366', bold: true },
        { label: 'Realized P&L', value: formatINR(realisedPL), color: realisedPL >= 0 ? '#05FF93' : '#FF3366' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <Text style={styles.name}>{stock.name || stock.symbol}</Text>
            </View>

            <View style={styles.grid}>
                {data.map((item) => (
                    <View key={item.label} style={styles.row}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={[
                            styles.value,
                            item.bold && styles.boldValue,
                            item.color && { color: item.color }
                        ]}>{item.value}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => router.push({
                        pathname: '/OrderHistoryScreen',
                        params: { selectedStock: JSON.stringify(stock) }
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
                        <Text style={styles.quoteText}>Quote</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#0F0F1A', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    header: { alignItems: 'center', marginBottom: 24 },
    symbol: { color: '#FFF', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
    name: { color: '#888', fontSize: 16, marginTop: 4 },
    grid: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#333' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
    label: { color: '#A0A0C0', fontSize: 15, fontWeight: '500' },
    value: { color: '#FFF', fontSize: 15, fontWeight: '600', textAlign: 'right', minWidth: 120 },
    boldValue: { fontWeight: '800', fontSize: 16 },
    actions: { gap: 16 },
    historyBtn: { backgroundColor: '#FFC107', padding: 16, borderRadius: 16, alignItems: 'center' },
    historyText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    tradeButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    tradeBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
    buyBtn: { backgroundColor: '#05FF93' },
    sellBtn: { backgroundColor: '#FF3366' },
    quoteBtn: { backgroundColor: '#3366FF' },
    tradeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    quoteText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
