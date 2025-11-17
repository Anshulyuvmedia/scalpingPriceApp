// screens/Signals.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useStrategies } from '@/contexts/StrategyContext';

// Tab Components
import SwingTrade from './signaltabview/swingtrade';
import StockOption from './signaltabview/stockoption';
import IndexOption from './signaltabview/indexoption';
import IndexStrategies from './signaltabview/indexstrategies';

const initialLayout = { width: Dimensions.get('window').width - 20 };

const Signals = () => {
    const [index, setIndex] = useState(0);

    const {
        loading,
        refreshing,
        swingTrade,
        stockOption,
        indexOption,
        indexStrategies,
        refetch,
    } = useStrategies();

    const routes = [
        { key: 'swingtrade', title: 'Swing Trade', data: swingTrade },
        { key: 'stockoption', title: 'Stock Option', data: stockOption },
        { key: 'indexstrategies', title: 'Index Strategies', data: indexStrategies },
        { key: 'indexoption', title: 'Index Option', data: indexOption },
    ];

    const renderScene = SceneMap({
        swingtrade: () => <SwingTrade strategies={swingTrade} isLoading={refreshing} onRefresh={refetch} />,
        stockoption: () => <StockOption strategies={stockOption} isLoading={refreshing} onRefresh={refetch} />,
        indexoption: () => <IndexOption strategies={indexOption} isLoading={refreshing} onRefresh={refetch} />,
        indexstrategies: () => <IndexStrategies strategies={indexStrategies} isLoading={refreshing} onRefresh={refetch} />,
    });

    // Custom Label with Badge
    const renderLabel = ({ route, focused }) => {
        const count = route.data.length;

        return (
            <View className="flex-row items-center px-4">
                <Text
                    className={`font-sora-bold text-sm ${focused ? 'text-white' : 'text-gray-400'
                        }`}
                >
                    {route.title}
                </Text>
                {count > 0 && (
                    <View className="ml-2 bg-green-500 px-2 py-0.5 rounded-full min-w-[20px]">
                        <Text className="text-white text-xs font-bold text-center">
                            {count}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // Clean Bottom Indicator (Default Style)
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
                    Loading signals...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.Container}>
            {/* Header */}
            <View className="flex-row justify-between items-start px-2">
                <View>
                    <Text className="text-white text-2xl font-sora-extrabold">Signals</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                        Real-time trading signals by SEBI registered analysts
                    </Text>
                </View>
                <Feather name="menu" size={28} color="white" />
            </View>

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

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 10,
    },
    tabViewContainer: {
        flex: 1,
        marginTop: 10,
    },
    tabBar: {
        backgroundColor: '#000',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    indicator: {
        backgroundColor: '#22c55e',   // Your green
        height: 3,
        borderRadius: 2,
        marginBottom: 4,
    },
});

export default Signals;