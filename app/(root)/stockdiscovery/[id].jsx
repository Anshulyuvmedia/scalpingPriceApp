// app/stockdiscovery/[id].tsx

import React, { useState, useRef, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import TradingViewChart from '@/components/TradingViewChart';
import OrderBottomSheet from '@/components/OrderBottomSheet';
import LinearGradient from 'react-native-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const stockData = [
    { id: '1', title: 'RELIANCE', company: 'Reliance Industries Ltd', value: '2,956.75', volume: '1.23 Cr', mcap: '20.1L Cr', change: '+43.45 (1.49%)' },
    { id: '2', title: 'TCS', company: 'Tata Consultancy Services Ltd', value: '4,185.40', volume: '87.6L', mcap: '15.2L Cr', change: '+65.20 (1.58%)' },
    { id: '3', title: 'HDFCBANK', company: 'HDFC Bank Ltd', value: '1,724.85', volume: '2.1 Cr', mcap: '13.1L Cr', change: '+12.15 (0.71%)' },
    { id: '4', title: 'INFY', company: 'Infosys Ltd', value: '1,965.30', volume: '98.7L', mcap: '8.1L Cr', change: '+35.10 (1.82%)' },
    { id: '5', title: 'ICICIBANK', company: 'ICICI Bank Ltd', value: '1,289.60', volume: '1.8 Cr', mcap: '9.0L Cr', change: '-8.40 (-0.65%)' },
];

const StockDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const sheetRef = useRef(null);

    const [action, setAction] = useState('');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState('Market');

    const stock = useMemo(() => stockData.find(s => s.id === id), [id]);

    const fundamentalsData = useMemo(() => stock ? [
        { label: 'Volume', value: stock.volume },
        { label: 'Market Cap', value: stock.mcap },
        { label: '52W High', value: '₹3,200' },
        { label: '52W Low', value: '₹2,100' },
        { label: 'P/E Ratio', value: '28.4' },
        { label: 'Div Yield', value: '0.38%' },
    ] : [], [stock]);

    const totalValue = useMemo(() => {
        if (!stock || !quantity) return '0.00';
        const price = parseFloat(stock.value.replace(/,/g, ''));
        const qty = parseInt(quantity) || 0;
        return (price * qty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, [stock, quantity]);

    if (!stock) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Stock not found</Text>
            </View>
        );
    }

    const openSheet = (type) => {
        setAction(type);
        setQuantity('1');
        setOrderType('Market');
        sheetRef.current?.open();
    };

    const handleConfirm = () => {
        if (!quantity || parseInt(quantity) <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        router.push({
            pathname: '/stockdiscovery/confirmorder',
            params: {
                stock: stock.title,
                action,
                quantity: quantity + ' shares',
                orderType,
                price: stock.value,
                totalValue: '₹' + totalValue,
            },
        });
        sheetRef.current?.close();
    };

    const renderFundamental = ({ item }) => (
        <LinearGradient colors={['#2A2A3D', '#1E1E2F']} style={styles.fundamentalItem}>
            <Text style={styles.fundamentalLabel}>{item.label}</Text>
            <Text style={styles.fundamentalValue}>{item.value}</Text>
        </LinearGradient>
    );

    const renderItem = ({ item }) => {
        if (item.type === 'header') {
            return (
                <>
                    <HomeHeader page="chatbot" title={stock.title} />

                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{stock.title}</Text>
                            <Text style={styles.company}>{stock.company}</Text>
                        </View>
                        <View style={styles.priceBox}>
                            <Text style={styles.price}>₹{stock.value}</Text>
                            <Text style={[styles.change, stock.change.includes('-') ? styles.red : styles.green]}>
                                {stock.change}
                            </Text>
                        </View>
                    </View>
                </>
            );
        }

        if (item.type === 'chart') {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Live Chart</Text>
                    <View style={styles.chartWrapper}>
                        <TradingViewChart symbol={stock.title} />
                    </View>
                </View>
            );
        }

        if (item.type === 'metrics') {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Metrics</Text>
                    <FlatList
                        data={fundamentalsData}
                        renderItem={renderFundamental}
                        keyExtractor={(_, i) => i.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        scrollEnabled={false}
                    />
                </View>
            );
        }

        if (item.type === 'footer') {
            return (
                <View style={styles.footerButtons}>
                    <TouchableOpacity onPress={() => openSheet('Buy')} style={[styles.actionBtn, styles.buyBtn]}>
                        <Text style={styles.buyText}>Buy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openSheet('Sell')} style={[styles.actionBtn, styles.sellBtn]}>
                        <Text style={styles.sellText}>Sell</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    const data = [
        { type: 'header', key: 'header' },
        { type: 'chart', key: 'chart' },
        { type: 'metrics', key: 'metrics' },
        { type: 'footer', key: 'footer' },
    ];

    return (
        <>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                style={styles.container}
            />

            {/* Bottom Sheet */}
            <OrderBottomSheet
                ref={sheetRef}
                action={action}
                stock={stock}
                quantity={quantity}
                setQuantity={setQuantity}
                orderType={orderType}
                setOrderType={setOrderType}
                totalValue={totalValue}
                onConfirm={handleConfirm}
            />
        </>
    );
};

export default StockDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginVertical: 16,
    },
    title: { color: '#FFF', fontSize: 22, fontWeight: '600' },
    company: { color: '#888', fontSize: 15, marginTop: 4 },
    priceBox: { alignItems: 'flex-end' },
    price: { color: '#FFF', fontSize: 26, fontWeight: '700' },
    change: { fontSize: 16, marginTop: 4 },
    green: { color: '#05FF93' },
    red: { color: '#FF0505' },
    section: { marginBottom: 20, paddingHorizontal: 12 },
    sectionTitle: { color: '#FFF', fontSize: 19, fontWeight: '600', marginBottom: 12, marginLeft: 4 },
    chartWrapper: { height: 400, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },

    row: { justifyContent: 'space-between', marginBottom: 12 },
    fundamentalItem: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
    },
    fundamentalLabel: { color: '#888', fontSize: 13 },
    fundamentalValue: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 6 },

    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 16,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    actionBtn: {
        width: '48%',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
    },
    buyBtn: { backgroundColor: '#05FF93' },
    sellBtn: { backgroundColor: '#FF0505' },
    buyText: { color: '#000', fontSize: 18, fontWeight: '700' },
    sellText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

    error: { color: '#FF0505', textAlign: 'center', marginTop: 50, fontSize: 18 },
});