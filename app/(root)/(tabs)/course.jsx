import HomeHeader from '@/components/HomeHeader';
import images from '@/constants/images';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReanimatedCarousel from 'react-native-reanimated-carousel';

// Dummy data for banner carousel
const BANNERS = [
    { id: '1', image: images.courseimg },
    { id: '2', image: images.courseimg },
    { id: '3', image: images.courseimg },
];

// Filter options
const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const Course = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    // Get API base URL from app.json with fallback
    const API_BASE_URL = 'http://192.168.1.38:3000/api';

    // Function to fetch courses
    const fetchCourses = useCallback(async () => {
        if (!API_BASE_URL) {
            setError('API base URL is not defined. Please check app.json configuration.');
            setIsLoading(false);
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/TdCourses`, { timeout: 10000 });
            const publishedCourses = response.data.filter(course => course.isPublished);
            // console.log('API Response:', response.data);
            // console.log('Published Courses:', publishedCourses);
            setCourses(publishedCourses);
        } catch (err) {
            console.error('Fetch Error:', err.message, err.code);
            setError('Failed to load courses. Please check your network or server and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL]);

    // Initial fetch
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
        if (!API_BASE_URL) {
            setError('API base URL is not defined. Please check app.json configuration.');
            setRefreshing(false);
            return;
        }
        setRefreshing(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/TdCourses`, { timeout: 10000 });
            const publishedCourses = response.data.filter(course => course.isPublished);
            // console.log('Refresh API Response:', response.data);
            setCourses(publishedCourses);
            setError(null);
        } catch (err) {
            console.error('Refresh Error:', err.message, err.code);
            setError('Failed to refresh courses. Please try again.');
        } finally {
            setRefreshing(false);
        }
    }, [API_BASE_URL]);

    // Filter courses based on selected filter
    const filteredCourses = selectedFilter === 'All'
        ? courses
        : courses.filter(course => course.level === selectedFilter);

    const renderBannerItem = ({ item }) => (
        <View style={styles.bannerContainer}>
            <Image
                source={item.image}
                style={styles.bannerImage}
                resizeMode="contain"
            />
        </View>
    );

    const renderFilterItem = ({ item }) => (
        <LinearGradient
            colors={['#723CDF', '#9E68E4', '#723CDF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFilter}
        >
            <TouchableOpacity
                onPress={() => setSelectedFilter(item)}
                style={[styles.filterItem, selectedFilter === item && styles.activeFilter]}
            >
                <Text
                    className={`font-questrial text-base ${selectedFilter === item ? 'text-white' : 'text-white'}`}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );

    const renderCourseCard = ({ item }) => {
        // Construct image URL
        let imageUrl = item.coverImage;
        if (!imageUrl.startsWith('http')) {
            // Remove leading slash if present and prepend API base URL
            imageUrl = `${API_BASE_URL.replace(/\/api$/, '')}/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
        }

        return (
            <LinearGradient
                colors={['#AEAED4', '#000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.6 }}
                style={styles.cardGradientBorder}
            >
                <TouchableOpacity
                    style={styles.courseCard}
                    onPress={() => {
                        // console.log('Navigating to CourseListScreen with ID:', item.id);
                        router.push({
                            pathname: '/coursescreen/CourseListScreen',
                            params: { id: item.id },
                        });
                    }}
                >
                    <View style={styles.thumbnailContainer}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                            onError={(e) => console.log('Image Load Error:', e.nativeEvent.error, 'for URL:', imageUrl)}
                        />
                        <View style={styles.playButton}>
                            <FontAwesome name="play" size={20} color="#FFF" />
                        </View>
                        <View style={[styles.tagContainer, { backgroundColor: '#733DDF' }]}>
                            <Text className="text-white font-questrial text-xs">{item.level}</Text>
                        </View>
                    </View>
                    <View style={styles.courseInfo}>
                        <Text className="text-white font-questrial text-sm flex-1 mr-2" numberOfLines={2}>
                            {item.courseName}
                        </Text>
                        <Text className="text-[#AEAED4] font-questrial text-xs">{item.subTitle}</Text>
                    </View>
                </TouchableOpacity>
            </LinearGradient>
        );
    };

    // Render error state with retry button
    const renderErrorState = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCourses}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.fixedContainer}>
                <View style={styles.header}>
                    <HomeHeader page="course" />
                    {/* <View className="flex-row justify-between items-center mb-4"> */}
                        {/* <Text className="text-white font-sora-bold text-xl">Courses</Text> */}
                        {/* <TouchableOpacity onPress={() => router.push('/(root)/notifications')}>
                            <Feather name="bell" size={24} color="#fff" />
                        </TouchableOpacity> */}
                    {/* </View> */}
                </View>

                <ReanimatedCarousel
                    width={screenWidth - 20}
                    height={150}
                    data={BANNERS}
                    renderItem={renderBannerItem}
                    autoPlay
                    autoPlayInterval={3000}
                    loop
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 50,
                        parallaxAdjacentItemScale: 0.75,
                    }}
                    style={styles.carousel}
                />

                <FlatList
                    data={FILTERS}
                    renderItem={renderFilterItem}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#723CDF" />
                    <Text style={styles.loadingText}>Loading courses...</Text>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={filteredCourses}
                    renderItem={renderCourseCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.courseList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#723CDF']}
                            tintColor="#723CDF"
                        />
                    }
                />
            )}
        </View>
    );
};

export default Course;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
        paddingBottom: 0,
    },
    carousel: {
        borderRadius: 10,
        marginBottom: 10,
    },
    bannerContainer: {
        width: '100%',
        // height: 150,
        borderRadius: 10,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        // objectFit: 'contain',
    },
    gradientFilter: {
        borderRadius: 100,
        padding: 1,
        marginRight: 10,
    },
    filterList: {
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    filterItem: {
        alignItems: 'center',
        borderRadius: 100,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#000',
    },
    activeFilter: {
        backgroundColor: '#723CDF',
    },
    cardGradientBorder: {
        borderRadius: 10,
        padding: 1,
        width: (Dimensions.get('window').width - 40) / 2,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    courseList: {
        paddingHorizontal: 5,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    courseCard: {
        borderRadius: 10,
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    thumbnailContainer: {
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -16 }, { translateY: -16 }],
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseInfo: {
        padding: 8,
        paddingBottom: 10,
    },
    tagContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#AEAED4',
        fontSize: 16,
        marginTop: 10,
        fontFamily: 'Questrial-Regular',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FF4D4D',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Questrial-Regular',
    },
    retryButton: {
        backgroundColor: '#723CDF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
});