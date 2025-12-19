// app/orderbook/OrderViews/PendingOrders.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBroker } from '@/contexts/BrokerContext';
import { router } from 'expo-router';
import OrderDetailSheet from '@/components/OrderDetailSheet';
import RBSheet from 'react-native-raw-bottom-sheet';

const PendingOrders = () => {
    const { todayOrders, todayOrdersLoading, todayOrdersRefreshing, fetchTodayOrders, refreshTodayOrders, isConnected, isLive } = useBroker();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const [selectedStock, setSelectedStock] = useState(null);
    const rbSheetRef = React.useRef(null);

    // Fetch on mount
    useEffect(() => {
        if (isConnected) {
            fetchTodayOrders();
        }
    }, [isConnected, fetchTodayOrders]);

    // Filter & Search
    const filteredOrders = useMemo(() => {
        return todayOrders.filter((order) => {
            const query = searchQuery.toLowerCase();
            const symbolMatch = order.tradingSymbol?.toLowerCase().includes(query);
            const statusMatch = order.orderStatus?.toLowerCase().includes(query);

            const typeMatch =
                filterType === 'All' ||
                (filterType === 'Buy' && order.transactionType === 'BUY') ||
                (filterType === 'Sell' && order.transactionType === 'SELL');

            return (symbolMatch || statusMatch) && typeMatch;
        });
    }, [todayOrders, searchQuery, filterType]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'TRADED':
            case 'COMPLETE':
                return '#05FF93';
            case 'PENDING':
            case 'OPEN':
                return '#FFC107';
            case 'CANCELLED':
            case 'REJECTED':
                return '#FF3366';
            default:
                return '#888';
        }
    };

    const getStatusText = (status) => {
        return status || 'UNKNOWN';
    };

    const renderItem = ({ item }) => {
        const isBuy = item.transactionType === 'BUY';
        const qty = Math.abs(item.quantity || 0);
        const filledQty = Math.abs(item.filledQty || 0);
        const price = Number(item.price || 0);
        const avgPrice = Number(item.averageTradedPrice || 0);
        const displayedPrice = avgPrice > 0 ? avgPrice : price;
        const status = item.orderStatus;
        // console.log('orderUpdateTime', item.orderUpdateTime);
        return (
            <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.7}
                onPress={() => {
                    setSelectedStock(item);
                    rbSheetRef.current?.open();
                }}
            >
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.symbol}>{item.tradingSymbol}</Text>
                        {/* <Text style={styles.exchange}>{item.exchangeSegment}</Text> */}
                        <Text style={styles.time}>
                            {new Date(item.orderUpdateTime || Date.now()).toLocaleString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short',
                            })}
                        </Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={styles.label}>Quantity</Text>
                        <Text style={styles.value}>
                            {`${filledQty} / ${qty}`}
                        </Text>
                    </View>
                    {displayedPrice > 0 && (
                        <View style={styles.detailCol}>
                            {/* <Text style={styles.label}>Price</Text> */}
                            <Text style={styles.value}>₹{displayedPrice.toFixed(2)}</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '22' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                                        {getStatusText(status)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                </View>

                <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailCol}>
                            {/* <Text style={styles.label}>Type</Text> */}
                            <Text style={[styles.value, isBuy ? styles.buyColor : styles.sellColor]}>
                                {isBuy ? 'BUY' : 'SELL'}
                            </Text>
                        </View>
                        <View style={styles.detailCol}>
                            {/* <Text style={styles.label}>Product</Text> */}
                            <Text style={styles.value}>{item.productType || 'CNC'}</Text>
                        </View>
                        <View style={styles.detailCol}>
                            {/* <Text style={styles.label}>Order Type</Text> */}
                            <Text style={styles.value}>{item.orderType || 'LIMIT'}</Text>
                        </View>

                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (!isConnected) {
        return (
            <View style={styles.center}>
                <Ionicons name="link-outline" size={80} color="#444" />
                <Text style={styles.connectTitle}>No Broker Connected</Text>
                <Text style={styles.connectSubtitle}>Connect your broker to view orders</Text>
                <TouchableOpacity style={styles.connectBtn} onPress={() => router.push('auth/BrokerConnection')}>
                    <Text style={styles.connectBtnText}>Connect Broker</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search & Filter Bar */}
            <View style={styles.headerControls}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search symbol or status..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.filterBtn}
                    onPress={() => setShowFilterMenu(!showFilterMenu)}
                >
                    <Ionicons name="funnel-outline" size={20} color="#FFF" />
                    <Text style={styles.filterText}>{filterType}</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Dropdown */}
            {showFilterMenu && (
                <View style={styles.filterMenu}>
                    {['All', 'Buy', 'Sell'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={styles.filterOption}
                            onPress={() => {
                                setFilterType(type);
                                setShowFilterMenu(false);
                            }}
                        >
                            <Text style={[styles.filterOptionText, filterType === type && styles.activeFilter]}>
                                {type === 'All' ? 'All Orders' : `${type} Orders`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Live Indicator */}
            {isLive && (
                <View style={styles.liveBanner}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live Market Data</Text>
                </View>
            )}

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                renderItem={renderItem}
                keyExtractor={(item) => item.orderId.toString()} // Dhan orderId is unique & stable
                refreshControl={
                    <RefreshControl
                        refreshing={todayOrdersRefreshing}
                        onRefresh={refreshTodayOrders}
                        colors={['#05FF93']}
                        tintColor="#05FF93"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={70} color="#444" />
                        <Text style={styles.emptyTitle}>
                            {todayOrdersLoading ? 'Loading orders...' : 'No orders today'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {todayOrdersLoading ? '' : 'Pull down to refresh'}
                        </Text>
                    </View>
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>{filteredOrders.length} Orders Today</Text>
                    </View>
                }
                contentContainerStyle={filteredOrders.length === 0 && styles.emptyContainer}
            />

            {/* Initial Loader */}
            {todayOrdersLoading && todayOrders.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#05FF93" />
                    <Text style={styles.loadingText}>Loading today&apos;s orders...</Text>
                </View>
            )}


            <RBSheet ref={rbSheetRef} height={700} closeOnDragDown closeOnPressMask
                customStyles={{ container: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20, } }}>
                <OrderDetailSheet stock={selectedStock} showConvertButton={false} />
            </RBSheet>
        </View>
    );
};

export default PendingOrders;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    connectTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: 20 },
    connectSubtitle: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 10 },
    connectBtn: { backgroundColor: '#05FF93', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, marginTop: 30 },
    connectBtnText: { color: '#000', fontSize: 18, fontWeight: '700' },

    headerControls: { flexDirection: 'row', padding: 16, gap: 12 },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#FFF', fontSize: 16 },
    clearBtn: { padding: 4 },

    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    filterText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

    filterMenu: {
        position: 'absolute',
        top: 80,
        right: 16,
        backgroundColor: '#1A1A2E',
        borderRadius: 12,
        padding: 8,
        elevation: 10,
        zIndex: 100,
        borderWidth: 1,
        borderColor: '#333',
    },
    filterOption: { padding: 12 },
    filterOptionText: { color: '#FFF', fontSize: 15 },
    activeFilter: { color: '#05FF93', fontWeight: '700' },

    liveBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5, 255, 147, 0.15)',
        paddingVertical: 10,
        gap: 8,
    },
    liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#05FF93' },
    liveText: { color: '#05FF93', fontSize: 14, fontWeight: '600' },

    listHeader: { padding: 16 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },

    orderCard: {
        backgroundColor: '#0F0F1A',
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    symbol: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    exchange: { color: '#888', fontSize: 13, marginTop: 2 },
    statusContainer: { marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 10, fontWeight: '700' },

    orderDetails: { gap: 8 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailCol: { flexDirection: 'col', justifyContent: 'space-between' },
    label: { color: '#AAA', fontSize: 14 },
    value: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    buyColor: { color: '#05FF93' },
    sellColor: { color: '#FF3366' },

    time: { color: '#666', fontSize: 12, },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '600', marginTop: 20 },
    emptySubtitle: { color: '#888', fontSize: 15, marginTop: 8, textAlign: 'center' },
    emptyContainer: { flexGrow: 1 },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: { color: '#FFF', marginTop: 16, fontSize: 16 },
});