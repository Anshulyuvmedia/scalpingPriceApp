// app/(root)/chatbotscreens/tabview/signaldetail/[id].jsx
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, RefreshControl, TextInput } from 'react-native';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Feather } from '@expo/vector-icons';

// Move signalData outside component to prevent re-creation
const signalData = [
    {
        id: '1',
        title: 'Bank Nifty',
        description: 'Bank Nifty Index Future',
        value: '42350.25',
        change: '-1.2%',
        entry: '₹ 4200',
        target: '₹ 4250',
        stopLoss: '₹ 4150',
        exit: '₹ 4230'
    },
    {
        id: '2',
        title: 'Nifty 50',
        description: 'Nifty 50 Index',
        value: '24567.80',
        change: '+0.8%',
        entry: '₹ 24500',
        target: '₹ 24700',
        stopLoss: '₹ 24400',
        exit: '₹ 24600'
    },
    {
        id: '3',
        title: 'RELIANCE',
        description: 'Reliance Industries Ltd',
        value: '2456.75',
        change: '+2.1%',
        entry: '₹ 2450',
        target: '₹ 2500',
        stopLoss: '₹ 2430',
        exit: '₹ 2480'
    },
    {
        id: '4',
        title: 'TCS',
        description: 'Tata Consultancy Services Ltd',
        value: '3789.50',
        change: '-0.5%',
        entry: '₹ 3780',
        target: '₹ 3820',
        stopLoss: '₹ 3760',
        exit: '₹ 3800'
    },
    {
        id: '5',
        title: 'HDFCBANK',
        description: 'HDFC Bank Ltd',
        value: '1567.30',
        change: '+1.3%',
        entry: '₹ 1560',
        target: '₹ 1580',
        stopLoss: '₹ 1550',
        exit: '₹ 1570'
    },
];

