import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import images from '@/constants/images';
import HomeHeader from '@/components/HomeHeader';
import ReanimatedCarousel from 'react-native-reanimated-carousel';

// Dummy data for courses
const COURSES = [
    {
        id: '1',
        title: 'Introduction to Stock Trading',
        category: 'Course',
        tag: 'Beginner',
        thumbnail: images.courseimg,
    },
    {
        id: '2',
        title: 'Live Market Analysis',
        category: 'Live Session',
        tag: 'Advanced',
        thumbnail: images.courseimg,
    },
    {
        id: '3',
        title: 'Crypto Investing 101',
        category: 'Stock',
        tag: 'Crypto',
        thumbnail: images.courseimg,
    },
    {
        id: '4',
        title: 'Technical Analysis Basics',
        category: 'Course',
        tag: 'Beginner',
        thumbnail: images.courseimg,
    },
    {
        id: '5',
        title: 'Live Q&A with Experts',
        category: 'Live Session',
        tag: 'Advanced',
        thumbnail: images.courseimg,
    },
];

// Dummy data for banner carousel
const BANNERS = [
    { id: '1', image: images.courseimg },
    { id: '2', image: images.courseimg },
    { id: '3', image: images.courseimg },
];

// Filter options
const FILTERS = ['All', 'Course', 'Live Session', 'Stock'];

const Course = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const screenWidth = Dimensions.get('window').width;

    // Filter courses based on selected filter
    const filteredCourses = selectedFilter === 'All'
        ? COURSES
        : COURSES.filter(course => course.category === selectedFilter);

    const renderBannerItem = ({ item }) => (
        <View style={styles.bannerContainer}>
            <Image
                source={item.image}
                defaultSource={item.thumbnail}
                style={styles.bannerImage}
                resizeMode="cover"
            />
        </View>
    );

    const renderFilterItem = ({ item }) => (
        <LinearGradient
            colors={['#723CDF', '#9E68E4', '#723CDF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFiler}
        >
            <TouchableOpacity
                onPress={() => setSelectedFilter(item)}
                style={[styles.filterItem, selectedFilter === item && styles.activeFilterText,]}
            >
                <Text
                    style={[
                        styles.filterText,
                        selectedFilter === item && styles.activeFilterText,
                    ]}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );

    const renderCourseCard = ({ item }) => (
        <LinearGradient
            colors={['#AEAED4', '#000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={styles.cardGradientBorder}
        >
            <TouchableOpacity
                style={styles.courseCard}
                onPress={() => router.push(`../coursescreen/${item.id}`)}
            >
                <View style={styles.thumbnailContainer}>
                    <Image
                        source={item.thumbnail} // Direct reference for local image
                        style={styles.thumbnail}
                        defaultSource={item.thumbnail}
                        resizeMode="cover"
                    />
                    <View style={styles.playButton}>
                        <FontAwesome name="play" size={20} color="#FFF" />
                    </View>
                    <View
                        style={[
                            styles.tagContainer,
                            { backgroundColor: item.tag === 'Beginner' ? '#733DDF' : item.tag === 'Advanced' ? '#733DDF' : '#733DDF' },
                        ]}
                    >
                        <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                </View>
                <View style={styles.courseInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.courseTitle} numberOfLines={2}>
                            {item.title}
                        </Text>

                    </View>
                    <Text style={styles.courseCategory}>{item.category}</Text>
                </View>
            </TouchableOpacity>
        </LinearGradient>
    );

    return (
        <ScrollView style={styles.container}>
            <HomeHeader page={'course'} />

            <View style={styles.header}>
                <Text className="text-white font-sora-bold text-xl">Courses</Text>
                <Feather name="bell" size={24} color="#fff" />
            </View>

            {/* Banner Carousel */}
            <ReanimatedCarousel
                width={screenWidth - 20}
                height={200}
                data={BANNERS}
                renderItem={renderBannerItem}
                autoPlay
                autoPlayInterval={3000}
                loop
                mode="parallax" // Enable center mode
                modeConfig={{
                    parallaxScrollingScale: 0.9, // Scale of the centered item
                    parallaxScrollingOffset: 50, // Offset for adjacent items (controls how much of them is visible)
                    parallaxAdjacentItemScale: 0.75, // Scale of adjacent items
                }}
                style={styles.carousel}
            />

            {/* Filter Tabs */}
            <FlatList
                data={FILTERS}
                renderItem={renderFilterItem}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
            />

            {/* Course Cards (2 per row) */}
            <FlatList
                data={filteredCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                scrollEnabled={false}
                contentContainerStyle={styles.courseList}
            />
        </ScrollView>
    );
};

export default Course;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#1e1e1e',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    carousel: {
        borderRadius: 10,
    },
    bannerContainer: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    cardGradientBorder: {
        borderRadius: 25,
        padding: 1,
        width: (Dimensions.get('window').width - 40) / 2,
    },
    gradientFiler: {
        borderRadius: 100,
        padding: 1,
        marginRight: 10,
    },
    filterList: {
        paddingVertical: 20,
    },
    filterItem: {
        alignItems: 'center',
        borderRadius: 100,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#000',

    },
    filterText: {
        color: '#fff',
        fontFamily: 'Questrial-Regular',
        fontSize: 16,
    },
    activeFilterText: {
        color: '#FFF',
        backgroundColor: '#723CDF',
    },
    courseList: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },

    courseCard: {
        borderRadius: 25,
        backgroundColor: '#1e1e1e',
        overflow: 'hidden',
    },
    thumbnailContainer: {
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
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
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    courseTitle: {
        color: '#FFF',
        fontFamily: 'Questrial-Regular',
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    tagContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 10,
    },
    tagText: {
        color: '#FFF',
        fontFamily: 'Questrial-Regular',
        fontSize: 10,
    },
    courseCategory: {
        color: '#AEAED4',
        fontFamily: 'Questrial-Regular',
        fontSize: 12,
    },
});