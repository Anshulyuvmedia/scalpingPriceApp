import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import { useBroker } from '@/contexts/BrokerContext';

const OrderHistoryScreen = () => {
    const { selectedStock } = useLocalSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { fetchOrderHistory } = useBroker();
    let parsedStock = null;
    try { parsedStock = selectedStock ? JSON.parse(selectedStock) : null }
    catch (e) { parsedStock = null }

    useEffect(() => {
        if (!parsedStock) return;

        const getOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchOrderHistory(parsedStock.tradingSymbol);
                setOrders(data);
            } catch (err) {
                setError(err.message || 'Failed to load order history');
            } finally {
                setLoading(false);
            }
        };

        getOrders();
    }, [parsedStock]);

    const renderItem = ({ item }) => (
        <View style={styles.orderRow}>
            <Text style={styles.orderCell}>{item.date}</Text>
            <Text style={[styles.orderCell, { color: item.action === 'Buy' ? '#05FF93' : '#FF3366' }]}>{item.action}</Text>
            <Text style={styles.orderCell}>₹{item.price}</Text>
            <Text style={styles.orderCell}>{item.qty}</Text>
            <Text style={styles.orderCell}>₹{item.amount}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Order History'} />
            <View style={styles.content}>
                <Text style={styles.headerText}>
                    {parsedStock ? parsedStock.symbol : 'Order History'}
                </Text>

                {loading && <ActivityIndicator size="large" color="#05FF93" />}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {!loading && !error && (
                    <FlatList
                        data={orders}
                        renderItem={renderItem}
                        keyExtractor={(item, idx) => idx.toString()}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text style={styles.emptyText}>No order history available.</Text>}
                    />
                )}
            </View>
        </View>
    );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { flex: 1, padding: 15, paddingTop: 20 },
    headerText: { color: '#FFF', fontSize: 20, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomColor: '#333', borderBottomWidth: 1 },
    orderCell: { color: '#FFF', flex: 1, textAlign: 'center' },
    emptyText: { color: '#AAA', textAlign: 'center', marginTop: 20 },
    errorText: { color: '#FF6B6B', textAlign: 'center', marginTop: 20 }
});
