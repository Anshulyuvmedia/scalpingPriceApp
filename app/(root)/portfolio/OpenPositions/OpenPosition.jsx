import ActiveFiltersBar from '@/components/PortfolioComponents/ActiveFiltersBar';
import FilterSheet from '@/components/PortfolioComponents/FilterSheet';
import PositionDetailSheet from '@/components/PortfolioComponents/PositionDetailSheet';
import PositionListItem from '@/components/PortfolioComponents/PositionListItem';
import SearchAndFilterBar from '@/components/PortfolioComponents/SearchAndFilterBar';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';

import { useBroker } from '@/contexts/broker/BrokerProvider';

const OpenPosition = () => {
    const { positions, loading, refreshPortfolio, error, convertPosition } = useBroker();

    const [searchQuery, setSearchQuery] = useState('');
    const [positionType, setPositionType] = useState('All');
    const [productType, setProductType] = useState('All');
    const [unrealizedLossActive, setUnrealizedLossActive] = useState(false);
    const [unrealizedProfitActive, setUnrealizedProfitActive] = useState(false);
    const [sortBy, setSortBy] = useState('unrealized_pl');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedPosition, setSelectedPosition] = useState(null);

    const rbSheetRef = React.useRef(null);
    const filterSheetRef = React.useRef(null);

    const filteredPositions = useMemo(() => {
        let result = [...positions];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.symbol.toLowerCase().includes(q) ||
                p.name.toLowerCase().includes(q)
            );
        }

        if (positionType !== 'All') result = result.filter(p => p.positionType === positionType);
        if (productType !== 'All') result = result.filter(p => p.productType === productType);

        if (unrealizedLossActive) result = result.filter(p => p.profitLoss < 0);
        if (unrealizedProfitActive) result = result.filter(p => p.profitLoss > 0);

        if (sortBy) {
            result.sort((a, b) => {
                let A, B;
                switch (sortBy) {
                    case 'name': A = a.name; B = b.name; return A.localeCompare(B) * (sortOrder === 'asc' ? 1 : -1);
                    case 'unrealized_pl': A = a.profitLoss; B = b.profitLoss; break;
                    case 'percentage_change': A = a.investment ? a.profitLoss / Math.abs(a.investment) : 0; B = b.investment ? b.profitLoss / Math.abs(b.investment) : 0; break;
                    default: A = a.profitLoss; B = b.profitLoss;
                }
                return (A - B) * (sortOrder === 'asc' ? 1 : -1);
            });
        }

        return result;
    }, [positions, searchQuery, positionType, productType, unrealizedLossActive, unrealizedProfitActive, sortBy, sortOrder]);

    const activeFilters = [
        positionType !== 'All' && { label: positionType, key: 'positionType' },
        productType !== 'All' && { label: productType, key: 'productType' },
        unrealizedLossActive && { label: 'Loss', key: 'loss' },
        unrealizedProfitActive && { label: 'Profit', key: 'profit' },
    ].filter(Boolean);

    const removeFilter = (key) => {
        if (key === 'positionType') setPositionType('All');
        if (key === 'productType') setProductType('All');
        if (key === 'loss') setUnrealizedLossActive(false);
        if (key === 'profit') setUnrealizedProfitActive(false);
    };

    if (loading) return <View style={styles.center}><Text style={{ color: '#FFF' }}>Loading positions...</Text></View>;
    if (error) return <View style={styles.center}><Text style={{ color: '#FF6B6B' }}>{error}</Text></View>;

    return (
        <View style={styles.container}>
            <SearchAndFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenFilter={() => filterSheetRef.current?.open()}
            />
            <ActiveFiltersBar activeFilters={activeFilters} onRemoveFilter={removeFilter} />

            <LinearGradient colors={['#0A0A1F', '#1A1A2E']} style={styles.gradientBg}>
                <FlatList
                    data={filteredPositions}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshPortfolio} colors={['#05FF93']} />}
                    ListHeaderComponent={
                        <Text style={styles.sectionTitle}>
                            {filteredPositions.length} Open Positions
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <PositionListItem
                            item={item}
                            onPress={() => {
                                setSelectedPosition(item);
                                rbSheetRef.current?.open();
                            }}
                        />
                    )}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No open positions</Text>
                            <Text style={styles.emptySubtext}>Your intraday & F&O positions will appear here</Text>
                        </View>
                    }
                />
            </LinearGradient>

            <RBSheet ref={rbSheetRef} height={780} closeOnDragDown closeOnPressMask
                customStyles={{ container: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}>
                <PositionDetailSheet position={selectedPosition} onConvert={convertPosition} />
            </RBSheet>

            <RBSheet ref={filterSheetRef} height={620} closeOnDragDown closeOnPressMask
                customStyles={{ container: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}>
                <FilterSheet
                    positionType={positionType} setPositionType={setPositionType}
                    productType={productType} setProductType={setProductType}
                    unrealizedLossActive={unrealizedLossActive} setUnrealizedLossActive={setUnrealizedLossActive}
                    unrealizedProfitActive={unrealizedProfitActive} setUnrealizedProfitActive={setUnrealizedProfitActive}
                    sortBy={sortBy} sortOrder={(key) => {
                        setSortBy(key);
                        setSortOrder(prev => sortBy === key ? (prev === 'asc' ? 'desc' : 'asc') : 'desc');
                    }}
                    isPositionsScreen={true}
                />
            </RBSheet>
        </View>
    );
};

export default OpenPosition;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    gradientBg: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
    sectionTitle: { color: '#FFF', fontSize: 21, fontWeight: '700', marginBottom: 15, paddingHorizontal: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    emptySubtext: { color: '#888', fontSize: 14, marginTop: 8 },
});