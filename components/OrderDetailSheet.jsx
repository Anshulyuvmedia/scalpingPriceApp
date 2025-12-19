// /components/OrderDetailsSheet.jsx
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const OrderDetailSheet = ({ stock }) => {
    if (!stock) return null;

    // console.log('stock', stock);
    // Safe extraction
    const qty = Number(stock.quantity || 0);
    const remainingQty = Number(stock.remainingQuantity || 0);
    const tradedQty = qty - remainingQty;
    const orderPrice = Number(stock.price || 0);
    const avgTradedPrice = Number(stock.averageTradedPrice || 0);

    const formatINR = (num) =>
        `₹${Number(num || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    const orderTime = stock.orderUpdateTime
        ? new Date(stock.orderUpdateTime).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '-';

    const orderCreatedTime = stock.orderCreateTime
        ? new Date(stock.orderCreateTime).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '-';

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'TRADED':
            case 'COMPLETE':
                return '#10B981'; // emerald green
            case 'PENDING':
            case 'TRANSIT':
                return '#F59E0B'; // amber
            case 'CANCELLED':
            case 'REJECTED':
                return '#EF4444'; // red
            default:
                return '#9CA3AF';
        }
    };

    // Order details data for FlatList
    const orderDetails = [
        { label: 'Exchange', value: stock.exchangeSegment || 'NSE' },
        { label: 'Order Status', value: stock.orderStatus, highlight: true },
        // Conditionally add Error only if it exists and is not empty
        ...(stock.omsErrorDescription && stock.omsErrorDescription.trim() !== ''
            ? [{ label: 'Error', value: stock.omsErrorDescription, highlight: true }]
            : []),
        { label: 'Product Type', value: stock.productType },
        { label: 'Order Type', value: stock.orderType },
        { label: 'Validity', value: stock.orderValidity },
        { label: 'Quantity', value: `${qty}` },
        { label: 'Traded Qty', value: `${tradedQty}` },
        { label: 'Order Price', value: formatINR(orderPrice) },
        ...(tradedQty > 0
            ? [{ label: 'Avg. Traded Price', value: formatINR(avgTradedPrice) }]
            : []),
        { label: 'Order Create Time', value: orderCreatedTime },
        { label: 'Order ID', value: stock.orderId },
        { label: 'Correlation ID', value: stock.correlationId },
        { label: 'Exchange Order ID', value: stock.exchangeOrderId || '-' },
    ];

    // Action permissions
    const canModify = stock.orderStatus === 'PENDING' || stock.orderStatus === 'TRANSIT';
    const canCancel = canModify;
    const canReorder = ['TRADED', 'CANCELLED', 'REJECTED'].includes(stock.orderStatus);

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text
                style={[
                    styles.value,
                    item.highlight && (
                        item.label === 'Error'
                            ? { color: '#EF4444', fontWeight: '700' } // Red for error
                            : { color: getStatusColor(item.value), fontWeight: '700' }
                    ),
                ]}
            >
                {item.value}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.symbol}>{stock.tradingSymbol}</Text>
                <Text style={styles.transactionType}>
                    <Text style={[styles.statusText, { color: getStatusColor('COMPLETE') }]}> {stock.transactionType}</Text> - {stock.orderType} - <Text style={[styles.statusText, { color: getStatusColor(stock.orderStatus) }]}>
                        {stock.orderStatus}
                    </Text>
                </Text>
                <Text style={styles.time}>{orderTime}</Text>
            </View>



            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    disabled={!canModify}
                    style={[
                        styles.actionButton,
                        styles.modifyButton,
                        !canModify && styles.disabledButton,
                    ]}
                    onPress={() =>
                        router.push({
                            pathname: 'orderbook/ModifyOrder',
                            params: { stock: JSON.stringify(stock) },
                        })
                    }
                >
                    <Text style={styles.buttonText}>Modify</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!canCancel}
                    style={[
                        styles.actionButton,
                        styles.cancelButton,
                        !canCancel && styles.disabledButton,
                    ]}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!canReorder}
                    style={[
                        styles.actionButton,
                        styles.reorderButton,
                        !canReorder && styles.disabledButton,
                    ]}
                >
                    <Text style={styles.buttonText}>Reorder</Text>
                </TouchableOpacity>
            </View>

            {/* Details List */}
            <FlatList
                data={orderDetails}
                renderItem={renderItem}
                keyExtractor={(item) => item.label}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

export default OrderDetailSheet;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111', // Deep slate background
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    symbol: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.8,
    },
    transactionType: {
        fontSize: 16,
        color: '#94A3B8',
        marginTop: 6,
        fontWeight: '600',
    },
    statusBadge: {
        marginTop: 10,
    },
    statusText: {
        fontSize: 15,
        fontWeight: '700',
    },
    time: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 8,
    },

    listContainer: {
        backgroundColor: '#111',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#222',
        marginTop: 5,
        marginBottom: 50,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    label: {
        fontSize: 15,
        color: '#94A3B8',
        fontWeight: '500',
        flex: 1,
    },
    value: {
        fontSize: 15,
        color: '#E2E8F0',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#222',
        // marginHorizontal: -20,
    },

    actionContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 5,
        marginBottom: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modifyButton: {
        backgroundColor: '#10B981',
    },
    cancelButton: {
        backgroundColor: '#EF4444',
    },
    reorderButton: {
        backgroundColor: '#3B82F6',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});