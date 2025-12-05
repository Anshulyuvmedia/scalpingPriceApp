// components/portfolio/PositionDetailSheet.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PositionDetailSheet({ stock }) {
    const router = useRouter();
    if (!stock) return null;

    // Safe number extraction
    const qty = Number(stock.qty) || 0;
    const avgPrice = Number(stock.avgPrice) || 0;
    const investment = Number(stock.investment) || 0;
    const profitLoss = Number(stock.profitLoss) || 0;
    const realisedPL = Number(stock.realisedPL) || 0;
    const daysPL = Number(stock.daysPL) || 0;
    const currentValue = investment + profitLoss;

    const uplPct = investment > 0 ? (profitLoss / investment) * 100 : 0;
    const isPositive = profitLoss >= 0;
    const isDayPositive = daysPL >= 0;

    const formatINR = (num) => {
        const n = Number(num) || 0;
        return n === 0 ? '₹0' : `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };

    const data = [
        { label: 'Exchange', value: stock.exchange || 'NSE' },
        { label: "Day's P&L", value: formatINR(daysPL), color: isDayPositive ? '#05FF93' : '#FF3366' },
        { label: 'Position Type', value: stock.positionType || '—' },
        { label: 'Product Type', value: stock.productType || '—' },
        { label: 'Net Qty', value: qty.toLocaleString('en-IN'), bold: true },
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

            <View style={styles.card}>
                {data.map((item) => (
                    <View key={item.label} style={styles.row}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={[
                            styles.value,
                            item.bold && styles.bold,
                            item.color && { color: item.color }
                        ]}>
                            {item.value}
                        </Text>
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
                    <Text style={styles.historyText}>View Transaction History</Text>
                </TouchableOpacity>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.buy]}>
                        <Text style={styles.actionText}>Buy More</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.sell]}>
                        <Text style={styles.actionText}>Sell</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.quote]}>
                        <Text style={styles.actionText}>Quote</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#0F0F1A',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    symbol: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 1,
    },
    name: {
        color: '#888',
        fontSize: 16,
        marginTop: 6,
    },
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 20,
        padding: 18,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    label: {
        color: '#A0A0C0',
        fontSize: 15,
        fontWeight: '600',
    },
    value: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'right',
        minWidth: 140,
    },
    bold: {
        fontWeight: '800',
        fontSize: 16,
    },

    actions: { gap: 16 },
    historyBtn: {
        backgroundColor: '#FFC107',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    historyText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    buy: { backgroundColor: '#05FF93' },
    sell: { backgroundColor: '#FF3366' },
    quote: { backgroundColor: '#3366FF' },
    actionText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});