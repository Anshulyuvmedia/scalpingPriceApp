import icons from '@/constants/icons';
import { useForex } from '@/contexts/ForexContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FxDetails = () => {
    // Use useLocalSearchParams to get navigation params
    const { currencyPair, assetType } = useLocalSearchParams() || { currencyPair: '', assetType: '' };
    // console.log('Route params received:', { currencyPair, assetType }); // Debug log
    const { rates } = useForex();
    const [detail, setDetail] = useState(null);
    const [lowValue, setLowValue] = useState(70);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (!currencyPair || !assetType) {
                    console.warn('Missing currencyPair or assetType, skipping fetch');
                    setIsLoading(false);
                    return;
                }
                const response = await axios.get(
                    `http://192.168.1.20:3000/api/ForexRates/product-detail?currencyPair=${encodeURIComponent(currencyPair)}&assetType=${encodeURIComponent(assetType)}`
                );
                // console.log('API response:', response.data.data); // Log full response
                setDetail(response.data.data || response.data); // Handle both cases
            } catch (error) {
                console.error('Error fetching product detail:', error.message, error.response?.data);
                setErrorMessage(error.message || 'Failed to fetch product detail');
                setDetail(null); // Explicitly set to null on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [currencyPair, assetType]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!detail) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>
                    {errorMessage ? `${errorMessage}` : 'Product not found'}
                </Text>
            </View>
        );
    }

    const product = detail || rates[assetType.toLowerCase()]?.find(item => item.name === currencyPair);

    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{assetType}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>

            </View>
            <ScrollView className="mt-8 px-3">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white font-sora-bold">{product.name}</Text>
                        <Text className="text-[#83838D] font-questrial">Last Updated: {product.lastUpdated || 'N/A'}</Text>
                    </View>
                    <View className="bg-[#05FF92] rounded-full px-4 py-2">
                        <Text className="text-black">Buy Market</Text>
                    </View>
                </View>
                <View className="flex-row justify-between items-center mt-3">
                    <View>
                        <Text className="text-white font-sora">{product.name} CHART</Text>
                        <View className="flex-row mt-1">
                            <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                            <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                            <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                            <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                            <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        </View>
                    </View>
                </View>
                <View className="flex-row justify-between items-center p-3 my-3">
                    <View>
                        <Text className="text-[#83838D] font-sora">Entry</Text>
                        <Text className="text-white font-questrial text-xl">{product.rate || 0}</Text>
                    </View>
                    <View>
                        <Text className="text-[#83838D] font-sora">TP1</Text>
                        <Text className="text-white font-questrial text-xl">{(product.rate * 1.02).toFixed(2) || 'N/A'}</Text>
                    </View>
                    <View>
                        <Text className="text-[#83838D] font-sora">TP2</Text>
                        <Text className="text-white font-questrial text-xl">{(product.rate * 1.04).toFixed(2) || 'N/A'}</Text>
                    </View>
                    <View>
                        <Text className="text-[#83838D] font-sora">TP3</Text>
                        <Text className="text-white font-questrial text-xl">{(product.rate * 1.06).toFixed(2) || 'N/A'}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between items-center mt-3">
                    <View>
                        <Text className="text-white font-sora text-2xl">{product.rate || 0}</Text>
                        <Text className={product.changePercent >= 0 ? "text-[#05FF92]" : "text-[#FF4444]"} font-sora>
                            {product.changePercent >= 0 ? `+${product.changePercent}` : product.changePercent}%
                        </Text>
                    </View>
                </View>
                <View className="items-start my-3">
                    <Text className="text-white font-sora mb-1 text-xl">AI Confidence</Text>
                    <View className="flex-row justify-between items-center">
                        <View style={styles.sliderContainer}>
                            <View style={styles.customTrack} />
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
                <View>
                    <Text className="text-white text-xl font-sora mb-3">Analysis</Text>
                    <Text className="text-gray-400 font-questrial text-lg">
                        {assetType === 'crypto' ? 'Bitcoin is showing signs of recovery after a recent dip. The overall trend remains bullish with strong support levels.'
                            : 'Analysis data not available for this asset type.'}
                    </Text>
                    <View className="flex-row justify-between mt-3">
                        <View>
                            <Text className="text-gray-400 text-lg font-questrial">Trade Type</Text>
                            <Text className="text-white text-xl font-sora">Spot</Text>
                        </View>
                        <View>
                            <Text className="text-gray-400 text-lg font-questrial">Strategy</Text>
                            <Text className="text-white text-xl font-sora">Breakout</Text>
                        </View>
                        <View>
                            <Text className="text-gray-400 text-lg font-questrial">Sector</Text>
                            <Text className="text-white text-xl font-sora">{assetType.charAt(0).toUpperCase() + assetType.slice(1)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>

    );
};

export default FxDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        textTransform: 'capitalize',
        fontWeight: '800',
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    error: {
        color: '#ff4444',
        textAlign: 'center',
        fontSize: 18,
    },
    sliderContainer: {
        position: 'relative',
        width: '90%',
        height: 40,
    },
    slider: {
        width: '100%',
        height: 40,
        position: 'absolute',
    },
    customTrack: {
        position: 'absolute',
        top: 15,
        width: '100%',
        height: 10,
        backgroundColor: '#333',
        borderRadius: 4,
    },
    thumb: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#1F65FF',
        top: -10,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
});