const SignalDetail = () => {
    const { id } = useLocalSearchParams();
    const sheetRef = useRef(null);
    const router = useRouter();

    // State management
    const [priceChartData, setPriceChartData] = useState([
        { time: '9:30', price: 2600 },
        { time: '10:30', price: 2610 },
        { time: '11:30', price: 2595 },
        { time: '12:00', price: 2605 },
        { time: '1:00', price: 2600 },
        { time: '2:00', price: 2615 },
        { time: '3:00', price: 2600 },
    ]);
    const [signalLevels, setSignalLevels] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [action, setAction] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState('Market');

    // Memoize signal to prevent unnecessary re-renders
    const signal = useMemo(() => signalData.find((item) => item.id === id), [id]);

    // Calculate total value (always call useMemo, even if signal is undefined)
    const totalValue = useMemo(() => {
        if (!signal) return 0;
        const qty = Number(quantity);
        const price = Number((signal.value || '0').replace(/,/g, ''));
        return isNaN(qty) ? 0 : (qty * price).toFixed(2);
    }, [quantity, signal?.value, signal]);

    // Use useEffect instead of conditional useMemo
    useEffect(() => {
        if (signal) {
            setSignalLevels([
                { label: 'Entry', value: signal.entry, color: 'text-white' },
                { label: 'Target', value: signal.target, color: 'text-green-400' },
                { label: 'Stop-Loss', value: signal.stopLoss, color: 'text-red-600' },
                { label: 'Exit', value: signal.exit, color: 'text-white' },
            ]);
        }
    }, [signal]);

    // Early return if signal is not found
    if (!signal) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Signal not found</Text>
            </View>
        );
    }

    // Calculate dynamic yAxisInterval for LineChart
    const prices = priceChartData.map((data) => data.price);
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const yAxisInterval = Math.max(10, Math.round(priceRange / 5));

    const chartData = {
        labels: priceChartData.map((data) => data.time),
        datasets: [
            {
                data: priceChartData.map((data) => data.price),
                color: (opacity = 1) => `rgba(96, 157, 249, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const screenWidth = Dimensions.get('window').width - 40;

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setPriceChartData([
                { time: '9:30', price: 2600 },
                { time: '10:30', price: 2610 },
                { time: '11:30', price: 2595 },
                { time: '12:00', price: 2605 },
                { time: '1:00', price: 2600 },
                { time: '2:00', price: 2615 },
                { time: '3:00', price: 2600 },
            ]);
            setSignalLevels([
                { label: 'Entry', value: signal.entry, color: 'text-white' },
                { label: 'Target', value: signal.target, color: 'text-green-400' },
                { label: 'Stop-Loss', value: signal.stopLoss, color: 'text-red-600' },
                { label: 'Exit', value: signal.exit, color: 'text-white' },
            ]);
            setRefreshing(false);
        }, 1000);
    };

    const renderLevelItem = ({ item }) => (
        <LinearGradient
            colors={['#2A2A3D', '#1E1E2F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelItem}
        >
            <Text style={styles.levelLabel}>{item.label}</Text>
            <Text style={[styles.levelValue, { color: item.color }]}>{item.value}</Text>
        </LinearGradient>
    );

    const openSheet = (type) => {
        setAction(type);
        setQuantity('');
        setOrderType('Market');
        sheetRef.current?.open();
    };

    const handleToggleOrderType = (type) => {
        setOrderType(type);
    };

    const handleConfirm = () => {
        if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        // Navigate to confirmation screen
        router.push({
            pathname: '/stockdiscovery/confirmorder',
            params: { stock: signal.title, action, quantity: `${quantity} shares`, orderType, price: signal.value, totalValue }
        });
        sheetRef.current?.close();
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={signal.title} />
            <View style={styles.headerSection}>
                <View>
                    <Text style={styles.title}>{signal.title}</Text>
                    <Text style={styles.company}>{signal.description}</Text>
                </View>
                <View style={styles.valueContainer}>
                    <Text style={styles.value}>₹{signal.value}</Text>
                    <Text style={[styles.change, signal.change.includes('-') ? styles.negativeChange : styles.positiveChange]}>
                        {signal.change}
                    </Text>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Price Chart</Text>
                <LineChart
                    data={chartData}
                    width={screenWidth}
                    height={200}
                    yAxisLabel="₹"
                    yAxisSuffix=""
                    yAxisInterval={yAxisInterval}
                    chartConfig={{
                        backgroundGradientFrom: '#2A2A3D',
                        backgroundGradientTo: '#1E1E2F',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}
                    bezier
                    withVerticalLines={false}
                    style={styles.chartLine}
                />
            </View>

            <View style={styles.levelsContainer}>
                <Text style={styles.sectionTitle}>Signal Levels</Text>
                <FlatList
                    data={signalLevels}
                    renderItem={renderLevelItem}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.levelsList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#05FF93']} />
                    }
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => openSheet('Buy')}
                    accessibilityLabel={`Buy ${signal.title} signal`}
                    style={[styles.actionButton, styles.buyButton]}
                >
                    <View>
                        <Text style={styles.buttonText}>Buy</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => openSheet('Sell')}
                    accessibilityLabel={`Sell ${signal.title} signal`}
                    style={[styles.actionButton, styles.sellButton]}
                >
                    <View>
                        <Text style={styles.buttonsellText}>Sell</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <RBSheet
                ref={sheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={700}
                customStyles={{
                    container: styles.sheetContainer,
                    draggableIcon: styles.draggableIcon,
                }}
            >
                <View style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>{action} Order - {signal.title}</Text>
                    <Text style={styles.sheetPrice}>Current Price: ₹{signal.value}</Text>

                    <View style={styles.orderContainer}>
                        <Text style={styles.subtitle}>Quantity:</Text>
                        <TextInput
                            style={styles.quantityInput}
                            placeholder="Enter quantity"
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
                            placeholderTextColor="#A9A9A9"
                            accessibilityLabel="Quantity input"
                        />

                        <Text style={styles.subtitle}>Order Type:</Text>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, orderType === 'Market' ? styles.toggleButtonActive : null]}
                                onPress={() => handleToggleOrderType('Market')}
                            >
                                <Text style={[styles.orderbuttonText, orderType === 'Market' ? styles.activeButtonText : null]}>
                                    Market
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, orderType === 'Limit' ? styles.toggleButtonActive : null]}
                                onPress={() => handleToggleOrderType('Limit')}
                            >
                                <Text style={[styles.orderbuttonText, orderType === 'Limit' ? styles.activeButtonText : null]}>
                                    Limit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.orderSummary}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>Current Price:</Text>
                            <Text style={styles.summaryValue}>₹{signal.value}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>Quantity:</Text>
                            <Text style={styles.summaryValue}>{quantity || 0} shares</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>Order Type:</Text>
                            <Text style={styles.summaryValue}>{orderType}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.subtitle}>Total Value:</Text>
                            <Text style={styles.totalValue}>₹{totalValue}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                            accessibilityLabel="Confirm transaction"
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>
        </View>
    );
};

export default SignalDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    headerSection: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '400',
        marginBottom: 5,
    },
    company: {
        color: '#A9A9A9',
        fontSize: 16,
        marginBottom: 10,
    },
    valueContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    value: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
    },
    change: {
        fontSize: 16,
        fontWeight: '500',
    },
    positiveChange: {
        color: '#05FF93',
    },
    negativeChange: {
        color: '#FF0505',
    },
    chartContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    chartLine: {
        borderRadius: 16,
    },
    levelsContainer: {
        marginBottom: 25,
        flex: 1,
    },
    levelsList: {
        paddingBottom: 10,
    },
    levelItem: {
        borderRadius: 12,
        padding: 15,
        marginRight: 10,
        justifyContent: 'center',
        minWidth: 80,
    },
    levelLabel: {
        color: '#A9A9A9',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
        textAlign: 'center',
    },
    levelValue: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 25,
        alignItems: 'center',
        width: '48%',
    },
    buyButton: {
        backgroundColor: '#05FF93',
    },
    sellButton: {
        backgroundColor: '#FF0505',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonsellText: {
        color: '#fffc',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#FF0505',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    sheetContainer: {
        backgroundColor: '#1E1E2F',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    draggableIcon: {
        backgroundColor: '#333',
    },
    sheetContent: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    sheetTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    sheetPrice: {
        color: '#A9A9A9',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    orderContainer: {
        backgroundColor: '#0f0f1b',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    subtitle: {
        color: '#A9A9A9',
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'left',
    },
    quantityInput: {
        backgroundColor: '#2A2A3D',
        borderRadius: 10,
        padding: 10,
        color: '#FFF',
        fontSize: 16,
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    toggleButton: {
        backgroundColor: '#181822',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        width: '48%',
    },
    toggleButtonActive: {
        backgroundColor: '#05FF93',
    },
    confirmButton: {
        backgroundColor: '#05FF93',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    orderbuttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    activeButtonText: {
        color: '#000',
        fontWeight: '700',
    },
    orderSummary: {
        backgroundColor: '#0f0f1b',
        padding: 20,
        borderRadius: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    totalRow: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#FFF',
        marginTop: 10,
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 16,
    },
    totalValue: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '600',
    },
});