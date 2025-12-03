// components/OrderBottomSheet.js
import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

const OrderBottomSheet = React.forwardRef((props, ref) => {
    const {
        action,           // "Buy" or "Sell"
        stock,
        quantity,
        setQuantity,
        orderType,
        setOrderType,
        totalValue: _totalValue, // ignored — we recalculate
        onConfirm,
    } = props;

    const [limitPrice, setLimitPrice] = React.useState('');

    // Dynamic Colors
    const isBuy = action === 'Buy';
    const primaryColor = isBuy ? '#05FF93' : '#FF0505';
    const textColor = isBuy ? '#000' : '#FFF';
    const bgColor = isBuy ? '#05FF93' : '#FF0505';

    // Calculate correct price & total
    const marketPrice = parseFloat(stock.value.replace(/,/g, ''));
    const priceUsed = orderType === 'Limit' && limitPrice
        ? parseFloat(limitPrice) || 0
        : marketPrice;

    const totalAmount = (priceUsed * (parseInt(quantity) || 0))
        .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleConfirm = () => {
        if (!quantity || parseInt(quantity) <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        if (orderType === 'Limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
            alert('Please enter a valid limit price');
            return;
        }

        onConfirm?.({
            limitPrice: orderType === 'Limit' ? limitPrice : null,
        });
    };

    return (
        <RBSheet
            ref={ref}
            height={orderType === 'Limit' ? 800 : 740}
            closeOnDragDown={true}
            closeOnPressMask={true}
            customStyles={{
                wrapper: { backgroundColor: 'rgba(0,0,0,0.75)' },
                container: { ...styles.sheetContainer, borderTopWidth: 4, borderTopColor: primaryColor },
                draggableIcon: { backgroundColor: primaryColor, opacity: 0.8 },
            }}
        >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>

                        {/* Dynamic Title */}
                        <Text style={[styles.title, { color: primaryColor }]}>
                            {action} {stock.title}
                        </Text>
                        <Text style={styles.price}>Current Price: ₹{stock.value}</Text>

                        {/* Input Section */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Quantity</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={quantity}
                                onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))}
                            />

                            <Text style={styles.label}>Order Type</Text>
                            <View style={styles.toggle}>
                                {['Market', 'Limit'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.toggleBtn, orderType === type && { backgroundColor: primaryColor }]}
                                        onPress={() => {
                                            setOrderType(type);
                                            if (type === 'Market') setLimitPrice('');
                                        }}
                                    >
                                        <Text style={[
                                            styles.toggleText,
                                            orderType === type && { color: textColor, fontWeight: '800' }
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Limit Price - Only for Limit Orders */}
                            {orderType === 'Limit' && (
                                <View style={{ marginTop: 20 }}>
                                    <Text style={styles.label}>Limit Price</Text>
                                    <TextInput
                                        style={[styles.input, { borderWidth: 2, borderColor: primaryColor }]}
                                        placeholder="0.00"
                                        placeholderTextColor="#666"
                                        keyboardType="decimal-pad"
                                        value={limitPrice}
                                        onChangeText={(text) => {
                                            const cleaned = text.replace(/[^0-9.]/g, '');
                                            const parts = cleaned.split('.');
                                            if (parts.length > 2) return;
                                            if (parts[1]?.length > 2) return;
                                            setLimitPrice(cleaned);
                                        }}
                                    />
                                    <Text style={[styles.hint, { color: primaryColor }]}>
                                        Order will execute only at this price or better
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Summary */}
                        <View style={styles.summary}>
                            <Text style={styles.sectionTitle}>Order Summary</Text>

                            <View style={styles.row}>
                                <Text style={styles.label}>Price</Text>
                                <Text style={styles.value}>
                                    {orderType === 'Limit' && limitPrice ? `₹${limitPrice}` : `₹${stock.value} (Market)`}
                                </Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Quantity</Text>
                                <Text style={styles.value}>{quantity || 0} shares</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Type</Text>
                                <Text style={styles.value}>{orderType} Order</Text>
                            </View>

                            <View style={[styles.row, styles.total]}>
                                <Text style={styles.label}>Est. Total</Text>
                                <Text style={[styles.totalAmount, { color: primaryColor }]}>
                                    ₹{totalAmount}
                                </Text>
                            </View>
                        </View>

                        {/* Confirm Button - Dynamic Color */}
                        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: bgColor }]} onPress={handleConfirm}>
                            <Text style={[styles.confirmText, { color: textColor }]}>
                                Confirm {action} ({orderType})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </RBSheet>
    );
});

OrderBottomSheet.displayName = 'OrderBottomSheet';

const styles = StyleSheet.create({
    sheetContainer: {
        backgroundColor: '#1E1E2F',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    draggableIcon: {
        width: 60,
        height: 6,
        borderRadius: 3,
        marginTop: 10,
    },
    content: { padding: 20 },
    title: {
        fontSize: 30,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
    },
    price: {
        color: '#AAA',
        textAlign: 'center',
        fontSize: 17,
        marginBottom: 24,
    },
    inputSection: {
        backgroundColor: '#0f0f1b',
        padding: 24,
        borderRadius: 20,
        marginBottom: 20,
    },
    label: {
        color: '#AAA',
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#2A2A3D',
        color: '#FFF',
        padding: 18,
        borderRadius: 16,
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 20,
    },
    toggle: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 10,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: '#181822',
        alignItems: 'center',
    },
    toggleText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
    hint: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    summary: {
        backgroundColor: '#0f0f1b',
        padding: 24,
        borderRadius: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    total: {
        borderTopWidth: 2,
        borderTopColor: '#333',
        paddingTop: 20,
        marginTop: 12,
    },
    value: { color: '#FFF', fontSize: 17, fontWeight: '600' },
    totalAmount: {
        fontSize: 32,
        fontWeight: '900',
    },
    confirmBtn: {
        paddingVertical: 22,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    confirmText: {
        fontSize: 22,
        fontWeight: '900',
    },
});

export default OrderBottomSheet;