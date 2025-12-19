import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useBroker } from '@/contexts/BrokerContext';

const ModifyOrder = () => {
    const params = useLocalSearchParams();
    const bottomSheetRef = useRef(null);
    const [sheetMessage, setSheetMessage] = useState('');
    const { modifyPendingOrder, refreshTodayOrders, getLivePrice } = useBroker();

    const [livePrice, setLivePrice] = useState(null); // null = loading, number = loaded, 0 = unavailable
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState('LIMIT');
    const [validity, setValidity] = useState('DAY');
    const [legName, setLegName] = useState('NA');
    const [loading, setLoading] = useState(false);

    // ─────────── Parse stock from params ───────────
    const stock = useMemo(() => {
        try {
            return params.stock ? JSON.parse(params.stock) : null;
        } catch (e) {
            console.error('Failed to parse stock', e);
            return null;
        }
    }, [params.stock]);

    const originalPrice = useMemo(() => stock ? String(stock.price ?? '') : '', [stock]);
    const isMultiLegOrder = ['BO', 'BRACKET', 'FOREVER', 'OCO'].includes(stock?.productType);
    const remainingQty = Number(stock?.remainingQuantity || 0);

    const canModify =
        stock &&
        (stock.orderStatus === 'PENDING' || stock.orderStatus === 'TRANSIT') &&
        remainingQty > 0;

    const isStopLossOrder =
        stock?.orderType === 'STOP_LOSS' || stock?.orderType === 'STOP_LOSS_MARKET';

    const isPriceEditable =
        canModify &&
        orderType === 'LIMIT' &&
        stock?.orderType !== 'STOP_LOSS_MARKET';

    const isBuy = stock?.transactionType === 'BUY';
    const primaryColor = isBuy ? '#05FF93' : '#FF5C5C';

    // ─────────── Initialize states ───────────
    useEffect(() => {
        if (!stock) return;
        setPrice(String(stock.price ?? ''));
        setQuantity(String(stock.remainingQuantity ?? ''));
        setOrderType(stock.orderType || 'LIMIT');
        setValidity(stock.orderValidity || 'DAY');
        setLegName(isMultiLegOrder ? 'ENTRY_LEG' : 'NA');
    }, [stock, isMultiLegOrder]);

    useEffect(() => {
        if (orderType === 'MARKET') setPrice('');
        else if (orderType === 'LIMIT' && price === '' && originalPrice) setPrice(originalPrice);
    }, [orderType, originalPrice, price]);

    // ─────────── Payload builder ───────────
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
            ...(isMultiLegOrder && { legName }),
        };

        let hasChanges = false;

        if (orderType === 'LIMIT' && newPrice > 0) {
            base.price = newPrice;
            if (newPrice !== currentPrice) hasChanges = true;
        }

        if (orderType.startsWith('STOP_LOSS') && newPrice > 0) {
            base.triggerPrice = newPrice;
            if (newPrice !== (stock.triggerPrice || currentPrice)) hasChanges = true;
            if (orderType === 'STOP_LOSS' && stock.price) {
                base.price = stock.price;
            }
        }

        if (newQty !== currentTotalQty && newQty >= currentRemainingQty) {
            base.quantity = newQty;
            hasChanges = true;
        }

        if (orderType !== stock.orderType) hasChanges = true;
        if (validity !== stock.orderValidity) hasChanges = true;

        return hasChanges ? base : null;
    }, [stock, orderType, validity, quantity, price, legName, isMultiLegOrder]);

    // ─────────── Payload validator (No LTP dependency) ───────────
    const validateModifyPayload = () => {
        if (!stock) return 'Invalid stock data';

        const newQty = Number(quantity || 0);
        const newPrice = Number(price || 0);

        if (newQty < remainingQty) return `Quantity cannot be less than remaining (${remainingQty})`;

        if ((orderType === 'LIMIT' || isStopLossOrder) && (!newPrice || newPrice <= 0)) {
            return isStopLossOrder ? 'Trigger price is required for Stop Loss' : 'Please enter a valid price';
        }

        if (isMultiLegOrder && !legName) {
            return 'Please select a valid order leg';
        }

        if (!payload) return 'No changes detected. Modify price, quantity, or validity.';

        return null;
    };

    // ─────────── Modify action ───────────
    const onModify = async () => {
        if (!canModify) return;

        const error = validateModifyPayload();
        if (error) {
            setSheetMessage(error);
            bottomSheetRef.current?.open();
            return;
        }

        setLoading(true);
        console.log('MODIFY ORDER PAYLOAD →', payload);

        try {
            const result = await modifyPendingOrder(payload);

            if (!result) {
                setSheetMessage('No response from broker. Please try again.');
                bottomSheetRef.current?.open();
                return;
            }

            if (result.success) {
                setSheetMessage(result.warning?.message || 'Order modified successfully');
                refreshTodayOrders?.();
                bottomSheetRef.current?.open();

                setTimeout(() => {
                    bottomSheetRef.current?.close();
                    router.push('orderbook/OrderBookTabs');
                }, 1500);
            } else {
                setSheetMessage(result.error?.message || result.message || 'Failed to modify order');
                bottomSheetRef.current?.open();
            }
        } catch (err) {
            console.error('Modify order error', err);
            setSheetMessage(err?.message || 'Failed to modify order');
            bottomSheetRef.current?.open();
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = useMemo(() => !!payload, [payload]);

    // ─────────── Live Price Fetching (Best Effort Only) ───────────
    useEffect(() => {
        const secId = stock?.securityId || stock?.orderSecurityId;
        if (!secId) {
            console.warn('[ModifyOrder] No securityId found');
            setLivePrice(0);
            return;
        }

        let isMounted = true;

        const fetchLivePrice = async () => {
            try {
                const res = await getLivePrice(secId);
                if (isMounted) {
                    if (res.success && res.data?.ltp > 0) {
                        setLivePrice(res.data.ltp);
                    } else {
                        setLivePrice(0); // Unavailable (sandbox or error)
                    }
                }
            } catch (err) {
                if (isMounted) setLivePrice(0);
            }
        };

        fetchLivePrice();
        const interval = setInterval(fetchLivePrice, 8000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [stock, getLivePrice]);

    if (!stock) {
        return (
            <View className="flex-1 bg-black px-4 justify-center items-center">
                <HomeHeader title="Modify Order" />
                <Text className="text-white text-center">Invalid order data</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black px-4">
            <HomeHeader page="chatbot" title="Modify Order" />

            <View className="mt-4 flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="text-2xl font-extrabold text-white">{stock.tradingSymbol}</Text>
                    <Text className="text-base text-gray-400 mt-1">
                        {stock.transactionType} • {stock.orderType} • {stock.productType}
                    </Text>
                </View>

                {/* Live LTP - Only show if available */}
                {livePrice > 0 && (
                    <View className="flex-col items-end">
                        <Text className="text-sm text-gray-400">Live LTP</Text>
                        <Text className="text-2xl font-bold text-white">₹{livePrice.toFixed(2)}</Text>
                    </View>
                )}
                {livePrice === null && <ActivityIndicator size="small" color="#666" />}
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
                        <Label>{isStopLossOrder ? 'Trigger Price' : 'Price'}</Label>
                        <View className="flex-row items-center justify-between bg-[#0F0F1C] rounded-xl border border-gray-800 px-4 py-3">
                            <TextInput
                                value={price}
                                onChangeText={setPrice}
                                editable={isPriceEditable}
                                keyboardType="decimal-pad"
                                className="text-white flex-1"
                                placeholderTextColor="#666"
                            />
                            {livePrice > 0 && (
                                <Text className="text-green-400 font-medium ml-2">
                                    ₹{livePrice.toFixed(2)}
                                </Text>
                            )}
                        </View>
                        {livePrice > 0 ? (
                            <Text className="text-xs text-gray-500 mt-1">
                                Market Price: ₹{livePrice.toFixed(2)}
                            </Text>
                        ) : (
                            <Text className="text-xs text-gray-600 mt-1">
                                Live market data unavailable
                            </Text>
                        )}
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
                customStyles={{ container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, backgroundColor: '#111' } }}
            >
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg text-white font-semibold text-center">{sheetMessage}</Text>
                    <TouchableOpacity
                        onPress={() => bottomSheetRef.current?.close()}
                        style={{ marginTop: 20, backgroundColor: primaryColor, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16 }}
                    >
                        <Text style={{ color: '#000', fontWeight: '700' }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

export default ModifyOrder;

// ─────────── Helper Components ───────────
const Meta = ({ label, value }) => (
    <View>
        <Text className="text-sm text-gray-400">{label}</Text>
        <Text className="text-base text-white font-semibold mt-1">{value}</Text>
    </View>
);

const Label = ({ children }) => <Text className="text-sm text-gray-400 mb-2">{children}</Text>;

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
                <Text style={{ fontWeight: '700', color: value === opt ? '#000' : '#A0A0C0' }}>
                    {opt.replace('_', ' ')}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);