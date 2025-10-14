// app/OrderHistoryScreen.jsx
import React from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Use expo-router's hook for params
import HomeHeader from '@/components/HomeHeader';

const OrderHistoryScreen = () => {
    const { selectedStock } = useLocalSearchParams(); // Get params using expo-router
    // console.log('Raw Route params:', selectedStock); // Debug log of raw params

    // Parse the selectedStock parameter, which is a stringified object
    let parsedSelectedStock = null;
    try {
        parsedSelectedStock = selectedStock ? JSON.parse(selectedStock) : null;
    } catch (error) {
        console.error('Error parsing selectedStock:', error);
        parsedSelectedStock = null;
    }

    const orderHistory = parsedSelectedStock ? [
        { date: '14 Oct 2025', action: 'Buy', price: 2500, qty: 2, amount: 5000 },
        { date: '10 Oct 2025', action: 'Buy', price: 2450, qty: 1, amount: 2450 },
    ] : [];

    const renderOrderHistoryItem = ({ item }) => (
        <View style={styles.orderRow}>
            <View style={styles.column}>
                <Text style={styles.label}>Order:</Text>
                <View style={[styles.actionBadge, { backgroundColor: item.action === 'Buy' ? 'green' : 'red' }]}>
                    <Text style={styles.orderCell}>{item.action}</Text>
                </View>
            </View>
            <View style={styles.column}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.orderCell}>{item.date}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.orderCell}>₹{item.price}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.label}>Qty:</Text>
                <Text style={styles.orderCell}>{item.qty}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.label}>Amount:</Text>
                <Text style={styles.orderCell}>₹{item.amount}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Order History'} />
            <View style={styles.content}>
                <Text style={styles.headerText}>
                    {parsedSelectedStock ? `${parsedSelectedStock.symbol}` : 'Order History'}
                </Text>
                <FlatList
                    data={orderHistory}
                    renderItem={renderOrderHistoryItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.orderList}
                    ListEmptyComponent={<Text style={styles.emptyText}>No order history available.</Text>}
                />
            </View>
        </View>
    );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 10,
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    headerText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    orderList: {
        paddingBottom: 20,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    column: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    label: {
        color: '#A9A9A9', // Equivalent to text-gray-300
        fontSize: 12,    // Equivalent to text-sm
        marginBottom: 5,
    },
    orderCell: {
        color: '#FFF',
        fontSize: 14,
        // flex: 1,
        textAlign: 'center',
    },
    actionBadge: {
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    emptyText: {
        color: '#A9A9A9',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});