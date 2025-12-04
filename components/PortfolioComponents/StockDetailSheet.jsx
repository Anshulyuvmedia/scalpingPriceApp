// components/portfolio/StockDetailSheet.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function StockDetailSheet({ stock }) {
    const router = useRouter();
    if (!stock) return null;

    const currentValue = stock.investment + stock.profitLoss;
    const uplPct = (stock.profitLoss / stock.investment) * 100;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{stock.symbol} - {stock.name}</Text>

            {[
                ['Exchange', stock.exchange],
                ["Day's PL", `₹${stock.daysPL.toFixed(2)}`, stock.daysPL < 0 ? styles.negative : styles.positive],
                ['Total Qty', stock.qty],
                ['Long Term Qty', stock.longTermQty || 0],
                ['Avg Price', `₹${stock.avgPrice.toFixed(2)}`],
                ['Invested', `₹${stock.investment.toFixed(2)}`],
                ['Current Value', `₹${currentValue.toFixed(2)}`],
                ['Unrealized P&L', `₹${stock.profitLoss.toFixed(2)} (${uplPct.toFixed(2)}%)`, stock.profitLoss < 0 ? styles.negative : styles.positive],
                ['Realized P&L', `₹${stock.realisedPL.toFixed(2)}`],
            ].map(([label, value, textStyle]) => (
                <View key={label} style={styles.row}>
                    <Text style={styles.label}>{label}:</Text>
                    <Text style={[styles.value, textStyle]}>{value}</Text>
                </View>
            ))}

            <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => router.push({ pathname: '/OrderHistoryScreen', params: { selectedStock: JSON.stringify(stock) } })}
            >
                <Text style={styles.historyText}>View Transaction History</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: 'green' }]}><Text style={styles.btnText}>Buy</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: 'red' }]}><Text style={styles.btnText}>Sell</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: 'lightblue' }]}><Text style={styles.historyText}>Get Quote</Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { color: '#FFF', fontSize: 22, fontWeight: '600', marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    label: { color: '#FFF', fontSize: 15 },
    value: { color: '#A9A9A9', fontSize: 15 },
    positive: { color: '#05FF93' },
    negative: { color: '#FF0505' },
    historyBtn: { backgroundColor: '#FFC107', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 20 },
    historyText: { color: '#000', fontWeight: 'bold' },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
    btnText: { color: '#FFF', fontWeight: 'bold' },
});