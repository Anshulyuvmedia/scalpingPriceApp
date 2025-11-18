import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IndicatorCard from '@/components/IndicatorCard';
import { OptionStrategySVGs } from '@/constants/OptionStrategySVGs';
import { useRouter } from 'expo-router';

const TABS = ['Bullish', 'Bearish', 'Neutral', 'Others'];

const IndicatorBased = () => {
    const [activeTab, setActiveTab] = useState('Bullish');
    const router = useRouter(); 

    const Pattern_Data = [
        { id: '1', name: 'Buy Call', type: 'Bullish' },
        { id: '2', name: 'Sell Put', type: 'Bullish' },
        { id: '3', name: 'Bull Call Spread', type: 'Bullish' },
        { id: '4', name: 'Bull Put Spread', type: 'Bullish' },
        { id: '5', name: 'Call Ratio Back Spread', type: 'Bullish' },

        { id: '6', name: 'Buy Put', type: 'Bearish' },
        { id: '7', name: 'Sell Call', type: 'Bearish' },
        { id: '8', name: 'Bear Put Spread', type: 'Bearish' },
        { id: '9', name: 'Bear Call Spread', type: 'Bearish' },
        { id: '10', name: 'Put Ratio Back Spread', type: 'Bearish' },

        { id: '11', name: 'Short Straddle', type: 'Neutral' },
        { id: '12', name: 'Iron Butterfly', type: 'Neutral' },
        { id: '13', name: 'Short Strangle', type: 'Neutral' },
        { id: '14', name: 'Short Iron Condor', type: 'Neutral' },

        { id: '15', name: 'Put Ratio Spread', type: 'Others' },
        { id: '16', name: 'Call Ratio Spread', type: 'Others' },
        { id: '17', name: 'Long Straddle', type: 'Others' },
        { id: '18', name: 'Long Iron Butterfly', type: 'Others' },
        { id: '19', name: 'Iron Strangle', type: 'Others' },
        { id: '20', name: 'Long Iron Condor', type: 'Others' },
    ];

    const filteredData = Pattern_Data.filter(item => item.type === activeTab);

    const handleCardPress = (name) => {
        router.push({
            pathname: 'StrategyDetailScreen',
            params: { name },
        });
    };

    const renderTab = ({ item }) => (
        <TouchableOpacity onPress={() => setActiveTab(item)} style={{ marginRight: 12 }}>
            <LinearGradient
                colors={activeTab === item ? ['#9E68E4', '#723CDF'] : ['#333', '#333']}
                style={{ borderRadius: 30, padding: 2 }}
            >
                <View style={{
                    backgroundColor: '#000',
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    borderRadius: 28,
                    minWidth: 85,
                    alignItems: 'center',
                }}>
                    <Text style={{
                        color: activeTab === item ? '#fff' : '#aaa',
                        fontSize: 15,
                        fontWeight: activeTab === item ? 'bold' : 'normal',
                    }}>
                        {item}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <FlatList
                    data={TABS}
                    renderItem={renderTab}
                    keyExtractor={item => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Strategy Cards Grid */}
            <FlatList
                data={filteredData}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <IndicatorCard
                        name={item.name}
                        svg={OptionStrategySVGs[item.name]}
                        onPress={() => handleCardPress(item.name)}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    tabContainer: {
        paddingVertical: 15,
        paddingHorizontal: 5,
        backgroundColor: '#000',
    },
    list: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
});

export default IndicatorBased;