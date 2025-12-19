// components/portfolio/FilterSheet.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function FilterSheet({
    exchange = 'All', setExchange = () => { },
    realizedLossActive = false, setRealizedLossActive = () => { },
    realizedProfitActive = false, setRealizedProfitActive = () => { },
    unrealizedLossActive = false, setUnrealizedLossActive = () => { },
    unrealizedProfitActive = false, setUnrealizedProfitActive = () => { },
    sortBy = '', sortOrder = 'asc', handleSort = () => { },
    showRealizedFilters = true, // added this prop
}) {
    const exchanges = ['All', 'NSE', 'BSE'];

    const toggleFilters = [
        ...(showRealizedFilters ? [
            { label: 'Realized Loss', state: realizedLossActive, set: setRealizedLossActive },
            { label: 'Realized Profit', state: realizedProfitActive, set: setRealizedProfitActive },
        ] : []),
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

            {/* Exchange Filters */}
            <Text style={styles.section}>Exchange</Text>
            <View style={styles.row}>
                {exchanges.map((ex) => (
                    <TouchableOpacity
                        key={ex}
                        onPress={() => setExchange(ex)}
                        style={[styles.btn, exchange === ex && styles.activeBtn]}
                    >
                        <Text style={[styles.btnText, exchange === ex && styles.activeText]}>{ex}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Toggle Filters */}
            <Text style={styles.section}>Show</Text>
            <View style={styles.toggleGrid}>
                {toggleFilters.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() => item.set && item.set(!item.state)}
                        style={[styles.toggle, item.state && styles.activeToggle]}
                    >
                        <Text style={[styles.toggleText, item.state && styles.activeText]}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sorting */}
            <Text style={styles.section}>Sort By</Text>
            {sortOptions.map((opt) => (
                <TouchableOpacity
                    key={opt.key}
                    onPress={() => handleSort(opt.key)}
                    style={styles.sortItem}
                >
                    <View style={styles.sortRow}>
                        <Text style={styles.sortText}>{opt.label}</Text>
                        {sortBy === opt.key && (
                            <MaterialIcons
                                name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                                size={20}
                                color="#05FF93"
                            />
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#1A1A2E', flex: 1 },
    title: { color: '#FFF', fontSize: 22, fontWeight: '600', marginBottom: 20 },
    section: { color: '#A9A9A9', fontSize: 16, marginTop: 20, marginBottom: 10 },

    row: { flexDirection: 'row', gap: 10 },
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#444',
    },
    activeBtn: {
        backgroundColor: '#002233',
        borderColor: '#05FF93',
    },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    activeText: { color: '#05FF93' },

    toggleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
    toggle: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#444',
        margin: 5,
        backgroundColor: '#222',
    },
    activeToggle: { borderColor: '#05FF93', backgroundColor: '#002233' },
    toggleText: { color: '#FFF' },

    sortItem: { paddingVertical: 12, paddingHorizontal: 10 },
    sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sortText: { color: '#FFF' },
});
