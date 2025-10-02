// app/(root)/(tabs)/chatbot/tabview/FutureTab.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useRouter } from 'expo-router';

const GradientCard = ({ children, style, gradientColor }) => (
    <LinearGradient
        colors={['#000', gradientColor || '#AEAED4']} // Use gradientColor or fallback to default
        start={{ x: 1, y: 0.6 }}
        end={{ x: 0, y: 0.5 }}
        style={[styles.gradientBoxBorder, style]}
    >
        <View style={[styles.card, { backgroundColor: '#111827' }]}>{children}</View>
    </LinearGradient>
);

const FutureTab = ({ signals, loading, error, onRefresh }) => {
    const router = useRouter();

    const calculateChange = (entry, exit) => {
        if (!entry || !exit) return 'N/A';
        const change = ((exit - entry) / entry) * 100;
        return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    };

    const renderSignalItem = ({ item }) => {
        const change = calculateChange(item.entry, item.exit);
        const isPositive = change !== 'N/A' && parseFloat(change) >= 0;
        const color = isPositive ? 'bg-green-500' : 'bg-red-500';
        const gradientColor = isPositive ? '#22C55E' : '#EF4444'; // Tailwind green-500 and red-500 hex values
        const icon = isPositive ? 'arrow-up-right' : 'arrow-down-right';

        return (
            <TouchableOpacity
                className="flex-row items-center rounded-full"
                onPress={() => router.push(`/signaldetail/${item.id}`)}
            >
                <GradientCard style={styles.indexBox} gradientColor={gradientColor}>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-white font-sora text-lg uppercase">{item.stockName}</Text>
                        <Text className="text-gray-400 font-questrial mt-2">{change}</Text>
                        <View className={`flex-row items-center p-2 px-5 ${color} rounded-full`}>
                            <Feather name={icon} size={16} color="#fff" />
                            <Text className="text-white font-questrial ml-2">{item.marketSentiments}</Text>
                        </View>
                    </View>
                </GradientCard>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-white font-questrial text-lg">Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-red-500 font-questrial text-lg">Error: {error}</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                    <Text className="text-white font-questrial text-lg">Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (signals.length === 0) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-white font-questrial text-lg">No Futures signals available.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <FlatList
                data={signals}
                renderItem={renderSignalItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
            />
        </View>
    );
};

export default FutureTab;

const styles = StyleSheet.create({
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    card: {
        borderRadius: 25,
        padding: 15,
    },
    indexBox: {
        padding: 1,
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    retryButton: {
        backgroundColor: '#723CDF',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
});