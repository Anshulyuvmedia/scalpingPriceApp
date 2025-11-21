import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    withRepeat,
    Easing,
} from 'react-native-reanimated';

const AgloDetailView = () => {
    const { executionId, data: rawData } = useLocalSearchParams();

    // Parse the execution data (passed as string from Algo.jsx)
    let execution = null;
    try {
        execution = rawData ? JSON.parse(rawData) : null;
    } catch (e) {
        console.log('Failed to parse execution data');
    }

    // Fallback if not parsed
    if (!execution) {
        execution = {
            id: executionId,
            strategyName: '20 EMA & Supertrend',
            broker: 'AngelOne',
            quantity: 250,
            status: 'running',
            executedAt: new Date().toISOString(),
            strategy: { strategyType: 'indicatorbased' },
        };
    }

    // Dummy live P&L animation
    const [pnl, setPnl] = useState(1250.5);
    const [entryPrice] = useState(184.2);
    const [currentPrice, setCurrentPrice] = useState(186.8);
    const [isProfit, setIsProfit] = useState(true);

    useEffect(() => {
        if (execution.status !== 'running') return;

        const interval = setInterval(() => {
            const change = (Math.random() - 0.5) * 8;
            const newPrice = entryPrice + (currentPrice - entryPrice) * 0.98 + change * 0.1;
            setCurrentPrice(prev => (prev + change * 0.02));

            const newPnl = ((newPrice - entryPrice) * execution.quantity).toFixed(2);
            setPnl(Math.abs(newPnl));
            setIsProfit(newPrice > entryPrice);
        }, 2000);

        return () => clearInterval(interval);
    }, [execution.status, execution.quantity, entryPrice]);

    // Timer since execution
    const [timeRunning, setTimeRunning] = useState('00:00:00');
    useEffect(() => {
        const start = new Date(execution.executedAt).getTime();
        const timer = setInterval(() => {
            const diff = Date.now() - start;
            const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setTimeRunning(`${hours}:${minutes}:${seconds}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [execution.executedAt]);

    const pulse = useSharedValue(1);
    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    return (
        <View className="flex-1 bg-[#050509]">
            <View className="mx-4 mt-4">
                <HomeHeader page="back" title="Live Algorithm" />
            </View>

            <View className="px-5 pt-4">
                {/* Header Card */}
                <View className="bg-[#111114] rounded-2xl p-5 border border-[#222226]">
                    <Text className="text-white text-2xl font-sora-bold">
                        {execution.strategyName || 'Unknown Strategy'}
                    </Text>
                    <Text className="text-[#AEAEB9] text-sm mt-1 font-questrial">
                        {execution.broker} • {execution.quantity} Qty
                    </Text>

                    <View className="flex-row items-center mt-4 gap-4">
                        <View className="flex-row items-center">
                            <View className={`w-3 h-3 rounded-full ${execution.status === 'running' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`} />
                            <Text className="text-white font-sora-semibold capitalize">
                                {execution.status === 'running' ? 'Running Live' : execution.status}
                            </Text>
                        </View>
                        <Text className="text-[#666] font-questrial">• {timeRunning}</Text>
                    </View>
                </View>

                {/* Live P&L - BIG HIGHLIGHT */}
                <View className="mt-6 bg-[#111114] rounded-2xl p-6 border border-[#222226] items-center">
                    <Text className="text-[#AEAEB9] text-sm font-questrial uppercase tracking-wider">
                        Unrealized P&L
                    </Text>

                    <Animated.View style={animatedStyle}>
                        <Text
                            className={`text-5xl font-sora-extrabold mt-3 ${isProfit ? 'text-[#05FF93]' : 'text-red-500'
                                }`}
                        >
                            {isProfit ? '+' : '-'}₹{pnl}
                        </Text>
                    </Animated.View>

                    <Text className={`text-lg mt-2 ${isProfit ? 'text-[#05FF93]' : 'text-red-500'}`}>
                        {isProfit ? '↑' : '↓'} {((currentPrice - entryPrice) / entryPrice * 100).toFixed(2)}%
                    </Text>
                </View>

                {/* Price Info */}
                <View className="flex-row mt-6 gap-4">
                    <View className="flex-1 bg-[#111114] rounded-2xl p-5 border border-[#222226]">
                        <Text className="text-[#666] text-xs font-questrial uppercase">Entry Price</Text>
                        <Text className="text-white text-2xl font-sora-bold mt-2">₹{entryPrice.toFixed(2)}</Text>
                    </View>
                    <View className="flex-1 bg-[#111114] rounded-2xl p-5 border border-[#222226]">
                        <Text className="text-[#666] text-xs font-questrial uppercase">Current Price</Text>
                        <Text className="text-white text-2xl font-sora-bold mt-2">₹{currentPrice}</Text>
                        <Text className={`text-sm mt-1 ${isProfit ? 'text-[#05FF93]' : 'text-red-500'}`}>
                            {isProfit ? '↑' : '↓'} ₹{Math.abs(currentPrice - entryPrice).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="mt-8 flex-row gap-4">
                    <TouchableOpacity
                        onPress={() => Alert.alert('Cancel', 'This will square off the position. Confirm?', [
                            { text: 'No' },
                            { text: 'Yes, Cancel', style: 'destructive' },
                        ])}
                        className="flex-1 bg-red-900/20 border border-red-800 rounded-2xl py-4 flex-row justify-center items-center"
                    >
                        <Feather name="x-circle" size={20} color="#ff4444" />
                        <Text className="text-red-400 font-sora-semibold ml-2">Cancel Algo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-1 bg-[#05FF93]/10 border border-[#05FF93]/30 rounded-2xl py-4 flex-row justify-center items-center">
                        <MaterialIcons name="show-chart" size={20} color="#05FF93" />
                        <Text className="text-[#05FF93] font-sora-semibold ml-2">View Chart</Text>
                    </TouchableOpacity>
                </View>

                {/* Execution ID */}
                <Text className="text-[#444] text-xs text-center mt-8 font-questrial">
                    Execution ID: {execution.id}
                </Text>
            </View>
        </View>
    );
};

export default AgloDetailView;