// app/StockListScreen.tsx
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'http://192.168.1.18:3000/api';

export default function StockListScreen() {
    const { screenerId, title } = useLocalSearchParams(); // This is the magic

    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);





    
    const fetchStocks = async (pull = false) => {
        try {
            if (!pull) setLoading(true);
            const res = await axios.get(`${API_URL}/screeners/${screenerId}/stocks`);
            setStocks(res.data);
        } catch (err) {
            console.error(err);
            setStocks([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (screenerId) fetchStocks();
    }, [screenerId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStocks(true);
    };

    const renderStock = ({ item }: any) => (
        <View style={styles.stockItem}>
            <View>
                <Text style={styles.symbol}>{item.symbol || item.name}</Text>
                <Text style={styles.company}>{item.companyName || ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>₹{Number(item.price || item.ltp).toFixed(2)}</Text>
                <Text
                    style={[
                        styles.change,
                        (item.change || item.changePercent) > 0 ? styles.positive : styles.negative,
                    ]}
                >
                    {(item.change || item.changePercent) > 0 ? '+' : ''}
                    {Number(item.change || item.changePercent).toFixed(2)}%
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{title || 'Loading...'}</Text>
                <ActivityIndicator size="large" color="#FFA4E9" style={{ marginTop: 50 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {stocks.length === 0 ? (
                <Text style={styles.emptyText}>No stocks found</Text>
            ) : (
                <FlatList
                    data={stocks}
                    renderItem={renderStock}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={{ paddingBottom: 30 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', padding: 16 },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    stockItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#111118',
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    symbol: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    company: { color: '#888', fontSize: 13, marginTop: 4 },
    price: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    change: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
    positive: { color: '#4CAF50' },
    negative: { color: '#F44336' },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 50, fontSize: 16 },
});