import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import HomeHeader from '@/components/HomeHeader';
import { Feather } from '@expo/vector-icons';

const Signals = () => {
    const [activeTab, setActiveTab] = React.useState(0);
    const [selectedOption, setSelectedOption] = React.useState(null);

    const options = [
        'Stratzy',
        '5Paisa',
        'AngelOne',
        'IFL',
        'Kotak',
        'Master',
    ];

    const tabs = [
        'Swing Trade',
        'Index Strategies',
        'Index Options',
        'Stock Options'
    ];

    const signalsData = [
        {
            stock: 'HINDCOPPER',
            type: '(B) HINDCOPPER X 1',
            date: '2023-06-10  14:30',
            entry: 350.70,
            current: 349.1,
            target: 401.00,
            stopLoss: 325.00,
            quantity: 1,
            performance: 74.58,
            risk: 25.42,
        },
    ];

    const handleOptionSelect = (key) => {
        setSelectedOption(key === selectedOption ? null : key);
    };

    const renderTab = ({ item, index }) => (
        <TouchableOpacity
            className="items-center mx-2"
            onPress={() => setActiveTab(index)}
            activeOpacity={0.7}
        >
            <Text
                className={`text-sm font-sora ${activeTab === index ? 'text-white' : 'text-white'}`}
            >
                {item}
            </Text>
            {activeTab === index && <View className="w-1/2 h-0.5 bg-green-500 mt-1" />}
        </TouchableOpacity>
    );

    const renderOption = ({ item }) => (
        <TouchableOpacity
            className={`flex-row items-center mr-3 px-4 py-2 rounded-full border ${selectedOption === item
                ? 'bg-purple-600 border-purple-600'
                : 'bg-black border-gray-700'
                }`}
            onPress={() => handleOptionSelect(item)}
        >
            <Text className="text-white text-base">{item}</Text>
        </TouchableOpacity>
    );

    const renderSignalCard = ({ item }) => (
        <View className="bg-gray-800 rounded-lg p-4 my-2">
            <View className="mb-2">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-purple-600" />
                        <Text className="text-white text-lg font-bold">{item.stock}</Text>
                    </View>
                    <View className="bg-green-500 rounded px-1 ml-2">
                        <Text className="text-black text-xs">LIVE</Text>
                    </View>
                </View>
                <Text className="text-gray-500 text-xs">{item.type}</Text>
                <Text className="text-gray-500 text-xs">{item.date}</Text>
            </View>



            <View className="flex-row justify-between my-2">
                <View className="items-center">
                    <Text className="text-gray-500 text-xs">Entry</Text>
                    <Text className="text-white text-base font-bold">{item.entry.toFixed(2)}</Text>
                </View>
                <View className="items-center">
                    <Text className="text-gray-500 text-xs">Current/Exit</Text>
                    <Text className="text-white text-base font-bold">{item.current.toFixed(1)}</Text>
                </View>
                <View className="items-center">
                    <Text className="text-gray-500 text-xs">Target</Text>
                    <Text className="text-white text-base font-bold">{item.target.toFixed(2)}</Text>
                </View>
            </View>

            <View className="flex-row justify-between my-2">
                <View className="items-center">
                    <Text className="text-gray-500 text-xs">StopLoss</Text>
                    <Text className="text-white text-base font-bold">{item.stopLoss.toFixed(2)}</Text>
                </View>
                <View className="items-center">
                    <Text className="text-gray-500 text-xs">P&L/Target Hits</Text>
                    <Text className="text-white text-base font-bold">---</Text>
                </View>
                <View className="items-center">
                    <Text className="text-gray-500 text-xs">Quantity</Text>
                    <View className="flex-row items-center">
                        <TouchableOpacity className="bg-purple-600 rounded px-2 py-1">
                            <Text className="text-white text-base font-bold">-</Text>
                        </TouchableOpacity>
                        <Text className="text-white text-base font-bold mx-2">{item.quantity}</Text>
                        <TouchableOpacity className="bg-purple-600 rounded px-2 py-1">
                            <Text className="text-white text-base font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="flex-row justify-between mt-2">
                <TouchableOpacity className="bg-purple-600 rounded-full py-2 px-4">
                    <Text className="text-white text-sm font-bold">Place Order</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-900 border border-purple-600 rounded-full py-2 px-4">
                    <Text className="text-white text-sm font-bold">About Signal</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-900 px-2">
            <HomeHeader page={'algo'} />

            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-white text-lg font-bold">Signals</Text>
                    <Text className="text-gray-500 text-sm">Real-time trading signals by SEBI registered analysts</Text>
                </View>
                <View>
                    <Feather name="menu" size={24} color="white" />
                </View>
            </View>
            <View className="my-2">
                <FlatList
                    data={tabs}
                    renderItem={renderTab}
                    keyExtractor={(item) => item}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View className="my-2">
                <FlatList
                    data={options}
                    renderItem={renderOption}
                    keyExtractor={(item) => item}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View className="flex-row justify-between items-center my-2">
                <Text className="text-white text-lg font-sora-bold">Performance Ratio</Text>
                <View className="flex-row">
                    <View className="p-3 bg-green-500 rounded-l-lg">
                        <Text className="text-white text-base mr-2">↑ 74.58%</Text>
                    </View>
                    <View className="p-3 bg-red-500 rounded-r-lg ">
                        <Text className="text-white text-base">↓ 25.42%</Text>
                    </View>
                </View>
                <Feather name="settings" size={24} color="white" />
            </View>

            <View className="flex-1">
                <FlatList
                    data={signalsData}
                    renderItem={renderSignalCard}
                    keyExtractor={(item) => item.stock}

                />
            </View>

        </View>
    );
};

export default Signals;