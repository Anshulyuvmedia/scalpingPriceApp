import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import IndicatorCard from '@/components/IndicatorCard';
import images from '@/constants/images';

const SCREEN_WIDTH = Dimensions.get('window').width;

const IndicatorBased = () => {
    const [activeTab, setActiveTab] = useState('Neutral'); // Default tab

    const Pattern_Data = [
        { id: '1', name: 'Short Straddle', imageuri: images.shortstraddle, type: 'Neutral' },
        { id: '2', name: 'Iron Butterfly', imageuri: images.ironbutterfly, type: 'Neutral' },
        { id: '3', name: 'Short Strangle', imageuri: images.shortstrangle, type: 'Neutral' },
        { id: '4', name: 'Bull Call Spread', imageuri: images.shortstraddle, type: 'Bullish' },
        { id: '5', name: 'Bear Put Spread', imageuri: images.ironbutterfly, type: 'Bearish' },
        { id: '6', name: 'Long Straddle', imageuri: images.shortstrangle, type: 'Others' },
        { id: '7', name: 'Call Option', imageuri: images.shortstraddle, type: 'Bullish' },
        { id: '8', name: 'Put Option', imageuri: images.ironbutterfly, type: 'Bearish' },
    ];

    // Filter data based on active tab
    const filteredData = Pattern_Data.filter((item) => item.type === activeTab);

    return (
        <View style={styles.container}>
            <HomeHeader page={'algo'} />

            {/* Tabs */}
            <View className="flex-row justify-between items-center px-2">
                <TouchableOpacity onPress={() => setActiveTab('Bullish')}>
                    <LinearGradient
                        colors={activeTab === 'Bullish' ? ['#9E68E4', '#723CDF'] : ['#0C0C18', '#B0B0B0']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={[styles.tabBox, { backgroundColor: activeTab === 'Bullish' ? 'transparent' : '#000' }]}>
                            <Text className="text-white font-questrial">Bullish</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Bearish')}>
                    <LinearGradient
                        colors={activeTab === 'Bearish' ? ['#9E68E4', '#723CDF'] : ['#0C0C18', '#B0B0B0']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={[styles.tabBox, { backgroundColor: activeTab === 'Bearish' ? 'transparent' : '#000' }]}>
                            <Text className="text-white font-questrial">Bearish</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Neutral')}>
                    <LinearGradient
                        colors={activeTab === 'Neutral' ? ['#9E68E4', '#723CDF'] : ['#0C0C18', '#B0B0B0']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={[styles.tabBox, { backgroundColor: activeTab === 'Neutral' ? 'transparent' : '#000' }]}>
                            <Text className="text-white font-questrial">Neutral</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Others')}>
                    <LinearGradient
                        colors={activeTab === 'Others' ? ['#9E68E4', '#723CDF'] : ['#0C0C18', '#B0B0B0']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={[styles.tabBox, { backgroundColor: activeTab === 'Others' ? 'transparent' : '#000' }]}>
                            <Text className="text-white font-questrial">Others</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* FlatList */}
            <View>
                <FlatList
                    data={filteredData}
                    renderItem={({ item }) => (
                        <IndicatorCard id={item.id} name={item.name} imageuri={item.imageuri} />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                />
            </View>
        </View>
    );
};

export default IndicatorBased;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e',
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
    },
    gradientBox: {
        borderRadius: 100,
    },
    tabBox: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
    },
    listContainer: {
        paddingVertical: 10,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
});