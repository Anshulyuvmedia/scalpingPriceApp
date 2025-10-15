import HomeHeader from '@/components/HomeHeader';
import images from '@/constants/images';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router'; // Use Expo Router
import { memo, useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Memoized NewsCard component
const NewsCard = memo(({ item, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <LinearGradient
            colors={['#222', '#AEAED4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 2, y: 0 }}
            style={styles.gradientBoxBorder}
        >
            <View style={styles.newsbox} className="flex-row bg-black">
                <Image
                    source={typeof item.image === 'string' && item.image.startsWith('http') ? { uri: item.image } : images.courseimg}
                    className="w-20 h-12 rounded mr-3"
                    resizeMode="cover"
                />
                <View className="flex-1">
                    <Text className="text-white text-sm font-bold mb-1" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-xs">{item.source}</Text>
                        <Text className="text-gray-400 text-xs">{item.timestamp}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    </TouchableOpacity>
));
NewsCard.displayName = 'NewsCard';
const NewsListing = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const router = useRouter(); // Use Expo Router's router

    const filters = ['All', 'Stock Market', 'Crypto', 'Business', 'Technology', 'Finance'];

    const filterToApiParams = {
        All: { category: '', keywords: 'business finance technology crypto' },
        'Stock Market': { category: 'business', keywords: 'stock market' },
        Crypto: { category: '', keywords: 'crypto bitcoin blockchain' },
        Business: { category: 'business', keywords: 'business' },
        Technology: { category: 'technology', keywords: 'technology' },
        Finance: { category: 'business', keywords: 'finance' },
    };

    useEffect(() => {
        setNewsData([]);
        setPage(1);
        fetchNews(1);
    }, [selectedFilter]);

    const fetchNews = async (pageNum) => {
        setLoading(true);
        try {
            const { category, keywords } = filterToApiParams[selectedFilter];
            let url = `http://192.168.1.38:3000/api/TdNews/getNewsData?page=${pageNum}`;
            if (category) url += `&category=${category}`;
            if (keywords) url += `&keywords=${keywords}`;

            // console.log('Fetching URL:', url);
            const response = await fetch(url);
            const text = await response.text();
            // console.log('Response status:', response.status);
            // console.log('Response body:', text);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

            const data = JSON.parse(text);
            if (data.dataList.status === '0') {
                Alert.alert('No Results', data.dataList.message || 'No news articles found for this filter.');
                return;
            }

            const formattedData = data.dataList.Item.map((item) => ({
                ...item,
                timestamp: formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }),
                image: typeof item.image === 'string' && item.image.startsWith('http') ? item.image : images.courseimg,
                url: typeof item.url === 'string' && item.url.startsWith('http') ? item.url : '#',
                content: item.content ? item.content.replace(/\[\+\d+ chars\]/, '').trim() : 'No content available',
            }));

            setNewsData((prev) => (pageNum === 1 ? formattedData : [...prev, ...formattedData]));
            if (data.dataList.totalResults <= newsData.length + formattedData.length) {
                // console.log('No more articles to load');
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            Alert.alert('Error', 'Failed to load news. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading) {
            setPage((prev) => prev + 1);
            fetchNews(page + 1);
        }
    };

    const renderFilter = ({ item }) => (
        <TouchableOpacity
            className={`mr-2 px-5 py-3 rounded-full border ${selectedFilter === item ? 'bg-purple-600' : 'bg-gray-900 border-white'}`}
            onPress={() => setSelectedFilter(item)}
        >
            <Text className="text-white text-sm">{item}</Text>
        </TouchableOpacity>
    );

    const renderNewsCard = ({ item }) => {
        // console.log('Navigating to NewsDetail with article:', item);
        return (
            <NewsCard
                item={item}
                onPress={() => router.push({ pathname: './NewsDetail', params: { article: JSON.stringify(item) } })}
            />
        );
    };

    return (
        <View style={styles.container}>
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
                {loading && page === 1 ? (
                    <Text className="text-white">Loading...</Text>
                ) : (
                    <FlatList
                        data={newsData}
                        renderItem={renderNewsCard}
                        keyExtractor={(item) => item.id}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                        ListFooterComponent={loading && page > 1 ? <Text className="text-white">Loading more...</Text> : null}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    gradientBoxBorder: {
        borderRadius: 10,
        padding: 1,
        marginHorizontal: 0,
        marginBottom: 15,
    },
    newsbox: {
        padding: 10,
        borderRadius: 10,
    },
});

export default NewsListing;