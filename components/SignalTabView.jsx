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
import { useRouter } from 'expo-router';

// Shared context so SignalCard knows which broker to use
export const BrokerContext = React.createContext('Stratzy');

const SignalTabView = ({
    strategies = [],
    isLoading = false,
    onRefresh,
    emptyMessage = 'No signals yet',
}) => {
    const router = useRouter();



    const handleCardPress = (name) => {
        router.push({
            pathname: 'SignalDetails',
            params: { name },
        });
    };


    return (
        <View className="flex-1 mt-3 pr-3">

            {/* Signals List */}
            <FlatList
                data={strategies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <SignalCard item={item} onPress={() => handleCardPress(item.name)} />}
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
    );
};

export default SignalTabView;