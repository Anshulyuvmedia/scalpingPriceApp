import { Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import images from '@/constants/images';

const NewsListing = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = [
        'All',
        'Stock Market',
        'Crypto',
        'Business',
        'Technology',
        'Finance',
    ];

    const newsData = [
        {
            id: '1',
            category: 'Stock Market',
            title: 'Market Hits Record Highs Amid Tech Surge',
            source: 'Economic Times',
            timestamp: '2h ago',
            image: images.courseimg,
        },
        {
            id: '2',
            category: 'Crypto',
            title: 'Bitcoin Surges Past $70K',
            source: 'CoinDesk',
            timestamp: '3h ago',
            image: images.courseimg,
        },
        {
            id: '3',
            category: 'Business',
            title: 'Major Merger Announced in Retail Sector',
            source: 'Business Insider',
            timestamp: '5h ago',
            image: images.courseimg,
        },
        {
            id: '4',
            category: 'Technology',
            title: 'AI Startup Raises $100M in Funding',
            source: 'TechCrunch',
            timestamp: '1d ago',
            image: images.courseimg,
        },
        {
            id: '5',
            category: 'Finance',
            title: 'Federal Reserve Hints at Rate Cut',
            source: 'Bloomberg',
            timestamp: '2d ago',
            image: images.courseimg,
        },
        {
            id: '6',
            category: 'Stock Market',
            title: 'Tech Stocks Lead Market Rally',
            source: 'Reuters',
            timestamp: '3d ago',
            image: images.courseimg,
        },
    ];

    const filteredNews = selectedFilter === 'All'
        ? newsData
        : newsData.filter(item => item.category === selectedFilter);

    const renderFilter = ({ item }) => (
        <TouchableOpacity
            className={`mr-2 px-5 py-3 rounded-full border  ${selectedFilter === item
                ? 'bg-purple-600'
                : 'bg-gray-900 border-white'
                }`}
            onPress={() => setSelectedFilter(item)}
        >
            <Text className="text-white text-sm">{item}</Text>
        </TouchableOpacity>
    );

    const renderNewsCard = ({ item }) => (
        <View className="flex-row bg-black rounded-lg p-3 mb-3">
            <Image
                source={item.image}
                className="w-20 h-12 rounded mr-3"
                resizeMode="cover"
            />
            <View className="flex-1">
                <Text className="text-white text-sm font-bold mb-1">{item.title}</Text>
                <View className="flex-row justify-between">
                    <Text className="text-gray-400 text-xs">{item.source}</Text>
                    <Text className="text-gray-400 text-xs">{item.timestamp}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-900 px-2">
            <HomeHeader page={'news'} />

            <View className="mb-4">
                <Text className="text-white text-2xl font-bold">Market News</Text>
            </View>
            <View>
                <FlatList
                    data={filters}
                    renderItem={renderFilter}
                    keyExtractor={(item) => item}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    className="mb-4"
                />
            </View>
            <View className="flex-1">
                <FlatList
                    data={filteredNews}
                    renderItem={renderNewsCard}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </View>
    );
};

export default NewsListing;