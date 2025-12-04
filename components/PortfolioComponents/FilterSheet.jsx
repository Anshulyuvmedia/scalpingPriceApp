// components/portfolio/FilterSheet.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function FilterSheet({
    exchange, setExchange,
    realizedLossActive, setRealizedLossActive,
    realizedProfitActive, setRealizedProfitActive,
    unrealizedLossActive, setUnrealizedLossActive,
    unrealizedProfitActive, setUnrealizedProfitActive,
    sortBy, sortOrder, handleSort
}) {
    const filters = [
        { key: 'All', label: 'All' },
        { key: 'NSE', label: 'NSE' },
        { key: 'BSE', label: 'BSE' },
    ];

    const toggleFilters = [
        { label: 'Realized Loss', state: realizedLossActive, set: setRealizedLossActive },
        { label: 'Realized Profit', state: realizedProfitActive, set: setRealizedProfitActive },
        { label: 'Unrealized Loss', state: unrealizedLossActive, set: setUnrealizedLossActive },
        { label: 'Unrealized Profit', state: unrealizedProfitActive, set: setUnrealizedProfitActive },
    ];

    const sortOptions = [
        { key: 'name', label: 'Name' },
        { key: 'percentage_change', label: 'Percentage Change' },
        { key: 'market_value', label: 'Market Value' },
        { key: 'unrealized_pl', label: 'Unrealized P&L' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Filters</Text>

            <Text style={styles.section}>Exchange</Text>
            <View style={styles.row}>
                {filters.map(item => (
                    <TouchableOpacity
                        key={item.key}
                        onPress={() => setExchange(item.key)}
                        style={exchange === item.key ? styles.activeBtn : styles.btn}
                    >
                        <Text style={styles.btnText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.section}>Show</Text>
            <View style={styles.toggleGrid}>
                {toggleFilters.map(item => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() => item.set(!item.state)}
                        style={[styles.toggle, item.state && styles.activeToggle]}
                    >
                        <Text style={[styles.toggleText, item.state && styles.activeText]}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.section}>Sorting</Text>
            {sortOptions.map(opt => (
                <TouchableOpacity key={opt.key} onPress={() => handleSort(opt.key)} style={styles.sortItem}>
                    <View style={styles.sortRow}>
                        <Text style={styles.sortText}>{opt.label}</Text>
                        {sortBy === opt.key && (
                            <MaterialIcons name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color="#FFF" />
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { color: '#FFF', fontSize: 22, fontWeight: '600', marginBottom: 20 },
    section: { color: '#A9A9A9', fontSize: 16, marginTop: 20, marginBottom: 10 },
    row: { flexDirection: 'row', gap: 10,},
    btn: { paddingVertical: 10,borderWidth: 1, paddingHorizontal: 20, backgroundColor: '#333', borderRadius: 8 },
    activeBtn: { borderColor: '#05FF93',borderWidth: 1, backgroundColor: '#002233', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    toggleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
    toggle: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#444', margin: 5 },
    activeToggle: { borderColor: '#05FF93', backgroundColor: '#002233' },
    toggleText: { color: '#FFF' },
    activeText: { color: '#05FF93' },
    sortItem: { paddingVertical: 12, paddingHorizontal: 10 },
    sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sortText: { color: '#FFF' },
});