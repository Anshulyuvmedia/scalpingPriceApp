// /components/OrderDetailsSheet.jsx
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const OrderDetailSheet = ({ stock }) => {
    if (!stock) return null;

    // ─────────────────────────────────────
    // Order-safe extraction
    // ─────────────────────────────────────
    const qty = Number(stock.quantity || 0);
    const tradedQty = Number(stock.tradedQuantity || 0);
    const remainingQty = Number(stock.remainingQuantity || 0);

    const orderPrice = Number(stock.price || 0);
    const avgTradedPrice = Number(
        stock.averageTradedPrice || stock.averagePrice || 0
    );

    const orderValue = orderPrice * qty;

    const orderTime = stock.orderDateTime
        ? new Date(stock.orderDateTime).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '-';

    // ─────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────
    const formatINR = (num) =>
        `₹${Number(num || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
        })}`;

    // ─────────────────────────────────────
    // Order data grid
    // ─────────────────────────────────────
    const data = [
        { label: 'Exchange', value: stock.exchangeSegment || 'NSE' },
        // { label: 'Order ID', value: stock.orderId },
        { label: 'Order Status', value: stock.orderStatus },
        // { label: 'Transaction', value: stock.transactionType },
        // { label: 'Order Type', value: stock.orderType },
        { label: 'Product', value: stock.productType },

        { label: 'Order Quantity', value: qty },
        { label: 'Traded Quantity', value: tradedQty },

        { label: 'Order Price', value: formatINR(orderPrice) },

        tradedQty > 0 && {
            label: 'Avg Traded Price',
            value: formatINR(avgTradedPrice),
        },

        // { label: 'Order Time', value: orderTime },
    ].filter(Boolean);

    // ─────────────────────────────────────
    // Action permissions
    // ─────────────────────────────────────
    const canModify = stock.orderStatus === 'PENDING';
    const canCancel = stock.orderStatus === 'PENDING';
    const canReorder = ['TRADED', 'CANCELLED', 'REJECTED'].includes(
        stock.orderStatus
    );

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.symbol}>{stock.tradingSymbol}</Text>
                <Text style={styles.subTitle}>
                    {stock.transactionType} • {stock.orderType} • {new Date(stock.orderDateTime).toLocaleString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </Text>
            </View>

            {/* Order Details */}
            <View style={styles.grid}>
                {data.map((item) => (
                    <View key={item.label} style={styles.row}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text
                            style={[
                                styles.value,
                                item.bold && styles.boldValue,
                            ]}
                        >
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.tradeButtons}>
                <TouchableOpacity
                    disabled={!canModify}
                    style={[
                        styles.tradeBtn,
                        styles.modifyBtn,
                        !canModify && styles.disabledBtn,
                    ]}
                    onPress={() => router.push({
                        pathname: 'orderbook/ModifyOrder',
                        params: {
                            stock: JSON.stringify(stock),
                        },
                    })}
                >
                    <Text style={[styles.tradeText]}>Modify</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!canCancel}
                    style={[
                        styles.tradeBtn,
                        styles.cancelBtn,
                        !canCancel && styles.disabledBtn,
                    ]}
                >
                    <Text style={styles.tradeText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!canReorder}
                    style={[
                        styles.tradeBtn,
                        styles.reorderBtn,
                        !canReorder && styles.disabledBtn,
                    ]}
                >
                    <Text style={styles.tradeText}>Reorder</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default OrderDetailSheet;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    symbol: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    subTitle: {
        color: '#9AA0B4',
        fontSize: 15,
        marginTop: 6,
    },

    grid: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3A',
    },
    label: {
        color: '#A0A0C0',
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
    boldValue: {
        fontSize: 15,
        fontWeight: '800',
    },

    tradeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    tradeBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    modifyBtn: {
        backgroundColor: 'green',
    },
    cancelBtn: {
        backgroundColor: 'red',
    },
    reorderBtn: {
        backgroundColor: '#3366FF',
    },
    disabledBtn: {
        opacity: 0.4,
    },
    tradeText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
});
