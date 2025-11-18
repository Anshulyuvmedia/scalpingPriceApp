// components/SignalTabView.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import SignalCard from './SignalCard';

// Shared context so SignalCard knows which broker to use
export const BrokerContext = React.createContext('Stratzy');

const SignalTabView = ({
    strategies = [],
    isLoading = false,
    onRefresh,
    emptyMessage = 'No signals yet',
    defaultBroker = 'Stratzy',
}) => {
    const [selectedBroker, setSelectedBroker] = useState(defaultBroker);

    const brokers = ['Stratzy', '5Paisa', 'AngelOne', 'IFL', 'Kotak', 'Master'];

    const toggleBroker = (broker) => {
        setSelectedBroker(broker);
    };

    const renderBrokerChip = ({ item }) => (
        <TouchableOpacity
            onPress={() => toggleBroker(item)}
            className={`mr-3 px-5 py-2.5 rounded-full border transition-all ${selectedBroker === item
                ? 'bg-purple-600 border-purple-600'
                : 'bg-zinc-900 border-zinc-800'
                }`}
        >
            <Text className={`font-sora-semibold text-sm ${selectedBroker === item ? 'text-white' : 'text-gray-400'
                }`}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <BrokerContext.Provider value={selectedBroker}>
            <View className="flex-1 mt-3 pr-3">

                {/* Broker Selection */}
                <View className="">
                    <FlatList
                        data={brokers}
                        renderItem={renderBrokerChip}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 8 }}
                    />
                </View>

                {/* Performance Header */}
                <View className="flex-row justify-between items-center my-3 px-3">
                    <Text className="text-white text-lg font-sora-bold">Performance Ratio</Text>
                    <View className="flex-row items-center rounded-xl overflow-hidden">
                        <View className="px-2 py-2 bg-green-600">
                            <Text className="text-white font-sora-bold">
                            <MaterialCommunityIcons name="arrow-up-thin" size={20} color="white" />
                            68.4%</Text>
                        </View>
                        <View className="px-2 py-2 bg-red-600">
                            <Text className="text-white font-sora-bold">
                            <MaterialCommunityIcons name="arrow-down-thin" size={20} color="white" />
                            31.6%</Text>
                        </View>
                    </View>
                    <Feather name="settings" size={24} color="white" />
                </View>

                {/* Signals List */}
                <FlatList
                    data={strategies}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <SignalCard item={item} />}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#00FF00" />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20">
                            <Text className="text-gray-500 text-lg">{emptyMessage}</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </BrokerContext.Provider>
    );
};

export default SignalTabView;