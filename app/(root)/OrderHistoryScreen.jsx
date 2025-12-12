// screens/OrderHistoryScreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import { useBroker } from '@/contexts/BrokerContext';

const OrderHistoryScreen = () => {
    const { securityId, symbol } = useLocalSearchParams(); // Accept both
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFY, setSelectedFY] = useState('FY 2025-2026'); // Default to current FY
    const { fetchOrderHistoryBySecurityId, isConnected } = useBroker();

    const fyOptions = [
        'FY 2025-2026',
        'FY 2024-2025',
        'FY 2023-2024',
        'FY 2022-2023',
        'FY 2021-2022',
    ];

    const loadHistory = useCallback(async () => {
        if (!isConnected || !securityId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchOrderHistoryBySecurityId(securityId, selectedFY);
            // console.log('fetchOrderHistoryBySecurityId', data);
            setOrders(data || []);
        } catch (err) {
            setError(err.message || "Failed to load trades");
        } finally {
            setLoading(false);
        }
    }, [isConnected, securityId, selectedFY, fetchOrderHistoryBySecurityId]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    if (!isConnected) {
        return (
            <View style={styles.container}>
                <HomeHeader page="portfolio" title="Trade History" />
                <View style={styles.center}>
                    <Text style={styles.errorText}>Please connect Dhan first</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View className="px-3">
                <HomeHeader page="portfolio" title="Trade History" />
            </View>
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Financial Year:</Text>
                <Picker
                    selectedValue={selectedFY}
                    onValueChange={(itemValue) => setSelectedFY(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {fyOptions.map((fy) => (
                        <Picker.Item key={fy} label={fy} value={fy} />
                    ))}
                </Picker>
            </View>

            <View style={styles.header}>
                <Text style={styles.symbol}>
                    Trade History: {symbol}
                </Text>
            </View>


            {loading && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#05FF93" />
                    <Text style={styles.loadingText}>Loading trades...</Text>
                </View>
            )}

            {error && (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={loadHistory}>
                        <Text style={styles.retry}>Tap to retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && orders.length === 0 && (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No trades found</Text>
                    <Text style={styles.subtext}>You have not traded this stock yet</Text>
                </View>
            )}

            {!loading && orders.length > 0 && (
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.th}>Date</Text>
                        <Text style={styles.th}>Type</Text>
                        <Text style={styles.th}>Price</Text>
                        <Text style={styles.th}>Qty</Text>
                        <Text style={styles.th}>Amount</Text>
                    </View>
                    <FlatList
                        data={orders}
                        renderItem={({ item }) => (
                            <View style={styles.orderRow}>
                                <Text style={styles.cell}>{item.date}</Text>
                                <Text style={[styles.cell, item.action === 'BUY' ? styles.buy : styles.sell]}>
                                    {item.action}
                                </Text>
                                <Text style={styles.cell}>₹{item.price}</Text>
                                <Text style={styles.cell}>{item.qty}</Text>
                                <Text style={styles.cell}>₹{item.amount}</Text>
                            </View>
                        )}
                        keyExtractor={(_, i) => i.toString()}
                    />
                </View>
            )}
        </View>
    );
};

export default OrderHistoryScreen;

// Styles unchanged (same as before)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderColor: '#333' },
    symbol: { color: '#FFF', fontSize: 21, fontWeight: '800' },
    filterContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#111' },
    filterLabel: { color: '#FFF', fontSize: 16, marginRight: 12 },
    picker: { flex: 1, color: '#FFF', backgroundColor: '#1A1A2E', borderRadius: 10, paddingHorizontal: 8, },
    pickerItem: { color: '#FFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { color: '#888', marginTop: 10 },
    errorText: { color: '#FF6B6B', fontSize: 16, textAlign: 'center', marginBottom: 10 },
    retry: { color: '#05FF93', fontWeight: '600' },
    emptyText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    subtext: { color: '#888', marginTop: 8 },
    table: { flex: 1, paddingHorizontal: 12 },
    tableHeader: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 2, borderColor: '#05FF93' },
    th: { flex: 1, color: '#05FF93', fontSize: 12, fontWeight: '700', textAlign: 'center' },
    orderRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#222' },
    cell: { flex: 1, color: '#FFF', textAlign: 'center', fontSize: 13 },
    buy: { color: '#05FF93', fontWeight: '700' },
    sell: { color: '#FF3366', fontWeight: '700' },
});