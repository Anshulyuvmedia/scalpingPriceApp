import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import HomeHeader from '@/components/HomeHeader';
import { FontAwesome5 } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

const Screener = () => {
    const possibleBreakoutsData = [
        { id: '1', count: '2 Stocks' },
        { id: '2', count: '5 Stocks' },
        { id: '3', count: '5 Stocks' },
        { id: '4', count: '5 Stocks' },
    ];

    const topOversoldData = [
        { id: '1', label: 'High Delivery' },
        { id: '2', label: 'Low Delivery' },
        { id: '3', label: 'Low Delivery' },
        { id: '4', label: 'Low Delivery' },
    ];

    const topCrossersData = [
        { id: '1', label: 'Top Gainers' },
        { id: '2', label: 'Top Losers' },
        { id: '3', label: 'Top Losers' },
        { id: '4', label: 'Top Losers' },
    ];

    const renderBreakoutCard = ({ item }) => (
        <LinearGradient
            colors={['#6B46C1', '#4299E1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-full mr-3"
        >
            <View className="rounded-full p-4  w-40 h-32 justify-between">
                <Text className="text-white text-sm font-bold">Possible Breakouts</Text>
                <Text className="text-white text-lg font-bold">{item.count}</Text>
                <TouchableOpacity className="bg-gray-900 rounded-full py-1 px-3 self-start">
                    <Text className="text-white text-xs">Free Stocks</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );

    const renderOversoldCard = ({ item }) => (
        <View className="bg-gray-800 rounded-lg p-4 mr-3 w-40 h-32 justify-between">
            <FontAwesome5 name="rocket" size={24} color="white" />
            <Text className="text-white text-base font-bold mt-2">{item.label}</Text>
            <TouchableOpacity className="bg-gray-900 rounded-full py-1 px-3 self-start">
                <Text className="text-white text-xs">Free Stocks</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCrossersCard = ({ item }) => (
        <View className="bg-gray-800 rounded-lg p-4 mr-3 w-40 h-32 justify-between">
            <FontAwesome5 name="tachometer-alt" size={24} color="white" />
            <Text className="text-white text-base font-bold mt-2">{item.label}</Text>
            <TouchableOpacity className="bg-gray-900 rounded-full py-1 px-3 self-start">
                <Text className="text-white text-xs">Free Stocks</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-900 px-2">
            <HomeHeader page={'algo'} />

            <View className="mb-4">
                <Text className="text-white text-lg font-bold">Signal-Based Screeners (Existing Cards)</Text>
            </View>

            <View className="mb-4">
                <FlatList
                    data={possibleBreakoutsData}
                    renderItem={renderBreakoutCard}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <View className="mb-4">
                <FlatList
                    data={topOversoldData}
                    renderItem={renderOversoldCard}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <View className="mb-4">
                <FlatList
                    data={topCrossersData}
                    renderItem={renderCrossersCard}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

export default Screener;