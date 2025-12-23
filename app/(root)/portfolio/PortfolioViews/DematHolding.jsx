import ActiveFiltersBar from '@/components/PortfolioComponents/ActiveFiltersBar';
import FilterSheet from '@/components/PortfolioComponents/FilterSheet';
import SearchAndFilterBar from '@/components/PortfolioComponents/SearchAndFilterBar';
import StockDetailSheet from '@/components/PortfolioComponents/StockDetailSheet';
import StockListItem from '@/components/PortfolioComponents/StockListItem';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';

import { useBroker } from '@/contexts/broker/BrokerProvider';

const DematHolding = () => {
    const { holdings, loading, refreshPortfolio, error } = useBroker();
    const [searchQuery, setSearchQuery] = useState('');
    const [exchange, setExchange] = useState('All');
    const [unrealizedLossActive, setUnrealizedLossActive] = useState(false);
    const [unrealizedProfitActive, setUnrealizedProfitActive] = useState(false);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedStock, setSelectedStock] = useState(null);
    const rbSheetRef = React.useRef(null);
    const filterSheetRef = React.useRef(null);

    const filteredHoldings = useMemo(() => {
        let result = holdings
            .filter(h => h && Number(h.qty) !== 0)
            .map(h => ({
                ...h,
                searchKey: (
                    h.tradingSymbol ||
                    h.symbol ||
                    h.name ||
                    ''
                ).toLowerCase()
            }));

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => s.searchKey.includes(q));
        }

        if (exchange !== 'All') {
            result = result.filter(s => s.exchange === exchange);
        }

        if (unrealizedLossActive) result = result.filter(s => s.profitLoss < 0);
        if (unrealizedProfitActive) result = result.filter(s => s.profitLoss > 0);

        if (sortBy) {
            result.sort((a, b) => {
                let A, B;
                switch (sortBy) {
                    case 'name':
                        A = a.name; B = b.name;
                        return A.localeCompare(B) * (sortOrder === 'asc' ? 1 : -1);
                    case 'percentage_change':
                        A = a.investment ? a.profitLoss / a.investment : 0;
                        B = b.investment ? b.profitLoss / b.investment : 0;
                        break;
                    case 'market_value':
                        A = a.investment + a.profitLoss;
                        B = b.investment + b.profitLoss;
                        break;
                    case 'unrealized_pl':
                        A = a.profitLoss; B = b.profitLoss;
                        break;
                    default: return 0;
                }
                return (A - B) * (sortOrder === 'asc' ? 1 : -1);
            });
        }

        return result;
    }, [holdings, searchQuery, exchange, unrealizedLossActive, unrealizedProfitActive, sortBy, sortOrder]);

    const activeFilters = [
        exchange !== 'All' && { label: `Exchange: ${exchange}`, key: 'exchange' },
        unrealizedLossActive && { label: 'Unrealized Loss', key: 'unrealizedLoss' },
        unrealizedProfitActive && { label: 'Unrealized Profit', key: 'unrealizedProfit' },
    ].filter(Boolean);

    const handleSort = (key) => {
        setSortBy(prev => prev === key ? prev : key);
        setSortOrder(prev => sortBy === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    };

    const removeFilter = (key) => {
        if (key === 'exchange') setExchange('All');
        if (key === 'unrealizedLoss') setUnrealizedLossActive(false);
        if (key === 'unrealizedProfit') setUnrealizedProfitActive(false);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#FFF', fontSize: 18 }}>Loading holdings...</Text>
            </View>
        );
    }

    if (error) {
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
            <SearchAndFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenFilter={() => filterSheetRef.current?.open()}
            />
            <ActiveFiltersBar activeFilters={activeFilters} onRemoveFilter={removeFilter} />

            <LinearGradient
                style={styles.gradientBg}
                colors={['#000', '#000']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 0.2 }}
            >
                <FlatList
                    data={filteredHoldings}
                    keyExtractor={(item) =>
                        `${item.tradingSymbol}_${item.exchange}`
                    }

                    refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshPortfolio} colors={['#05FF93']} />}
                    ListHeaderComponent={
                        <Text style={styles.sectionTitle}>
                            {filteredHoldings.length} Demat Holdings
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <StockListItem
                            item={item}
                            onPress={() => {
                                setSelectedStock(item);
                                rbSheetRef.current?.open();
                            }}
                        />
                    )}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No demat holdings</Text>
                            <Text style={styles.emptySubtext}>Your delivery stocks will appear here</Text>
                        </View>
                    }
                />
            </LinearGradient>

            <RBSheet ref={rbSheetRef} height={600} closeOnDragDown closeOnPressMask
                customStyles={{ container: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}>
                <StockDetailSheet stock={selectedStock} showConvertButton={false} />
            </RBSheet>

            <RBSheet ref={filterSheetRef} height={560} closeOnDragDown closeOnPressMask
                customStyles={{ container: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}>
                <FilterSheet
                    exchange={exchange} setExchange={setExchange}
                    unrealizedLossActive={unrealizedLossActive} setUnrealizedLossActive={setUnrealizedLossActive}
                    unrealizedProfitActive={unrealizedProfitActive} setUnrealizedProfitActive={setUnrealizedProfitActive}
                    sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort}
                    showRealizedFilters={false}
                />

            </RBSheet>
        </View>
    );
};

export default DematHolding;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    gradientBg: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
    sectionTitle: { color: '#FFF', fontSize: 21, fontWeight: '700', marginBottom: 15, paddingHorizontal: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    emptySubtext: { color: '#888', fontSize: 14, marginTop: 8 },
    connectTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: 20 },
    connectText: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 10 },
    connectBtn: { backgroundColor: '#05FF93', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, marginTop: 30 },
    connectBtnText: { color: '#000', fontSize: 18, fontWeight: '700' },
});