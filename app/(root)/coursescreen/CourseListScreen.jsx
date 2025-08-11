import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import images from '@/constants/images';
import Constants from 'expo-constants';
import axios from 'axios';

const CourseListScreen = () => {
    const { id } = useLocalSearchParams();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Get API base URL from app.json with fallback
    const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.1.215:3000/api';

    // Debug logging
    // useEffect(() => {
    //     console.log('CourseListScreen - Constants.expoConfig', Constants.expoConfig);
    //     console.log('CourseListScreen - API_BASE_URL', API_BASE_URL);
    //     console.log('CourseListScreen - Course ID:', id);
    // }, [id]);

    // Function to fetch course data
    const fetchCourse = useCallback(async () => {
        if (!id) {
            console.error('No course ID provided');
            setError('No course selected. Please choose a course.');
            setIsLoading(false);
            return;
        }
        if (!API_BASE_URL) {
            console.error('API base URL is not defined');
            setError('API base URL is not defined. Please check app.json configuration.');
            setIsLoading(false);
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/TdCourses`, { timeout: 10000 });
            // console.log('API Response:', response.data);
            const selectedCourse = response.data.find(course => course.id === id && course.isPublished);
            if (selectedCourse) {
                // console.log('Selected Course:', selectedCourse);
                // Check for duplicate video URLs
                const allVideos = selectedCourse.modules.flatMap(module => module.videos);
                const videoUrlCounts = allVideos.reduce((acc, video) => {
                    acc[video.videoUrl] = (acc[video.videoUrl] || 0) + 1;
                    return acc;
                }, {});
                const duplicates = Object.entries(videoUrlCounts).filter(([url, count]) => count > 1);
                if (duplicates.length > 0) {
                    console.warn('Duplicate video URLs detected:', duplicates);
                }
                setCourse(selectedCourse);
                setError(null);
            } else {
                console.error('Course not found for ID:', id);
                setError(`Course not found for ID: ${id}`);
            }
        } catch (err) {
            console.error('Fetch Error:', err.message, err.code);
            setError('Failed to load course details. Please check your network or server and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [id, API_BASE_URL]);

    // Initial fetch
    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
        if (!id || !API_BASE_URL) {
            setError(id ? 'API base URL is not defined.' : 'No course selected.');
            setRefreshing(false);
            return;
        }
        setRefreshing(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/TdCourses`, { timeout: 10000 });
            // console.log('Refresh API Response:', response.data);
            const selectedCourse = response.data.find(course => course.id === id && course.isPublished);
            if (selectedCourse) {
                // console.log('Selected Course:', selectedCourse);
                // Check for duplicate video URLs
                const allVideos = selectedCourse.modules.flatMap(module => module.videos);
                const videoUrlCounts = allVideos.reduce((acc, video) => {
                    acc[video.videoUrl] = (acc[video.videoUrl] || 0) + 1;
                    return acc;
                }, {});
                const duplicates = Object.entries(videoUrlCounts).filter(([url, count]) => count > 1);
                if (duplicates.length > 0) {
                    console.warn('Duplicate video URLs detected:', duplicates);
                }
                setCourse(selectedCourse);
                setError(null);
            } else {
                setError(`Course not found for ID: ${id}`);
            }
        } catch (err) {
            console.error('Refresh Error:', err.message, err.code);
            setError('Failed to refresh course details. Please try again.');
        } finally {
            setRefreshing(false);
        }
    }, [id, API_BASE_URL]);

    // Fade animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleLessonPress = (videoUrl, videoIndex, moduleIndex) => {
        // console.log('Navigating to VideosPlayers with:', { courseId: id, videoId: videoUrl, videoIndex, moduleIndex });
        if (!id || !videoUrl) {
            console.error('Invalid navigation parameters:', { courseId: id, videoId: videoUrl });
            setError('Invalid course or video selection.');
            return;
        }
        router.push({
            pathname: './videosplayers',
            params: { courseId: id, videoId: `${moduleIndex}-${videoIndex}` },
        });
    };

    const LessonItem = ({ item, onPress, moduleIndex, videoIndex }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }).start();
        };

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onPress(item.videoUrl, videoIndex, moduleIndex)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.lessonItem}
            >
                <Animated.View style={[styles.lessonContent, { transform: [{ scale: scaleAnim }] }]}>
                    <Ionicons name="play-circle-outline" size={20} color="#2B6BFD" style={styles.playIcon} />
                    <Text style={styles.lessonTitle}>{item.title}</Text>
                    <Text style={styles.lessonDuration}>{item.duration}</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderLessonItem = ({ item, index }) => {
        // Find the module index for this video
        const moduleIndex = course.modules.findIndex(module => 
            module.videos.some(video => video.videoUrl === item.videoUrl)
        );
        return <LessonItem item={item} onPress={handleLessonPress} moduleIndex={moduleIndex} videoIndex={index} />;
    };

    const renderSkillItem = ({ item }) => (
        <View style={styles.skillItem}>
            <Text style={styles.skillText}>{item}</Text>
        </View>
    );

    const renderItems = course && !error ? [
        {
            id: 'header',
            type: 'header',
            content: (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.timeText}>12:53</Text>
                </View>
            ),
        },
        {
            id: 'courseHeader',
            type: 'courseHeader',
            content: (
                <View style={styles.courseHeader}>
                    <Image
                        source={{ 
                            uri: course.coverImage.startsWith('http') 
                                ? course.coverImage 
                                : `${API_BASE_URL.replace(/\/api$/, '')}/${course.coverImage.startsWith('/') ? course.coverImage.slice(1) : course.coverImage}`
                        }}
                        style={styles.courseThumbnail}
                        resizeMode="cover"
                        onError={(e) => console.log('Image Load Error:', e.nativeEvent.error, 'for URL:', course.coverImage)}
                    />
                    <Text style={styles.courseTitle}>{course.courseName}</Text>
                    <Text style={styles.subTitle}>{course.subTitle}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{course.rating} ({course.totalRatings})</Text>
                    </View>
                    <Text style={styles.instructorText}>by {course.instructorName}</Text>
                    <Text style={styles.priceText}>${course.pricing}</Text>
                    <Text style={styles.courseDuration}>{course.duration} | {course.language} | {course.level}</Text>
                </View>
            ),
        },
        {
            id: 'overview',
            type: 'section',
            content: (
                <LinearGradient
                    colors={['#000', '#AEAED4']}
                    start={{ x: 0.3, y: 0.6 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.sectionBorder}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <Text style={styles.overviewText}>{course.description}</Text>
                    </View>
                </LinearGradient>
            ),
        },
        {
            id: 'details',
            type: 'section',
            content: (
                <LinearGradient
                    colors={['#000', '#AEAED4']}
                    start={{ x: 0.3, y: 0.6 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.sectionBorder}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Details</Text>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Ionicons name="document-text-outline" size={16} color="#A0AEC0" />
                                <Text style={styles.detailText}>{course.enrollments} Enrollments</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={16} color="#A0AEC0" />
                                <Text style={styles.detailText}>{course.duration}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            ),
        },
        {
            id: 'skills',
            type: 'section',
            content: (
                <LinearGradient
                    colors={['#000', '#AEAED4']}
                    start={{ x: 0.3, y: 0.6 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.sectionBorder}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <FlatList
                            data={course.tags}
                            renderItem={renderSkillItem}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.skillList}
                        />
                    </View>
                </LinearGradient>
            ),
        },
        {
            id: 'lessons',
            type: 'section',
            content: (
                <LinearGradient
                    colors={['#000', '#AEAED4']}
                    start={{ x: 0.3, y: 0.6 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.sectionBorder}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lessons</Text>
                        <FlatList
                            data={course.modules.flatMap((module, moduleIndex) => 
                                module.videos.map((video, videoIndex) => ({
                                    ...video,
                                    moduleIndex,
                                    videoIndex,
                                    uniqueKey: `${moduleIndex}-${videoIndex}`,
                                }))
                            )}
                            renderItem={renderLessonItem}
                            keyExtractor={(item) => item.uniqueKey}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.lessonList}
                        />
                    </View>
                </LinearGradient>
            ),
        },
        {
            id: 'enroll',
            type: 'enroll',
            content: (
                <TouchableOpacity style={styles.enrollButton} onPress={() => alert('Enroll pressed')}>
                    <LinearGradient
                        colors={['#2B6BFD', '#1E4ED8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.enrollGradient}
                    >
                        <Text style={styles.enrollText}>GET ENROLL</Text>
                    </LinearGradient>
                </TouchableOpacity>
            ),
        },
    ] : [];

    if (isLoading && !refreshing) {
        return (
            <LinearGradient colors={['#000', '#2E3A59']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2B6BFD" />
                    <Text style={styles.loadingText}>Loading course details...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#000', '#2E3A59']} style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchCourse}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    if (!course) {
        return (
            <LinearGradient colors={['#000', '#2E3A59']} style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Course not found.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#000', '#2E3A59']}
            style={styles.container}
        >
            <FlatList
                data={renderItems}
                renderItem={({ item }) => (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {item.content}
                    </Animated.View>
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#2B6BFD']}
                        tintColor="#2B6BFD"
                    />
                }
            />
        </LinearGradient>
    );
};

export default CourseListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    backText: {
        color: '#2B6BFD',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
    timeText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    courseHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    courseThumbnail: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginBottom: 8,
    },
    courseTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 4,
        fontFamily: 'Questrial-Regular',
    },
    subTitle: {
        fontSize: 16,
        color: '#A0AEC0',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Questrial-Regular',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 16,
        color: '#FFD700',
        marginLeft: 4,
        fontFamily: 'Questrial-Regular',
    },
    instructorText: {
        fontSize: 16,
        color: '#A0AEC0',
        marginBottom: 4,
        fontFamily: 'Questrial-Regular',
    },
    priceText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Questrial-Regular',
    },
    courseDuration: {
        fontSize: 14,
        color: '#A0AEC0',
        fontFamily: 'Questrial-Regular',
    },
    sectionBorder: {
        borderRadius: 12,
        marginBottom: 16,
        padding: 1,
    },
    section: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
        fontFamily: 'Questrial-Regular',
    },
    overviewText: {
        fontSize: 14,
        color: '#A0AEC0',
        lineHeight: 20,
        fontFamily: 'Questrial-Regular',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: '#A0AEC0',
        marginLeft: 4,
        fontFamily: 'Questrial-Regular',
    },
    skillList: {
        paddingVertical: 8,
    },
    skillItem: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#3D4050',
        borderRadius: 12,
        marginRight: 8,
    },
    skillText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    lessonList: {
        paddingVertical: 8,
    },
    lessonItem: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#3D4050',
        borderRadius: 8,
    },
    lessonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playIcon: {
        marginRight: 8,
    },
    lessonTitle: {
        flex: 1,
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    lessonDuration: {
        fontSize: 12,
        color: '#A0AEC0',
        fontFamily: 'Questrial-Regular',
    },
    enrollButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 16,
    },
    enrollGradient: {
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enrollText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Questrial-Regular',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Questrial-Regular',
    },
    retryButton: {
        backgroundColor: '#2B6BFD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 16,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
});