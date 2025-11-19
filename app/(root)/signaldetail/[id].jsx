// app/(root)/(tabs)/chatbot/signaldetail/[id].jsx
import HomeHeader from '@/components/HomeHeader';
import icons from '@/constants/icons';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const API_BASE_URL = 'http://192.168.1.23:3000/api';

const GradientCard = ({ children, style }) => (
    <LinearGradient
        colors={['#000', '#AEAED4']}
        start={{ x: 0.3, y: 0.6 }}
        end={{ x: 0, y: 0 }}
        style={[styles.gradientBoxBorder, style]}
    >
        <View style={[styles.card, { backgroundColor: '#000' }]}>{children}</View>
    </LinearGradient>
);

const InfoItem = ({ label, value, color = 'text-white' }) => (
    <View className="items-start">
        <Text className="text-gray-400 text-lg font-questrial">{label}</Text>
        <Text className={`text-xl font-sora ${color}`}>{value}</Text>
    </View>
);

const SignalDetail = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [signal, setSignal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lowValue, setLowValue] = useState(70); // AI Confidence (placeholder)

    const fetchSignal = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/TdSignals/${id}`, { timeout: 10000 });
            // console.log('API Response:', response.data);
            setSignal(response.data);
        } catch (err) {
            const errorMessage = err.response
                ? `API Error: ${err.response.status} - ${err.response.statusText} - ${JSON.stringify(err.response.data)}`
                : `Network Error: ${err.message}`;
            console.error('Fetch Signal Error:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignal();
    }, [id]);

    const calculateChange = (entry, exit) => {
        if (!entry || !exit) return 'N/A';
        const change = ((exit - entry) / entry) * 100;
        return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <HomeHeader page={'chatbot'} title="Loading..." action={'refresh'} />
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <HomeHeader page={'chatbot'} title="Error" action={'refresh'} />
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={fetchSignal} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!signal) {
        return (
            <View style={styles.container}>
                <HomeHeader page={'chatbot'} title="Signal Not Found" action={'refresh'} />
                <Text style={styles.errorText}>Signal not found</Text>
            </View>
        );
    }

    const change = calculateChange(signal.entry, signal.exit);
    const isPositive = change !== 'N/A' && parseFloat(change) >= 0;
    const signalColor = isPositive ? 'bg-green-500' : 'bg-red-500';
    const signalIcon = isPositive ? 'arrow-up-right' : 'arrow-down-right';

    const priceLevels = [
        { id: '1', label: 'Entry', value: `₹ ${signal.entry}`, color: 'text-white' },
        { id: '2', label: 'Target', value: `₹ ${signal.target}`, color: 'text-green-400' },
        { id: '3', label: 'Stop-Loss', value: `₹ ${signal.stopLoss}`, color: 'text-red-600' },
        { id: '4', label: 'Exit', value: `₹ ${signal.exit}`, color: 'text-white' },
    ];

    const renderPriceLevel = ({ item }) => (
        <GradientCard style={styles.priceCard}>
            <Text className="text-gray-400 text-xl font-questrial">{item.label}</Text>
            <Text className={`text-4xl font-sora ${item.color}`}>{item.value}</Text>
        </GradientCard>
    );

    return (
        <View className="flex-1 bg-black" style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Signal Details'} action={'refresh'} onAction={fetchSignal} />

            <FlatList
                data={[{ key: 'content' }]} // Single item to render main content
                renderItem={() => (
                    <>
                        <GradientCard style={styles.indexBox}>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white font-sora-bold text-xl uppercase">{signal.stockName}</Text>
                                <LinearGradient
                                    colors={['#AEAED4', '#000']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientBorder}
                                >
                                    <TouchableOpacity
                                        className="flex-row items-center bg-black px-4 py-2 rounded-full"
                                        onPress={fetchSignal}
                                    >
                                        <Feather name="refresh-cw" size={16} color="#999" />
                                        <Text className="text-white font-questrial ml-2">Refresh data</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                            <View className="flex-row justify-between mt-4">
                                <View>
                                    <Text className="text-white font-questrial mb-1 text-xl">Signal</Text>
                                    <View className={`flex-row items-center p-2 px-5 ${signalColor} rounded-full`}>
                                        <Feather name={signalIcon} size={16} color="#fff" />
                                        <Text className="text-white font-questrial ml-2">{signal.signalType}</Text>
                                    </View>
                                </View>
                                <View className="items-end px-2">
                                    <Text className="text-white font-questrial mb-1 text-xl">AI Confidence</Text>
                                    <View className="flex-row justify-between items-center">
                                        <View style={styles.sliderContainer}>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={0}
                                                maximumValue={100}
                                                value={lowValue}
                                                onValueChange={(value) => setLowValue(Math.round(value))}
                                                minimumTrackTintColor="#1F65FF"
                                                maximumTrackTintColor="#AEAED4"
                                                thumbTintColor="#1F65FF"
                                                thumbImage={icons.ellipse}
                                            />
                                        </View>
                                        <Text className="text-white font-sora ml-2">{lowValue}%</Text>
                                    </View>
                                </View>
                            </View>
                        </GradientCard>

                        <View className="">
                            <Text className="text-xl font-sora-bold text-white mb-3">Price Levels</Text>
                            <FlatList
                                data={priceLevels}
                                renderItem={renderPriceLevel}
                                keyExtractor={(item) => item.id}
                                numColumns={2}
                                columnWrapperStyle={styles.priceRow}
                                scrollEnabled={false}
                            />

                            <Text className="text-xl font-sora-bold text-white mb-3 mt-4">Analysis</Text>
                            <Text className="text-gray-400 font-questrial">
                                {signal.marketSentiments} signal detected.{' '}
                                {signal.marketSentiments === 'Bullish'
                                    ? 'Short-Term traders may look for buying opportunities.'
                                    : signal.marketSentiments === 'Bearish'
                                        ? 'Short-Term traders may look for selling opportunities.'
                                        : 'Market is neutral, monitor for breakout opportunities.'}
                            </Text>
                            <View className="flex-row justify-between mt-3">
                                <InfoItem label="Trade Type" value={signal.tradeType} />
                                <InfoItem label="Strategy" value={signal.Strategy} />
                                <InfoItem label="Category" value={signal.category} />
                            </View>

                            <View className="flex-row items-center p-2 px-5 mt-3">
                                <Feather
                                    name={signal.marketSentiments === 'Bullish' ? 'arrow-up-right' : 'arrow-down-right'}
                                    size={16}
                                    color={signal.marketSentiments === 'Bullish' ? 'green' : 'red'}
                                />
                                <Text className="text-gray-400 font-questrial ml-2">
                                    Market Sentiment:{' '}
                                    <Text className="text-white font-questrial">{signal.marketSentiments}</Text>
                                </Text>
                            </View>
                        </View>
                    </>
                )}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSignal} />}
            />
        </View>
    );
};

export default SignalDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    text: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Questrial-Regular',
    },
    errorText: {
        color: '#FF0505',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Questrial-Regular',
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
    },
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
    },
    sliderContainer: {
        width: 150,
        height: 40,
    },
    slider: {
        width: 150,
        height: 40,
    },
    priceCard: {
        flex: 1,
    },
    priceRow: {
        justifyContent: 'space-between',
    },
    scrollContent: {
        paddingBottom: 50,
    },
    retryButton: {
        backgroundColor: '#723CDF',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
});