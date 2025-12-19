// /portfolio/PortfolioViews/TradeBook.jsx
import { useBroker } from '@/contexts/broker/BrokerProvider';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TradeBook = () => {
    const {
        tradeDateRange,
        setTradeDateRange,
        tradebookItems,
        tradebookHasMore,
        tradebookLoading,
        tradebookPage,
        tradebookRefreshing,
        loadMoreTradebook,
        refreshTradebook,
        isConnected,
        isLive,
    } = useBroker();
    // console.log('tradebookItems', tradebookItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickingFor, setPickingFor] = useState('from');
    const [tempDate, setTempDate] = useState(new Date());

    const fromDate = tradeDateRange.from;
    const toDate = tradeDateRange.to;

    const filtered = useMemo(() => {
        return tradebookItems.filter(item => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                (item.customSymbol || item.voucherdesc || '').toLowerCase().includes(q) ||
                (item.narration || item.voucherdesc || '').toLowerCase().includes(q);
            const matchesType =
                filterType === 'All' ||
                (filterType === 'Buy' && item.transactionType === 'BUY') ||
                (filterType === 'Sell' && item.transactionType === 'SELL') ||
                (filterType === 'Funds' && !item.transactionType);
            return matchesSearch && matchesType;
        });
    }, [tradebookItems, searchQuery, filterType]);

    const openPicker = (type) => {
        setPickingFor(type);
        const date = type === 'from' ? fromDate : toDate;
        const [y, m, d] = date.split('-');
        setTempDate(new Date(y, m - 1, d));
        setShowPicker(true);
    };

    const onDateChange = (e, date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (!date) return;
        const str = date.toISOString().split('T')[0];
        setTradeDateRange(prev => ({ ...prev, [pickingFor]: str }));
    };

    const renderItem = ({ item }) => {
        // console.log('item', item);
        const isTrade = !!item.transactionType;
        const isBuy = item.transactionType === 'BUY';
        const date = item.exchangeTime || item.voucherdate || '';
        const symbol = item.customSymbol || item.voucherdesc || 'N/A';
        const qty = Math.abs(item.tradedQuantity || 0);
        const price = Number(item.tradedPrice || 0);
        const amount = qty * price || Math.abs(item.debit || item.credit || 0);
        const isCredit = item.credit > 0 || (isTrade && isBuy);

        return (
            <View style={[styles.tradeItem, item._index % 2 === 0 && styles.evenRow]}>
                <View style={styles.leftCol}>
                    <Text style={[styles.qty, isBuy ? styles.buyColor : styles.sellColor]}> {item.transactionType}</Text>
                    <Text style={styles.date}>{new Date(date).toLocaleDateString('en-IN')}</Text>
                    <Text style={styles.time}>
                        {new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.centerCol}>
                    <Text style={styles.symbol} numberOfLines={1}>{symbol}</Text>
                    <Text style={styles.narration} numberOfLines={1}>
                        {item.narration || item.voucherdesc || 'Transaction'}
                    </Text>
                </View>
                <View style={styles.rightCol}>
                    {isTrade && qty > 0 && (
                        <Text style={styles.time}>
                            Qty:
                            <Text style={[styles.qty, isBuy ? styles.buyColor : styles.sellColor]}>
                                {isBuy ? ' +' : ' -'} {qty}
                            </Text>
                        </Text>
                    )}
                    {price > 0 && (
                        <Text style={styles.time}>
                            Price:
                            <Text style={styles.price}> ₹{price.toFixed(2)}</Text>
                        </Text>
                    )}
                    <Text style={styles.time}>
                        Amount:
                        <Text style={[styles.amount, isCredit ? styles.creditColor : styles.debitColor]}>
                            {isCredit ? ' +' : ' -'}₹{amount.toLocaleString('en-IN')}
                        </Text>
                    </Text>
                </View>
            </View>
        );
    };

    if (!isConnected) {
        return (
            <View style={styles.center}>
                <Ionicons name="link-outline" size={80} color="#444" />
                <Text style={styles.connectTitle}>No Broker Connected</Text>
                <TouchableOpacity style={styles.connectBtn} onPress={() => router.push('auth/BrokerConnection')}>
                    <Text style={styles.connectBtnText}>Connect Broker</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showPicker && (
                <DateTimePicker value={tempDate} mode="date" onChange={onDateChange} />
            )}

            <View style={styles.controls}>
                <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('from')}>
                    <Text style={styles.dateText}>From: {fromDate}</Text>
                    <Ionicons name="calendar-outline" size={18} color="#AAA" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('to')}>
                    <Text style={styles.dateText}>To: {toDate}</Text>
                    <Ionicons name="calendar-outline" size={18} color="#AAA" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchFilterRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#888" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterMenu(v => !v)}>
                    <Ionicons name="funnel" size={20} color="#FFF" />
                    <Text style={styles.filterText}>{filterType}</Text>
                </TouchableOpacity>
            </View>

            {showFilterMenu && (
                <View style={styles.filterMenu}>
                    {['All', 'Buy', 'Sell'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={styles.filterOption}
                            onPress={() => {
                                setFilterType(t);
                                setShowFilterMenu(false);
                            }}
                        >
                            <Text style={[styles.filterOptionText, filterType === t && styles.filterActive]}>
                                {t}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {isLive && (
                <View style={styles.liveBanner}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                </View>
            )}

            <FlatList
                data={filtered}
                renderItem={renderItem}
                // BULLETPROOF UNIQUE KEY — NO MORE WARNINGS EVER
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl
                        refreshing={tradebookRefreshing}
                        onRefresh={refreshTradebook}
                        colors={['#05FF93']}
                    />
                }
                onEndReached={loadMoreTradebook}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    tradebookLoading && tradebookPage > 0 ? (
                        <ActivityIndicator color="#05FF93" style={{ margin: 20 }} />
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={70} color="#444" />
                        <Text style={styles.emptyTitle}>No transactions found</Text>
                        <Text style={styles.emptySubtitle}>Try adjusting date range or filters</Text>
                    </View>
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{filtered.length} Transactions</Text>
                        <Text style={styles.headerSubtitle}>{fromDate} – {toDate}</Text>
                    </View>
                }
            />
        </View>
    );
};

export default TradeBook;

// Styles (unchanged – perfect as is)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    connectTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: 20 },
    connectText: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 10 },
    connectBtn: { backgroundColor: '#05FF93', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, marginTop: 30 },
    connectBtnText: { color: '#000', fontSize: 18, fontWeight: '700' },
    controls: { flexDirection: 'row', padding: 16, backgroundColor: '#000', gap: 10 },
    dateBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    dateText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
    exportBtn: {
        backgroundColor: '#05FF93',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },

    searchFilterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
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
    searchInput: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 10 },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 6,
    },
    filterText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

    filterMenu: {
        position: 'absolute',
        top: 140,
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
    filterActive: { color: '#05FF93', fontWeight: '700' },

    liveBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5,255,147,0.15)',
        paddingVertical: 8,
        gap: 8,
    },
    liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#05FF93' },
    liveText: { color: '#05FF93', fontSize: 14, fontWeight: '600' },

    header: { padding: 16, backgroundColor: '#000' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
    headerSubtitle: { color: '#888', fontSize: 14, marginTop: 4 },

    tradeItem: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#0D0D1A' },
    evenRow: { backgroundColor: '#111124' },

    leftCol: { width: 90, justifyContent: 'center' },
    date: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    time: { color: '#888', fontSize: 12, marginTop: 2 },

    centerCol: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    symbol: { color: '#05FF93', fontSize: 16, fontWeight: '700' },
    narration: { color: '#AAA', fontSize: 13, marginTop: 4 },

    rightCol: { width: 130, alignItems: 'flex-end', justifyContent: 'center' },
    qty: { fontSize: 15, fontWeight: '700', },
    price: { color: '#FFF', fontSize: 13, opacity: 0.9 },
    amount: { fontSize: 16, fontWeight: '800', marginTop: 4 },

    buyColor: { color: '#05FF93' },
    sellColor: { color: '#FF3366' },
    creditColor: { color: '#05FF93' },
    debitColor: { color: '#FF3366' },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '600', marginTop: 20 },
    emptySubtitle: { color: '#888', fontSize: 15, marginTop: 8, textAlign: 'center' },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
});