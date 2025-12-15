import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useBroker } from '@/contexts/BrokerContext';

const ModifyOrder = () => {
    const params = useLocalSearchParams();
    const bottomSheetRef = useRef(null);
    const [sheetMessage, setSheetMessage] = useState('');
    const { modifyPendingOrder, refreshTodayOrders } = useBroker();

    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState('LIMIT');
    const [validity, setValidity] = useState('DAY');
    const [legName, setLegName] = useState('NA');
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    // Parse stock from params
    const stock = useMemo(() => {
        try {
            return params.stock ? JSON.parse(params.stock) : null;
        } catch (e) {
            console.error('Failed to parse stock', e);
            return null;
        }
    }, [params.stock]);
    console.log('stock', stock);
    // Store the original price from the order (only once)
    const originalPrice = useMemo(() => stock ? String(stock.price ?? '') : '', [stock]);
    const isMultiLegOrder = ['BO', 'BRACKET', 'FOREVER', 'OCO'].includes(stock?.productType);

    // Initialize states (including price)
    useEffect(() => {
        if (!stock) return;

        setPrice(String(stock.price ?? ''));
        setQuantity(String(stock.remainingQuantity ?? ''));
        setOrderType(stock.orderType || 'LIMIT');
        setValidity(stock.orderValidity || 'DAY');
        setLegName(isMultiLegOrder ? 'ENTRY_LEG' : 'NA');

        setIsInitialized(true); // mark states initialized
    }, [stock, isMultiLegOrder]);

    useEffect(() => {
        if (orderType === 'MARKET') {
            setPrice('');
        } else if (orderType === 'LIMIT' && price === '' && originalPrice) {
            setPrice(originalPrice);
        }
    }, [orderType, originalPrice, price]);

    // Order meta
    const remainingQty = Number(stock.remainingQuantity || 0);
    const canModify = stock.orderStatus === 'PENDING' && remainingQty > 0;

    const isBuy = stock.transactionType === 'BUY';
    const primaryColor = isBuy ? '#05FF93' : '#FF5C5C';
    const secondaryColor = isBuy ? 'rgba(5,255,147,0.15)' : 'rgba(255,92,92,0.15)';
    const textColor = isBuy ? '#05FF93' : '#FF5C5C';

    // ─────────────────────────────────────
    // Correct Payload using useMemo
    // ─────────────────────────────────────
    const payload = useMemo(() => {
        if (!stock) return null;

        const currentTotalQty = Number(stock.quantity || 0);
        const currentRemainingQty = Number(stock.remainingQuantity || 0);
        const currentPrice = Number(stock.price || 0);

        const newQty = Number(quantity || currentRemainingQty);
        const newPrice = Number(price || currentPrice);

        const base = {
            orderId: stock.orderId,
            orderType,
            validity,
            legName: isMultiLegOrder ? legName : "",
        };

        let hasChanges = false;

        // PRICE
        if (orderType === 'LIMIT' && newPrice > 0 && newPrice !== currentPrice) {
            base.price = newPrice;
            hasChanges = true;
        } else if (orderType === 'LIMIT' && newPrice > 0) {
            base.price = newPrice; // Always send for LIMIT
        }

        // QUANTITY
        if (newQty !== currentTotalQty && newQty >= currentRemainingQty) {
            base.quantity = newQty;
            hasChanges = true;
        }

        // Order type/validity
        if (orderType !== stock.orderType) hasChanges = true;
        if (validity !== stock.orderValidity) hasChanges = true;

        return hasChanges ? base : null; // null if no changes
    }, [stock, orderType, validity, quantity, price, legName]);


    // ─────────────────────────────────────
    // Modify Action
    // ─────────────────────────────────────
    const onModify = async () => {
        if (!canModify) return;

        const newQty = Number(quantity || 0);
        if (newQty < remainingQty) {
            setSheetMessage(`Cannot reduce below remaining: ${remainingQty}`);
            bottomSheetRef.current?.open();
            return;
        }

        if (!payload || Object.keys(payload).length <= 4) {
            setSheetMessage('No changes detected. Modify price, quantity, type, or validity.');
            bottomSheetRef.current?.open();
            return;
        }
        // Only validate price for LIMIT orders
        if (orderType === 'LIMIT') {
            const priceNum = Number(price);
            if (!price || priceNum <= 0) {
                setSheetMessage(
                    legName === 'STOP_LOSS_LEG'
                        ? 'Please enter a valid trigger price'
                        : 'Please enter a valid price'
                );
                bottomSheetRef.current?.open();
                return;
            }
        }

        setLoading(true);
        console.log('MODIFY ORDER PAYLOAD →', payload);

        const result = await modifyPendingOrder(payload);

        if (result.success) {
            setSheetMessage('Order modified successfully');
            refreshTodayOrders?.(); // Refresh order list
        } else {
            setSheetMessage(result.message || 'Failed to modify order');
        }

        bottomSheetRef.current?.open();
        setLoading(false);


        if (result.success) {
            setSheetMessage('Order modified successfully');
            refreshTodayOrders?.();
            setTimeout(() => {
                bottomSheetRef.current?.close();
            }, 1500);
            // Auto navigate back after a short delay
            setTimeout(() => {
                router.push('orderbook/OrderBookTabs');
            }, 1500);
        }
    };

    const hasChanges = useMemo(() => !!payload, [payload]);


    if (!stock) {
        return (
            <View className="flex-1 bg-black px-4 justify-center items-center">
                <HomeHeader title="Modify Order" />
                <Text className="text-white text-center">Invalid order data</Text>
            </View>
        );
    }

    // ─────────────────────────────────────
    // UI
    // ─────────────────────────────────────
    return (
        <View className="flex-1 bg-black px-4">
            <HomeHeader page="chatbot" title="Modify Order" />

            {/* SYMBOL HEADER */}
            <View className="mt-4 flex-row justify-between">
                <View className="flex-col items-start mt-2">
                    <Text className="text-2xl font-extrabold text-white">
                        {stock.tradingSymbol}
                    </Text>
                    <Text className="text-base text-gray-400 mt-1">
                        {stock.transactionType} • {stock.orderType} • {stock.productType} • {stock.orderValidity}
                    </Text>
                </View>

                <View className="flex-col items-end mt-2">
                    <View style={{ backgroundColor: secondaryColor, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                        <Text style={{ color: textColor, fontWeight: '700', fontSize: 12 }}>
                            {stock.orderStatus}
                        </Text>
                    </View>
                    <Text className="text-base text-gray-500 mt-3">
                        {stock.orderDateTime}
                    </Text>
                </View>
            </View>

            <View className="h-px bg-gray-800 my-5" />

            <View className="flex-row justify-between">
                <Meta label="Order ID" value={stock.orderId} />
                <Meta label="Exchange" value={stock.exchangeSegment} />
            </View>

            <View className="flex-row justify-between mt-3">
                <Meta label="Total Qty" value={stock.quantity} />
                <Meta label="Remaining" value={remainingQty} />
            </View>

            <View className="h-px bg-gray-800 my-6" />

            <Text className="text-white text-lg font-semibold mb-4">Modify Order</Text>

            {/* LEG SELECTOR */}
            {isMultiLegOrder && (
                <View className="mb-5">
                    <Label>Order Leg</Label>
                    <SegmentedControl
                        options={['ENTRY_LEG', 'STOP_LOSS_LEG', 'TARGET_LEG']}
                        value={legName}
                        onChange={setLegName}
                        color={primaryColor}
                    />
                </View>
            )}

            <View className="flex-row gap-4 mt-5">
                <View className="flex-1">
                    <Label>Order Type</Label>
                    <SegmentedControl
                        options={['LIMIT', 'MARKET']}
                        value={orderType}
                        onChange={setOrderType}
                        color={primaryColor}
                    />
                </View>
                <View className="flex-1">
                    <Label>Validity</Label>
                    <SegmentedControl
                        options={['DAY', 'IOC']}
                        value={validity}
                        onChange={setValidity}
                        color={primaryColor}
                    />
                </View>
            </View>

            <View className="flex-row gap-4 mt-5">
                {orderType === 'LIMIT' && (
                    <View className="flex-1">
                        <Label>
                            {legName === 'STOP_LOSS_LEG' ? 'Trigger Price' : 'Price'}
                        </Label>
                        <Input
                            value={price}
                            onChangeText={setPrice}
                            editable={canModify}
                            keyboardType="decimal-pad"
                        />
                    </View>
                )}

                <View className="flex-1">
                    <Label>Quantity</Label>
                    <Input
                        value={quantity}
                        onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
                        editable={canModify}
                        keyboardType="number-pad"
                    />
                </View>
            </View>

            <TouchableOpacity
                disabled={!canModify || loading || !hasChanges}
                onPress={onModify}
                style={{
                    marginTop: 32,
                    borderRadius: 20,
                    paddingVertical: 16,
                    alignItems: 'center',
                    backgroundColor: !canModify || loading || !hasChanges ? `${primaryColor}66` : primaryColor,
                }}
            >
                <Text style={{ color: '#000', fontWeight: '800', fontSize: 16 }}>
                    {loading ? 'Updating...' : 'Update Order'}
                </Text>
            </TouchableOpacity>


            <RBSheet
                ref={bottomSheetRef}
                height={200}
                openDuration={250}
                closeOnDragDown
                customStyles={{
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        backgroundColor: '#111',
                    },
                }}
            >
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg text-white font-semibold text-center">
                        {sheetMessage}
                    </Text>
                    <TouchableOpacity
                        onPress={() => bottomSheetRef.current?.close()}
                        style={{
                            marginTop: 20,
                            backgroundColor: primaryColor,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 16,
                        }}
                    >
                        <Text style={{ color: '#000', fontWeight: '700' }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

export default ModifyOrder;

// Helper Components (updated to respect props)
const Meta = ({ label, value }) => (
    <View>
        <Text className="text-sm text-gray-400">{label}</Text>
        <Text className="text-base text-white font-semibold mt-1">{value}</Text>
    </View>
);

const Label = ({ children }) => (
    <Text className="text-sm text-gray-400 mb-2">{children}</Text>
);

const Input = (props) => (
    <TextInput
        {...props}
        className="bg-[#0F0F1C] text-white px-4 py-3 rounded-xl border border-gray-800"
        placeholderTextColor="#666"
    />
);

const SegmentedControl = ({ options, value, onChange, color }) => (
    <View className="flex-row bg-[#0F0F1C] rounded-xl p-1 border border-gray-800">
        {options.map((opt) => (
            <TouchableOpacity
                key={opt}
                onPress={() => onChange(opt)}
                style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: value === opt ? color : '#0F0F1C',
                }}
            >
                <Text
                    style={{
                        fontWeight: '700',
                        color: value === opt ? '#000' : '#A0A0C0',
                    }}
                >
                    {opt.replace('_', ' ')}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);