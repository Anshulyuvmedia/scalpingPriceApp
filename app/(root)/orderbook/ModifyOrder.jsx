import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';

const ModifyOrder = () => {
    const params = useLocalSearchParams();
    console.log('params', params);
    // IMPORTANT: stock comes as string from router
    const stock = useMemo(() => {
        try {
            return params.stock ? JSON.parse(params.stock) : null;
        } catch (e) {
            console.error('Failed to parse stock', e);
            return null;
        }
    }, [params.stock]);

    // ─────────────────────────────────────
    // Editable State
    // ─────────────────────────────────────
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);
    // Guard
    if (!stock) {
        return (
            <View style={styles.container}>
                <HomeHeader title="Modify Order" />
                <Text style={{ color: '#FFF', textAlign: 'center' }}>
                    Invalid order data
                </Text>
            </View>
        );
    }
    console.log('stock', stock);
    // ─────────────────────────────────────
    // Order-safe extraction
    // ─────────────────────────────────────
    const qty = Number(stock.quantity || 0);
    const tradedQty = Number(stock.tradedQuantity || 0);
    const remainingQty = Number(stock.remainingQuantity || 0);
    const orderPrice = Number(stock.price || 0);

    const isLimitOrder = stock.orderType === 'LIMIT';
    const canModify = stock.orderStatus === 'PENDING' && remainingQty > 0;





    // ─────────────────────────────────────
    // Actions
    // ─────────────────────────────────────
    const onModify = async () => {
        if (!canModify) return;

        if (isLimitOrder && (!price || Number(price) <= 0)) {
            Alert.alert('Invalid Price', 'Please enter a valid price');
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
            return;
        }

        setLoading(true);

        /**
         * API PAYLOAD (example)
         * {
         *   orderId: stock.orderId,
         *   price: Number(price),
         *   quantity: Number(quantity)
         * }
         */

        console.log('MODIFY ORDER PAYLOAD', {
            orderId: stock.orderId,
            price: Number(price),
            quantity: Number(quantity),
        });

        // Call API here
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Order modified successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        }, 800);
    };

    // ─────────────────────────────────────
    // UI
    // ─────────────────────────────────────
    return (
        <View style={styles.container}>
            <HomeHeader page="chatbot" title="Modify Order" />

            {/* Order Summary */}
            <View style={styles.card}>
                <Text style={styles.symbol}>{stock.tradingSymbol}</Text>
                <Text style={styles.subTitle}>
                    {stock.transactionType} • {stock.orderType} • {stock.productType}
                </Text>
            </View>

            {/* Static Info */}
            <View style={styles.card}>
                <InfoRow label="Order ID" value={stock.orderId} />
                <InfoRow label="Order Status" value={stock.orderStatus} />
                <InfoRow label="Total Qty" value={qty} />
                <InfoRow label="Traded Qty" value={tradedQty} />
                <InfoRow label="Remaining Qty" value={remainingQty} />
            </View>

            {/* Editable Section */}
            <View style={styles.card}>
                {isLimitOrder && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Price</Text>
                        <TextInput
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={styles.input}
                            editable={canModify}
                        />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        style={styles.input}
                        editable={canModify}
                    />
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
                disabled={!canModify || loading}
                onPress={onModify}
                style={[
                    styles.modifyBtn,
                    (!canModify || loading) && styles.disabledBtn,
                ]}
            >
                <Text style={styles.modifyText}>
                    {loading ? 'Updating...' : 'Modify Order'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ModifyOrder;

// ─────────────────────────────────────
// Reusable row
// ─────────────────────────────────────
const InfoRow = ({ label, value }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 12,
    },

    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },

    symbol: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '800',
    },
    subTitle: {
        color: '#9AA0B4',
        fontSize: 14,
        marginTop: 6,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        color: '#A0A0C0',
        fontSize: 14,
    },
    value: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },

    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        color: '#A0A0C0',
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#0F0F1C',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },

    modifyBtn: {
        backgroundColor: '#05FF93',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledBtn: {
        opacity: 0.4,
    },
    modifyText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '800',
    },
});
