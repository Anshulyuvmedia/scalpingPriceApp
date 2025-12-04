// app/portfolio/PortfolioScreen.jsx
import React, { useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';

import HomeHeader from '@/components/HomeHeader';
import SearchAndFilterBar from '@/components/PortfolioComponents/SearchAndFilterBar';
import ActiveFiltersBar from '@/components/PortfolioComponents/ActiveFiltersBar';
import PortfolioSummary from '@/components/PortfolioComponents/PortfolioSummary';
import StockListItem from '@/components/PortfolioComponents/StockListItem';
import StockDetailSheet from '@/components/PortfolioComponents/StockDetailSheet';
import FilterSheet from '@/components/PortfolioComponents/FilterSheet';

import { useBroker } from '@/contexts/BrokerContext';

const PortfolioScreen = () => {
    const { broker, portfolio, loading, refreshPortfolio, error } = useBroker();  // Added error

    const [searchQuery, setSearchQuery] = useState('');
    const [exchange, setExchange] = useState('All');
    const [realizedLossActive, setRealizedLossActive] = useState(false);
    const [realizedProfitActive, setRealizedProfitActive] = useState(false);
    const [unrealizedLossActive, setUnrealizedLossActive] = useState(false);
    const [unrealizedProfitActive, setUnrealizedProfitActive] = useState(false);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedStock, setSelectedStock] = useState(null);

    const rbSheetRef = React.useRef(null);
    const filterSheetRef = React.useRef(null);

    // Filter + Sort Logic (unchanged)
    const filteredPortfolio = useMemo(() => {
        let result = [...portfolio];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
        }

        // Exchange
        if (exchange !== 'All') result = result.filter(s => s.exchange === exchange);

        // P&L Filters (now uses real P&L from positions)
        const hasPLFilter = realizedLossActive || realizedProfitActive || unrealizedLossActive || unrealizedProfitActive;
        if (hasPLFilter) {
            result = result.filter(s => {
                if (realizedLossActive && s.realisedPL < 0) return true;
                if (realizedProfitActive && s.realisedPL > 0) return true;
                if (unrealizedLossActive && s.profitLoss < 0) return true;
                if (unrealizedProfitActive && s.profitLoss > 0) return true;
                return false;
            });
        }

        // Sorting (unchanged)
        if (sortBy) {
            result.sort((a, b) => {
                let A, B;
                switch (sortBy) {
                    case 'name': A = a.name; B = b.name; return A.localeCompare(B) * (sortOrder === 'asc' ? 1 : -1);
                    case 'percentage_change': A = a.investment ? a.profitLoss / a.investment : 0; B = b.investment ? b.profitLoss / b.investment : 0; break;
                    case 'market_value': A = a.investment + a.profitLoss; B = b.investment + b.profitLoss; break;
                    case 'unrealized_pl': A = a.profitLoss; B = b.profitLoss; break;
                    default: return 0;
                }
                return (A - B) * (sortOrder === 'asc' ? 1 : -1);
            });
        }
        console.log('result:', result);
        return result;
    }, [portfolio, searchQuery, exchange, realizedLossActive, realizedProfitActive, unrealizedLossActive, unrealizedProfitActive, sortBy, sortOrder]);

    // Totals (updated for real P&L from positions)
    const totals = useMemo(() => {
        const investment = portfolio.reduce((s, i) => s + i.investment, 0);
        const current = portfolio.reduce((s, i) => s + (i.investment + i.profitLoss), 0);  // Uses real unrealized P&L
        const pl = portfolio.reduce((s, i) => s + i.profitLoss, 0);  // Unrealized total
        const realised = portfolio.reduce((s, i) => s + i.realisedPL, 0);  // Realized total
        const days = 0;  // Not available in v2 portfolio (add later)
        return { investment, current, pl, realised, days };
    }, [portfolio]);

    const activeFilters = [
        exchange !== 'All' && { label: `Exchange: ${exchange}`, key: 'exchange' },
        realizedLossActive && { label: 'Realized Loss', key: 'realizedLoss' },
        realizedProfitActive && { label: 'Realized Profit', key: 'realizedProfit' },
        unrealizedLossActive && { label: 'Unrealized Loss', key: 'unrealizedLoss' },
        unrealizedProfitActive && { label: 'Unrealized Profit', key: 'unrealizedProfit' },
    ].filter(Boolean);

    const handleSort = (key) => {
        setSortBy(prev => prev === key ? prev : key);
        if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else setSortOrder('asc');
    };

    const removeFilter = (key) => {
        const map = {
            exchange: () => setExchange('All'),
            realizedLoss: () => setRealizedLossActive(false),
            realizedProfit: () => setRealizedProfitActive(false),
            unrealizedLoss: () => setUnrealizedLossActive(false),
            unrealizedProfit: () => setUnrealizedProfitActive(false),
        };
        map[key]?.();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#FFF', fontSize: 18 }}>Loading your portfolio...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <ScrollView
                contentContainerStyle={styles.center}
                refreshControl={
                    <RefreshControl refreshing={false} onRefresh={refreshPortfolio} />
                }
            >
                <Text style={{ color: '#FF6B6B', fontSize: 16, textAlign: 'center' }}>
                    {error}. Pull to retry.
                </Text>
            </ScrollView>
        );
    }



    return (
        <View style={styles.container}>
            <HomeHeader page="portfolio" title={`Portfolio • ${broker?.name || 'Dhan'}`} />  {/* Fixed: Real name */}

            <SearchAndFilterBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onOpenFilter={() => filterSheetRef.current?.open()} />
            <ActiveFiltersBar activeFilters={activeFilters} onRemoveFilter={removeFilter} />

            <LinearGradient colors={['#0A0A1F', '#1A1A2E']} style={styles.gradientBg}>
                <FlatList
                    data={filteredPortfolio}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshPortfolio} colors={['#05FF93']} />}
                    ListHeaderComponent={
                        <>
                            <PortfolioSummary
                                totalInvestment={totals.investment}
                                totalCurrentValue={totals.current}
                                totalPL={totals.pl}
                                totalUnrealisedPL={totals.pl}
                                totalRealisedPL={totals.realised}
                                totalDaysPL={totals.days}
                            />
                            <Text style={styles.sectionTitle}>
                                {filteredPortfolio.length} Holdings
                            </Text>
                        </>
                    }
                    renderItem={({ item }) => (
                        <StockListItem item={item} onPress={() => {
                            setSelectedStock(item);
                            rbSheetRef.current?.open();
                        }} />
                    )}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No holdings yet</Text>
                            <Text style={styles.emptySubtext}>Connect your broker to see your portfolio</Text>
                        </View>
                    }
                />
            </LinearGradient>

            <RBSheet ref={rbSheetRef} height={720} closeOnDragDown closeOnPressMask
                customStyles={{ container: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}>
                <StockDetailSheet stock={selectedStock} />
            </RBSheet>

            <RBSheet ref={filterSheetRef} height={560} closeOnDragDown closeOnPressMask
                customStyles={{ container: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}>
                <FilterSheet
                    exchange={exchange} setExchange={setExchange}
                    realizedLossActive={realizedLossActive} setRealizedLossActive={setRealizedLossActive}
                    realizedProfitActive={realizedProfitActive} setRealizedProfitActive={setRealizedProfitActive}
                    unrealizedLossActive={unrealizedLossActive} setUnrealizedLossActive={setUnrealizedLossActive}
                    unrealizedProfitActive={unrealizedProfitActive} setUnrealizedProfitActive={setUnrealizedProfitActive}
                    sortBy={sortBy} sortOrder={handleSort}
                />
            </RBSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    gradientBg: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', marginTop: 10 },
    sectionTitle: { color: '#FFF', fontSize: 21, fontWeight: '700', marginVertical: 15, paddingHorizontal: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    emptySubtext: { color: '#888', fontSize: 14, marginTop: 8 },
});

export default PortfolioScreen;