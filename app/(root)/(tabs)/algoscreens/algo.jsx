// app/(root)/algoscreens/Algo.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Switch,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AlgoCard from '@/components/AlgoCard';
import { router } from 'expo-router';
import { useStrategies } from '@/contexts/StrategyContext';

const Algo = () => {
    const { getActiveExecutions, refetch: refetchSignals } = useStrategies();

    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showPaused, setShowPaused] = useState(false);

    const fetchActive = useCallback(async () => {
        try {
            const data = await getActiveExecutions();
            // console.log('data:', data);
            setExecutions(data || []);
        } catch (err) {
            console.log(err.message)
            Alert.alert('Error', err.message || 'Failed to load algorithms');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getActiveExecutions]);

    useEffect(() => {
        fetchActive();
    }, [fetchActive]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchActive(), refetchSignals?.()]);
    };

    // Separate Running & Queued
    const running = executions.filter(e => e.status === 'running');
    const queued = executions.filter(e => e.status === 'queued');
    const paused = executions.filter(e => e.status === 'paused');

    const filteredRunning = running;
    const filteredQueued = queued;
    const filteredPaused = showPaused ? paused : [];

    const handleView = (executionId, executionData) => {
        router.push({
            pathname: 'AgloDetailView',
            params: {
                executionId,
                data: JSON.stringify(executionData), // Must stringify full object
            },
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#05FF93" />
                <Text className="text-white mt-4 font-questrial">Loading algorithms...</Text>
            </View>
        );
    }

    const renderSection = (title, data, color) => {
        if (data.length === 0) return null;

        return (
            <View className="px-4">
                <View className="flex-row items-center mb-3">
                    <View className={`w-2 h-2 rounded-full ${color} mr-2`} />
                    <Text className="text-white text-lg font-sora-semibold">
                        {title} ({data.length})
                    </Text>
                </View>

                <FlatList
                    data={data}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingRight: 16 }}
                    renderItem={({ item }) => {
                        const strategy = item.strategy || {};
                        return (
                            <AlgoCard
                                id={item.id}
                                name={strategy.strategyName || 'Unnamed Strategy'}
                                subtitle={item.broker || 'Custom'}
                                date={new Date(item.executedAt).toLocaleDateString() + ' ' + new Date(item.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                status={item.status}
                                onPressView={() => handleView(item.id, item)}
                                onUpdate={fetchActive}
                            />
                        );
                    }}
                />
            </View>
        );
    };

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-4 pt-5 pb-4">
                <Text className="text-white text-2xl font-sora-extrabold">Algorithmic Trading</Text>
                <Text className="text-[#AEAEB9] text-base font-questrial mt-2">
                    Live & Queued Algorithms
                </Text>

                <View className="flex-row justify-between items-center ">
                    <View className="flex-row items-center gap-3">
                        <Switch
                            trackColor={{ false: '#333', true: '#05FF9333' }}
                            thumbColor={showPaused ? '#05FF93' : '#666'}
                            onValueChange={setShowPaused}
                            value={showPaused}
                        />
                        <Text className="text-[#AEAEB9] font-questrial">Show Paused</Text>
                    </View>

                    <LinearGradient
                        colors={['#AEAED4', '#000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 999, padding: 1.5 }}
                    >
                        <TouchableOpacity
                            onPress={onRefresh}
                            disabled={refreshing}
                            className="flex-row items-center bg-black px-5 py-3 rounded-full"
                        >
                            {refreshing ? (
                                <ActivityIndicator size="small" color="#999" />
                            ) : (
                                <Feather name="refresh-cw" size={18} color="#999" />
                            )}
                            <Text className="text-white font-questrial ml-2">
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#05FF93" />
                }
                showsVerticalScrollIndicator={false}
            >
                {executions.length === 0 ? (
                    <View className="items-center mt-20 px-10">
                        <Feather name="activity" size={80} color="#333" />
                        <Text className="text-[#666] text-center mt-6" style={{ fontFamily: 'Questrial-Regular', fontSize: 18 }}>
                            No algorithms running
                        </Text>
                        <Text className="text-[#555] text-center mt-2 font-questrial">
                            Execute a strategy from the Signals tab to see it here
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Running First */}
                        {renderSection('Running Live', filteredRunning, 'bg-green-500')}

                        {/* Then Queued */}
                        {renderSection('In Queue', filteredQueued, 'bg-yellow-500')}

                        {/* Then Paused (only if toggle on) */}
                        {showPaused && renderSection('Paused', filteredPaused, 'bg-gray-500')}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default Algo;