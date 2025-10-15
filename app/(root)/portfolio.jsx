import { StyleSheet, View, FlatList, RefreshControl, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useState, useRef, useMemo } from 'react';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Portfolio = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [exchange, setExchange] = useState('All');
    const [realizedLossActive, setRealizedLossActive] = useState(false);
    const [realizedProfitActive, setRealizedProfitActive] = useState(false);
    const [unrealizedLossActive, setUnrealizedLossActive] = useState(false);
    const [unrealizedProfitActive, setUnrealizedProfitActive] = useState(false);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const rbSheetRef = useRef(null);
    const filterSheetRef = useRef(null);

    // Updated User's Stock Portfolio Data with Indian Stocks
    const userPortfolio = useMemo(() => [
        {
            symbol: 'RELIANCE',
            name: 'Reliance Industries Ltd',
            investment: 50000.00,
            profitLoss: 2500.00,
            allocate: 30.00,
            qty: 10,
            realisedPL: 1000.00,
            avgPrice: 5000.00,
            exchange: 'NSE',
            daysPL: 500.00,
            longTermQty: 5
        },
        {
            symbol: 'TCS',
            name: 'Tata Consultancy Services Ltd',
            investment: 40000.00,
            profitLoss: -1500.00,
            allocate: 25.00,
            qty: 5,
            realisedPL: 500.00,
            avgPrice: 8000.00,
            exchange: 'NSE',
            daysPL: -300.00,
            longTermQty: 2
        },
        {
            symbol: 'HDFCBANK',
            name: 'HDFC Bank Ltd',
            investment: 30000.00,
            profitLoss: 800.00,
            allocate: 20.00,
            qty: 15,
            realisedPL: 300.00,
            avgPrice: 2000.00,
            exchange: 'BSE',
            daysPL: 200.00,
            longTermQty: 10
        },
        {
            symbol: 'INFY',
            name: 'Infosys Ltd',
            investment: 20000.00,
            profitLoss: -600.00,
            allocate: 15.00,
            qty: 8,
            realisedPL: 200.00,
            avgPrice: 2500.00,
            exchange: 'NSE',
            daysPL: -100.00,
            longTermQty: 4
        },
    ], []);

    // Calculate portfolio totals
    const totalInvestment = userPortfolio.reduce((sum, stock) => sum + stock.investment, 0);
    const totalCurrentValue = userPortfolio.reduce((sum, stock) => sum + (stock.investment + stock.profitLoss), 0);
    const totalPL = userPortfolio.reduce((sum, stock) => sum + stock.profitLoss, 0);
    const totalUnrealisedPL = userPortfolio.reduce((sum, stock) => sum + stock.profitLoss, 0);
    const totalRealisedPL = userPortfolio.reduce((sum, stock) => sum + stock.realisedPL, 0);
    const totalDaysPL = userPortfolio.reduce((sum, stock) => sum + stock.daysPL, 0);
    const daysPLPercent = (totalDaysPL / totalInvestment) * 100;
    const totalPLPercent = (totalPL / totalInvestment) * 100;
    const unrealisedPLPercent = (totalUnrealisedPL / totalInvestment) * 100;
    const realisedPLPercent = (totalRealisedPL / totalInvestment) * 100;
    const currentValuePercent = ((totalCurrentValue - totalInvestment) / totalInvestment) * 100;

    // Filtered and sorted portfolio
    const filteredPortfolio = useMemo(() => {
        let filtered = userPortfolio.filter(stock => {
            const lowerQuery = searchQuery.toLowerCase();
            if (searchQuery && !stock.symbol.toLowerCase().includes(lowerQuery) && !stock.name.toLowerCase().includes(lowerQuery)) return false;

            if (exchange !== 'All' && stock.exchange !== exchange) return false;

            let matchToggle = false;
            if (realizedLossActive && stock.realisedPL < 0) matchToggle = true;
            if (realizedProfitActive && stock.realisedPL > 0) matchToggle = true;
            if (unrealizedLossActive && stock.profitLoss < 0) matchToggle = true;
            if (unrealizedProfitActive && stock.profitLoss > 0) matchToggle = true;

            if (realizedLossActive || realizedProfitActive || unrealizedLossActive || unrealizedProfitActive) {
                if (!matchToggle) return false;
            }

            return true;
        });

        if (sortBy) {
            filtered = filtered.sort((a, b) => {
                let valA, valB;
                switch (sortBy) {
                    case 'name':
                        valA = a.name;
                        valB = b.name;
                        return valA.localeCompare(valB) * (sortOrder === 'asc' ? 1 : -1);
                    case 'percentage_change':
                        valA = (a.profitLoss / a.investment) * 100;
                        valB = (b.profitLoss / b.investment) * 100;
                        return (valA - valB) * (sortOrder === 'asc' ? 1 : -1);
                    case 'market_value':
                        valA = a.investment + a.profitLoss;
                        valB = b.investment + b.profitLoss;
                        return (valA - valB) * (sortOrder === 'asc' ? 1 : -1);
                    case 'unrealized_pl':
                        valA = a.profitLoss;
                        valB = b.profitLoss;
                        return (valA - valB) * (sortOrder === 'asc' ? 1 : -1);
                    default:
                        return 0;
                }
            });
        }

        return filtered;
    }, [userPortfolio, searchQuery, exchange, realizedLossActive, realizedProfitActive, unrealizedLossActive, unrealizedProfitActive, sortBy, sortOrder]);

    // Active filters for display
    const activeFilters = [];
    if (exchange !== 'All') activeFilters.push({ label: `Exchange: ${exchange}`, key: 'exchange' });
    if (realizedLossActive) activeFilters.push({ label: 'Realized Loss', key: 'realizedLoss' });
    if (realizedProfitActive) activeFilters.push({ label: 'Realized Profit', key: 'realizedProfit' });
    if (unrealizedLossActive) activeFilters.push({ label: 'Unrealized Loss', key: 'unrealizedLoss' });
    if (unrealizedProfitActive) activeFilters.push({ label: 'Unrealized Profit', key: 'unrealizedProfit' });

    // Refresh control handler
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    // Handle sort selection
    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    // Handle filter removal
    const removeFilter = (key) => {
        if (key === 'exchange') setExchange('All');
        if (key === 'realizedLoss') setRealizedLossActive(false);
        if (key === 'realizedProfit') setRealizedProfitActive(false);
        if (key === 'unrealizedLoss') setUnrealizedLossActive(false);
        if (key === 'unrealizedProfit') setUnrealizedProfitActive(false);
    };

    // Combined data structure for FlatList sections
    const combinedData = [
        { type: 'portfolio', data: filteredPortfolio },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'portfolio':
                return (
                    <View style={styles.portfolioContainer}>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Current Value</Text>
                                <Text style={styles.summaryValue}>₹{totalCurrentValue.toFixed(2)}</Text>
                                <Text style={[styles.summaryPercent, currentValuePercent < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ({currentValuePercent.toFixed(2)}%)
                                </Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Investment</Text>
                                <Text style={styles.summaryValue}>₹{totalInvestment.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Total P&L</Text>
                                <Text style={[styles.summaryValue, totalPL < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ₹{totalPL.toFixed(2)}
                                </Text>
                                <Text style={[styles.summaryPercent, totalPLPercent < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ({totalPLPercent.toFixed(2)}%)
                                </Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Unrealised P&L</Text>
                                <Text style={[styles.summaryValue, totalUnrealisedPL < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ₹{totalUnrealisedPL.toFixed(2)}
                                </Text>
                                <Text style={[styles.summaryPercent, unrealisedPLPercent < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ({unrealisedPLPercent.toFixed(2)}%)
                                </Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Realised P&L</Text>
                                <Text style={[styles.summaryValue, totalRealisedPL < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ₹{totalRealisedPL.toFixed(2)}
                                </Text>
                                <Text style={[styles.summaryPercent, realisedPLPercent < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ({realisedPLPercent.toFixed(2)}%)
                                </Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Day&apos;s P&L</Text>
                                <Text style={[styles.summaryValue, totalDaysPL < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ₹{totalDaysPL.toFixed(2)}
                                </Text>
                                <Text style={[styles.summaryPercent, daysPLPercent < 0 ? styles.negativeValue : styles.positiveValue]}>
                                    ({daysPLPercent.toFixed(2)}%)
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.sectionTitle}>Stock Portfolio</Text>
                        <FlatList
                            data={item.data}
                            renderItem={renderStockItem}
                            keyExtractor={(item, index) => item.symbol + index}
                            contentContainerStyle={styles.portfolioList}
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    const renderStockItem = ({ item }) => {
        // Derive current price from investment and profitLoss
        const currentPrice = (item.investment + item.profitLoss) / item.qty;
        const unrealisedPL = item.profitLoss;
        const cmpChangePercent = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
        const uplChangePercent = (unrealisedPL / item.investment) * 100;

        return (
            <TouchableOpacity onPress={() => {
                setSelectedStock(item);
                rbSheetRef.current?.open();
            }}>
                <View style={styles.stockBorder}>
                    <LinearGradient
                        colors={['#4E4E6A', '#2A2A40']}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0.2, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <LinearGradient
                            colors={['#000', '#1E1E2F']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0.2, y: 0 }}
                            style={styles.stockRow}
                        >
                            <View style={styles.stockColumn}>
                                <Text style={styles.stockSymbol}>{item.symbol}</Text>
                                <View style={styles.stockRowItem}>
                                    <View style={styles.stockRowItem}>
                                        <Text style={styles.stockTitle}>Qty: </Text>
                                        <Text style={styles.stockValue}>{item.qty}</Text>
                                    </View>
                                    <View style={styles.stockRowItem}>
                                        <Text style={styles.stockTitle}>Avg: </Text>
                                        <Text style={styles.stockValue}>₹{item.avgPrice.toFixed(2)}</Text>
                                    </View>
                                </View>
                                <View style={styles.stockRowItem}>
                                    <Text style={styles.stockTitle}>Mkt Val: </Text>
                                    <Text style={styles.stockValue}>₹{(currentPrice * item.qty).toFixed(2)}</Text>
                                </View>
                            </View>
                            <View style={styles.stockColumn}>
                                <View style={styles.stockRowItem}>
                                    <Text style={styles.stockTitle}>CMP: </Text>
                                    <Text style={[styles.stockValue, cmpChangePercent < 0 ? styles.negativeValue : styles.positiveValue, { fontSize: 16, fontWeight: 'bold' }]}>₹{currentPrice.toFixed(2)}</Text>
                                    <Text style={[styles.stockProfit, cmpChangePercent < 0 ? styles.negativeValue : styles.positiveValue]}>
                                        ({cmpChangePercent.toFixed(2)}%)
                                    </Text>
                                </View>
                                <View style={styles.stockRowItem}>
                                    <Text style={styles.stockTitle}>U. P&L: </Text>
                                    <Text style={[styles.stockProfit, unrealisedPL < 0 ? styles.negativeValue : styles.positiveValue]}>
                                        ₹{unrealisedPL.toFixed(2)}
                                    </Text>
                                    <Text style={[styles.stockProfit, uplChangePercent < 0 ? styles.negativeValue : styles.positiveValue]}>
                                        ({uplChangePercent.toFixed(2)}%)
                                    </Text>
                                </View>
                                <View style={styles.stockRowItem}>
                                    <Text style={styles.stockTitle}>Realised P&L: </Text>
                                    <Text style={[styles.stockProfit, item.realisedPL < 0 ? styles.negativeValue : styles.positiveValue]}>
                                        ₹{item.realisedPL.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Portfolio'} />
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search stock by name or symbol..."
                    placeholderTextColor="#A9A9A9"
                />
                <TouchableOpacity onPress={() => filterSheetRef.current?.open()} style={styles.filterButton}>
                    <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>
            </View>
            {activeFilters.length > 0 && (
                <View style={styles.activeFiltersContainer}>
                    {activeFilters.map((filter) => (
                        <View key={filter.key} style={styles.activeFilter}>
                            <Text style={styles.activeFilterText}>{filter.label}</Text>
                            <TouchableOpacity onPress={() => removeFilter(filter.key)}>
                                <MaterialIcons name="close" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
            <View style={styles.gradientBackground}>
                <FlatList
                    data={combinedData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#05FF93']} />
                    }
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <RBSheet
                ref={rbSheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    },
                    container: {
                        backgroundColor: '#1A1A2E',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        width: '100%',
                    },
                    draggableIcon: {
                        backgroundColor: '#333',
                    },
                }}
                height={700}
                openDuration={250}
            >
                {selectedStock && (
                    <View style={styles.sheetContent}>
                        <Text style={styles.sheetTitle}>{selectedStock.symbol} - {selectedStock.name}</Text>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Exchange: </Text>
                            <Text style={styles.sheetDetail}>{selectedStock.exchange}</Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Day&apos;s PL: </Text>
                            <Text style={[styles.sheetDetail, (selectedStock.daysPL || 0) < 0 ? styles.negativeValue : styles.positiveValue]}>
                                ₹{(selectedStock.daysPL || 0).toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Total quantity: </Text>
                            <Text style={styles.sheetDetail}>{selectedStock.qty || 0}</Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Qty. held for more than 1 yr.: </Text>
                            <Text style={styles.sheetDetail}>{selectedStock.longTermQty || 0}</Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Average price: </Text>
                            <Text style={styles.sheetDetail}>₹{(selectedStock.avgPrice || 0).toFixed(2)}</Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Invested value: </Text>
                            <Text style={styles.sheetDetail}>₹{(selectedStock.investment || 0).toFixed(2)}</Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Current value: </Text>
                            <Text style={styles.sheetDetail}>₹{((selectedStock.investment || 0) + (selectedStock.profitLoss || 0)).toFixed(2)}</Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Unrealized P&L: </Text>
                            <Text style={[styles.sheetDetail, (selectedStock.profitLoss || 0) < 0 ? styles.negativeValue : styles.positiveValue]}>
                                ₹{(selectedStock.profitLoss || 0).toFixed(2)} ({(((selectedStock.profitLoss || 0) / (selectedStock.investment || 1)) * 100).toFixed(2)}%)
                            </Text>
                        </View>
                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Realized P&L: </Text>
                            <Text style={styles.sheetDetail}>₹{(selectedStock.realisedPL || 0).toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.sellButton}
                            onPress={() => router.push({ pathname: '/OrderHistoryScreen', params: { selectedStock: JSON.stringify(selectedStock) } })}
                        >
                            <Text style={styles.sellButtonText}>View Transaction History</Text>
                        </TouchableOpacity>
                        <View style={styles.filterRow}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'green' }]} onPress={() => console.log('Buy')}>
                                <Text style={styles.buttonText}>Buy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'red' }]} onPress={() => console.log('Sell')}>
                                <Text style={styles.buttonText}>Sell</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Get Quote')}>
                                <Text style={styles.sellButtonText}>Get Quote</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </RBSheet>

            <RBSheet
                ref={filterSheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    },
                    container: {
                        backgroundColor: '#1A1A2E',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                    draggableIcon: {
                        backgroundColor: '#333',
                    },
                }}
                height={500}
                openDuration={250}
            >
                <View style={styles.sheetContent}>
                    <Text style={styles.sectionTitle}>Filters</Text>
                    <Text style={styles.sheetDetail}>Exchange</Text>
                    <View style={styles.filterRow}>
                        <TouchableOpacity onPress={() => setExchange('All')} style={exchange === 'All' ? styles.selectedButton : styles.button}>
                            <Text style={styles.buttonText}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setExchange('NSE')} style={exchange === 'NSE' ? styles.selectedButton : styles.button}>
                            <Text style={styles.buttonText}>NSE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setExchange('BSE')} style={exchange === 'BSE' ? styles.selectedButton : styles.button}>
                            <Text style={styles.buttonText}>BSE</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sheetDetail}>Show</Text>
                    <View style={styles.filterRow}>
                        <TouchableOpacity onPress={() => setRealizedLossActive(!realizedLossActive)} style={[styles.filterItem, realizedLossActive && styles.activeFilterItem]}>
                            <Text style={[styles.toggleText, realizedLossActive && styles.activeText]}>Realized Loss</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRealizedProfitActive(!realizedProfitActive)} style={[styles.filterItem, realizedProfitActive && styles.activeFilterItem]}>
                            <Text style={[styles.toggleText, realizedProfitActive && styles.activeText]}>Realized Profit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setUnrealizedLossActive(!unrealizedLossActive)} style={[styles.filterItem, unrealizedLossActive && styles.activeFilterItem]}>
                            <Text style={[styles.toggleText, unrealizedLossActive && styles.activeText]}>Unrealized Loss</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setUnrealizedProfitActive(!unrealizedProfitActive)} style={[styles.filterItem, unrealizedProfitActive && styles.activeFilterItem]}>
                            <Text style={[styles.toggleText, unrealizedProfitActive && styles.activeText]}>Unrealized Profit</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sheetDetail}>Sorting</Text>
                    <TouchableOpacity onPress={() => handleSort('name')} style={styles.sortItem}>
                        <View style={styles.sortRow}>
                            <Text style={styles.toggleText}>Name</Text>
                            {sortBy === 'name' && (
                                <MaterialIcons name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color="#FFF" />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSort('percentage_change')} style={styles.sortItem}>
                        <View style={styles.sortRow}>
                            <Text style={styles.toggleText}>Percentage Change</Text>
                            {sortBy === 'percentage_change' && (
                                <MaterialIcons name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color="#FFF" />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSort('market_value')} style={styles.sortItem}>
                        <View style={styles.sortRow}>
                            <Text style={styles.toggleText}>Market Value</Text>
                            {sortBy === 'market_value' && (
                                <MaterialIcons name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color="#FFF" />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSort('unrealized_pl')} style={styles.sortItem}>
                        <View style={styles.sortRow}>
                            <Text style={styles.toggleText}>Unrealized P&L</Text>
                            {sortBy === 'unrealized_pl' && (
                                <MaterialIcons name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color="#FFF" />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

export default Portfolio;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#2A2A40',
        borderRadius: 10,
        padding: 10,
        color: '#FFF',
    },
    filterButton: {
        backgroundColor: '#FFC107',
        padding: 10,
        borderRadius: 10,
        marginLeft: 10,
    },
    filterButtonText: {
        color: '#000',
        fontWeight: '600',
    },
    activeFiltersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    activeFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A40',
        borderRadius: 10,
        padding: 5,
        marginRight: 5,
        marginBottom: 5,
    },
    activeFilterText: {
        color: '#FFF',
        marginRight: 5,
    },
    gradientBackground: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradientBorder: {
        padding: 1,
        borderRadius: 15,
    },
    content: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    portfolioContainer: {
        marginBottom: 20,
    },
    portfolioList: {
        paddingBottom: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    summaryCard: {
        backgroundColor: '#2A2A40',
        borderRadius: 10,
        padding: 10,
        width: '30%',
        marginBottom: 10,
    },
    summaryLabel: {
        color: '#A9A9A9',
        fontSize: 12,
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    stockBorder: {
        borderRadius: 13,
        marginBottom: 10,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderRadius: 12,
        paddingHorizontal: 10,
    },
    stockColumn: {
    },
    stockRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockSymbol: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    stockTitle: {
        color: 'gray',
        fontSize: 14,
        marginRight: 5,
    },
    stockValue: {
        color: 'white',
        fontSize: 14,
        marginRight: 5,
    },
    stockProfit: {
        color: '#FFF',
        fontSize: 14,
        marginRight: 5,
        textAlign: 'right',
    },
    stockAllocate: {
        color: '#A9A9A9',
        fontSize: 12,
        flex: 1,
        textAlign: 'right',
    },
    sheetContent: {
        padding: 20,
        width: '100%',
    },
    sheetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 5,
    },
    sheetLabel: {
        color: '#FFF',
        fontSize: 14,
    },
    sheetTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    sheetDetail: {
        color: '#A9A9A9',
        fontSize: 14,
    },
    orderList: {
        paddingBottom: 20,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    orderCell: {
        color: '#FFF',
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
    },
    sellButton: {
        backgroundColor: '#FFC107',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBlock: 20,
    },
    sellButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    positiveValue: {
        color: '#05FF93',
    },
    negativeValue: {
        color: '#FF0505',
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'start',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#1A1A2E',
        flex: 1,
        alignItems: 'center',
    },
    selectedButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#333',
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    filterItem: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 10,
    },
    activeFilterItem: {
        borderColor: '#05FF93',
    },
    toggleText: {
        color: '#fff',
    },
    activeText: {
        color: '#05FF93',
    },
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sortItem: {
        marginBottom: 10,
    },
    actionButton: {
        backgroundColor: '#FFC107',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
});