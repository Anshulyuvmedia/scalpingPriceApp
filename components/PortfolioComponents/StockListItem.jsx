// components/portfolio/StockListItem.jsx
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function StockListItem({ item, onPress }) {
    const currentPrice = (item.investment + item.profitLoss) / item.qty;
    const cmpPct = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
    const uplPct = (item.profitLoss / item.investment) * 100;

    return (
        <TouchableOpacity onPress={onPress} style={{ marginBottom: 12 }}>
            <View style={styles.border}>
                <LinearGradient colors={['#4E4E6A', '#2A2A40']} style={styles.gradientBorder}>
                    <LinearGradient colors={['#000', '#1E1E2F']} style={styles.row}>
                        {/* Left */}
                        <View>
                            <Text style={styles.symbol}>{item.symbol}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.title}>Qty:</Text><Text style={styles.value}>{item.qty}</Text>
                                <Text style={styles.title}>Avg:</Text><Text style={styles.value}>₹{item.avgPrice.toFixed(2)}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.title}>Mkt Val:</Text>
                                <Text style={styles.value}>₹{(currentPrice * item.qty).toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Right */}
                        <View style={{ alignItems: 'flex-end' }}>
                            <View style={styles.infoRow}>
                                <Text style={styles.title}>CMP:</Text>
                                <Text style={[styles.price, cmpPct < 0 ? styles.negative : styles.positive]}>₹{currentPrice.toFixed(2)}</Text>
                                <Text style={[styles.pct, cmpPct < 0 ? styles.negative : styles.positive]}>({cmpPct.toFixed(2)}%)</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.title}>U. P&L:</Text>
                                <Text style={[styles.pct, item.profitLoss < 0 ? styles.negative : styles.positive]}>₹{item.profitLoss.toFixed(2)}</Text>
                                <Text style={[styles.pct, item.profitLoss < 0 ? styles.negative : styles.positive]}>({uplPct.toFixed(2)}%)</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.title}>Realised:</Text>
                                <Text style={[styles.pct, item.realisedPL < 0 ? styles.negative : styles.positive]}>₹{item.realisedPL.toFixed(2)}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    border: { borderRadius: 15, overflow: 'hidden' },
    gradientBorder: { padding: 1.5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 13 },
    symbol: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 8 },
    infoRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
    title: { color: '#888', fontSize: 13, marginRight: 6 },
    value: { color: '#FFF', fontSize: 13, marginRight: 12 },
    price: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    pct: { color: '#FFF', fontSize: 13, marginLeft: 8 },
    positive: { color: '#05FF93' },
    negative: { color: '#FF0505' },
});