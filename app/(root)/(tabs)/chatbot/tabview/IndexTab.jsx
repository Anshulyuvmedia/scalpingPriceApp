// app/(root)/chatbotscreens/tabview/IndexTab.jsx
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import icons from '@/constants/icons';

const IndexTab = () => {
    const [lowValue, setLowValue] = useState(70);
    return (
        <ScrollView className="p-1">
            <LinearGradient
                colors={['#000', '#AEAED4']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 0.5, y: 3 }}
                style={styles.gradientBoxBorder}
            >
                <View style={styles.indexBox} className="bg-black">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-white font-sora-bold text-xl">Bank Nifty</Text>
                        <LinearGradient
                            colors={['#AEAED4', '#000']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <TouchableOpacity className="flex-row items-center bg-black px-4 py-2 rounded-full">
                                <Feather name="refresh-cw" size={16} color="#999" />
                                <Text className="text-white font-questrial ms-2">Refresh data</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                    <View className="flex-row justify-between mt-4">
                        <View>
                            <Text className="text-white font-questrial mb-1 text-xl">Signal</Text>
                            <View className="flex-row items-center p-2 px-5 bg-red-500 rounded-full">
                                <Feather name="arrow-down-right" size={16} color="#fff" />
                                <Text className="text-white font-questrial ms-2">Signal</Text>
                            </View>
                        </View>
                        <View className="items-end px-2">
                            <Text className="text-white font-questrial mb-1 text-xl">AI Confidence</Text>
                            <View className="flex-row justify-between items-center">
                                <View style={styles.sliderContainer}>
                                    {/* Custom track to increase height */}
                                    <View style={styles.customTrack} />
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={0}
                                        maximumValue={100}
                                        value={lowValue}
                                        onValueChange={(value) => { setLowValue(Math.round(value)) }}
                                        minimumTrackTintColor="#1F65FF"
                                        maximumTrackTintColor="#AEAED4"
                                        thumbTintColor="#1F65FF" // Fallback color if thumbImage fails
                                        thumbImage={icons.ellipse} // Path to your custom thumb image
                                    />
                                </View>
                                <Text className="text-white font-sora ml-2">{lowValue}%</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View>
                <Text className="text-xl font-sora-bold text-white mb-3">Price Levels</Text>
                <View className="flex-row g-4">
                    <LinearGradient
                        colors={['#000', '#AEAED4']}
                        start={{ x: 0.3, y: 0.6 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBoxBorder}
                    >
                        <View style={styles.indexCard}>
                            <Text className="text-gray-400 text-xl font-questrial">Entry</Text>
                            <Text className="text-white text-5xl font-sora ">₹ 4200</Text>
                        </View>
                    </LinearGradient>
                    <LinearGradient
                        colors={['#000', '#AEAED4']}
                        start={{ x: 0.3, y: 0.6 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBoxBorder}
                    >
                        <View style={styles.indexCard}>
                            <Text className="text-gray-400 text-xl font-questrial">Target</Text>
                            <Text className="text-green-400 text-5xl font-sora">₹ 4250</Text>
                        </View>
                    </LinearGradient>
                </View>
                <View className="flex-row g-4">
                    <LinearGradient
                        colors={['#000', '#AEAED4']}
                        start={{ x: 0.3, y: 0.6 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBoxBorder}
                    >
                        <View style={styles.indexCard}>
                            <Text className="text-gray-400 text-xl font-questrial">Stop-Loss</Text>
                            <Text className="text-red-600 text-5xl font-sora ">₹ 4150</Text>
                        </View>
                    </LinearGradient>
                    <LinearGradient
                        colors={['#000', '#AEAED4']}
                        start={{ x: 0.3, y: 0.6 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBoxBorder}
                    >
                        <View style={styles.indexCard}>
                            <Text className="text-gray-400 text-xl font-questrial">Exit</Text>
                            <Text className="text-white text-5xl font-sora ">₹ 4230</Text>
                        </View>
                    </LinearGradient>
                </View>
            </View>

            <View>
                <Text className="text-gray-400 font-sora-bold mb-3">Analysis</Text>
                <Text className="text-gray-400">Bearish signal detected Short-Term traders may lock for selling opportunities.</Text>
                <View className='flex-row justify-between mt-3'>
                    <View>
                        <Text className="text-gray-400 text-lg font-questrial">Trade Type</Text>
                        <Text className="text-white text-xl font-sora ">Options</Text>
                    </View>
                    <View>
                        <Text className="text-gray-400 text-lg font-questrial">Strategy</Text>
                        <Text className="text-white text-xl font-sora ">Momentum</Text>
                    </View>
                    <View>
                        <Text className="text-gray-400 text-lg font-questrial">Sector</Text>
                        <Text className="text-white text-xl font-sora ">Index</Text>
                    </View>
                </View>
            </View>

            <View className='mt-3'>
                <View className="flex-row items-center p-2 px-5 rounded-full">
                    <Feather name="arrow-down-right" size={16} color="red" />
                    <Text className="text-gray-400 font-questrial ms-2">Market Sentiment:
                        <Text className='text-white font-questrial '>
                            Bearish
                        </Text>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default IndexTab;

const styles = StyleSheet.create({
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
    indexBox: {
        borderRadius: 25,
        padding: 15,
    },
    sliderContainer: {
        position: 'relative',
        width: 150,
        height: 40,
    },
    slider: {
        width: 150,
        height: 40,
        position: 'absolute',
    },
    customTrack: {
        position: 'absolute',
        top: 15,
        width: 140,
        height: 10,
        backgroundColor: '#1F65FF',
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
    indexCard: {
        backgroundColor: '#000',
        padding: 15,
        paddingBlock: 40,
        paddingBottom: 50,
        alignItems: 'start',
        borderRadius: 25,
    },
});