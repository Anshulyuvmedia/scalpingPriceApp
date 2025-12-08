import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useStrategies } from '@/contexts/StrategyContext';

// Tab Components 
import OverviewTab from './Overview';
import DematHoldingTab from './DematHolding';
import TradeBook from './TradeBook';

const initialLayout = { width: Dimensions.get('window').width - 20 };

const PortfolioTabs = () => {
    const [index, setIndex] = useState(0);

    const { loading, refreshing, overviewData, dematHoldingData, refetch, } = useStrategies();

    const [routes] = useState([
        { key: 'overview', title: 'Overview' },
        { key: 'demat', title: 'Demat Holding' },
        { key: 'tradebook', title: 'Trade Book' },
    ]);

    // Pass actual data + loading states properly
    const renderScene = SceneMap({
        overview: () => (
            <OverviewTab
                data={overviewData}
                isLoading={refreshing}
                onRefresh={refetch}
            />
        ),
        demat: () => (
            <DematHoldingTab
                data={dematHoldingData}
                isLoading={refreshing}
                onRefresh={refetch}
            />
        ),
        tradebook: () => (
            <TradeBook
                data={dematHoldingData}
                isLoading={refreshing}
                onRefresh={refetch}
            />
        ),
    });

    // Custom label with badge count from context
    const renderLabel = ({ route, focused }) => {
        let count = 0;

        if (route.key === 'overview' && Array.isArray(overviewData)) {
            count = overviewData.length;
        } else if (route.key === 'demat' && Array.isArray(dematHoldingData)) {
            count = dematHoldingData.length;
        }

        return (
            <View className="flex-row items-center px-4">
                <Text className={`font-sora-bold text-sm ${focused ? 'text-white' : 'text-gray-400'}`}>
                    {route.title}
                </Text>
                {count > 0 && (
                    <View className="ml-2 bg-green-500 px-2 py-0.5 rounded-full min-w-[20px]">
                        <Text className="text-white text-xs font-bold text-center">
                            {count > 99 ? '99+' : count}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            renderLabel={renderLabel}
        />
    );

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#00FF00" />
                <Text className="text-gray-400 mt-6 text-lg font-sora">
                    Loading Portfolio...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.Container}>
            {/* Tab View */}
            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={initialLayout}
                    renderTabBar={renderTabBar}
                    lazy
                />
            </View>
        </View>
    );
};

export default PortfolioTabs;

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#000',
    },
    tabViewContainer: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: '#000',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    indicator: {
        backgroundColor: '#22c55e',
        height: 3,
        borderRadius: 2,
        marginBottom: 4,
    },
});