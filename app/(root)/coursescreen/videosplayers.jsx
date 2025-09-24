import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { Video } from 'expo-video';
import { Component, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import WebView from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

// Error Boundary Component
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <LinearGradient colors={['#000', '#000']} style={styles.container}>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Something went wrong: {this.state.error?.message || 'Unknown error'}</Text>
                        <Button title="Go Back" onPress={() => router.back()} color="#2B6BFD" />
                    </View>
                </LinearGradient>
            );
        }
        return this.props.children;
    }
}

const VideosPlayers = () => {
    const { courseId, videoId } = useLocalSearchParams();
    const [course, setCourse] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoStatus, setVideoStatus] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);

    // Get API base URL from app.json with fallback
    const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000/api';

    // Utility function to detect video source type
    const getVideoSourceType = (url) => {
        if (!url) return 'unknown';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('vimeo.com')) return 'vimeo';
        if (url.endsWith('.mp4') || url.endsWith('.mkv')) return 'file';
        return 'unknown';
    };

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Function to fetch course and video data
    const fetchCourseAndVideo = async () => {
        if (!courseId) {
            console.error('No courseId provided');
            setError('No course selected. Please choose a course.');
            setIsLoading(false);
            return;
        }
        if (!videoId) {
            console.error('No videoId provided');
            setError('No video selected. Please choose a video.');
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
            const selectedCourse = response.data.find(course => course.id === courseId && course.isPublished);
            if (!selectedCourse) {
                console.error('Course not found for ID:', courseId);
                setError('Course not found. Please check the course ID.');
                setIsLoading(false);
                return;
            }
            // console.log('Selected Course:', selectedCourse);
            setCourse(selectedCourse);
            const allVideos = selectedCourse.modules.flatMap(module => module.videos);
            const video = allVideos.find(v => v.videoUrl === videoId);
            if (!video) {
                console.error('Video not found for URL:', videoId);
                setError('Video not found. Please check the video URL.');
                setIsLoading(false);
                return;
            }
            // console.log('Selected Video:', video);
            setSelectedVideo(video);
            const initialStatus = allVideos.reduce((acc, v) => ({ ...acc, [v.videoUrl]: false }), {});
            setVideoStatus(initialStatus);
        } catch (err) {
            console.error('Fetch Error:', err.message, err.code);
            setError('Failed to load course or video. Please check your network or server and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        // console.log('VideosPlayers - Route params:', { courseId, videoId });
        // console.log('VideosPlayers - API_BASE_URL:', API_BASE_URL);
        fetchCourseAndVideo();
    }, [courseId, videoId]);

    // Handle pull-to-refresh
    const onRefresh = async () => {
        if (!courseId || !videoId || !API_BASE_URL) {
            setError(!courseId ? 'No course selected.' : !videoId ? 'No video selected.' : 'API base URL is not defined.');
            setRefreshing(false);
            return;
        }
        setRefreshing(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/TdCourses`, { timeout: 10000 });
            // console.log('Refresh API Response:', response.data);
            const selectedCourse = response.data.find(course => course.id === courseId && course.isPublished);
            if (!selectedCourse) {
                setError('Course not found. Please check the course ID.');
                setRefreshing(false);
                return;
            }
            setCourse(selectedCourse);
            const allVideos = selectedCourse.modules.flatMap(module => module.videos);
            const video = allVideos.find(v => v.videoUrl === videoId);
            if (!video) {
                setError('Video not found. Please check the video URL.');
                setRefreshing(false);
                return;
            }
            setSelectedVideo(video);
            const initialStatus = allVideos.reduce((acc, v) => ({ ...acc, [v.videoUrl]: false }), {});
            setVideoStatus(initialStatus);
            setError(null);
        } catch (err) {
            console.error('Refresh Error:', err.message, err.code);
            setError('Failed to refresh course or video. Please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const handleVideoEnd = () => {
        if (selectedVideo) {
            setVideoStatus(prev => ({ ...prev, [selectedVideo.videoUrl]: true }));
            console.log(`Video ${selectedVideo.title} marked as complete`);
        }
    };

    const handleVideoSelect = (video) => {
        console.log('Selecting video:', video.title, video.videoUrl);
        setSelectedVideo(video);
        setPlaying(false);
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            style={styles.videoItem}
            onPress={() => handleVideoSelect(item)}
            disabled={item.videoUrl === selectedVideo?.videoUrl}
        >
            <View style={styles.videoItemContent}>
                <Ionicons
                    name={videoStatus[item.videoUrl] ? 'checkmark-circle' : 'play-circle-outline'}
                    size={20}
                    color={videoStatus[item.videoUrl] ? '#00FF00' : '#2B6BFD'}
                />
                <Text style={styles.videoTitle}>{item.title}</Text>
                <Text style={styles.videoDuration}>{item.duration}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading && !refreshing) {
        return (
            <LinearGradient colors={['#000', '#000']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2B6BFD" />
                    <Text style={styles.loadingText}>Loading video...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#000', '#000']} style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <View className="flex-row gap-2">
                        <Button title="Retry" onPress={fetchCourseAndVideo} color="#2B6BFD" />
                        <Button title="Go Back" onPress={() => router.back()} color="#2B6BFD" />
                    </View>
                </View>
            </LinearGradient>
        );
    }

    if (!course || !selectedVideo) {
        return (
            <LinearGradient colors={['#000', '#000']} style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Course or video not found.</Text>
                    <Button title="Go Back" onPress={() => router.back()} color="#2B6BFD" />
                </View>
            </LinearGradient>
        );
    }

    const videoSourceType = getVideoSourceType(selectedVideo.videoUrl);
    // console.log('Rendering player for video:', selectedVideo.videoUrl, 'Type:', videoSourceType);

    return (
        <ErrorBoundary>
            <LinearGradient colors={['#000', '#000']} style={styles.container}>
                <View style={styles.content}>
                    {videoSourceType === 'file' && (
                        <Video
                            ref={videoRef}
                            style={styles.videoPlayer}
                            source={{ uri: selectedVideo.videoUrl }}
                            useNativeControls
                            resizeMode="contain"
                            onPlaybackStatusUpdate={(status) => {
                                if (status.didJustFinish) handleVideoEnd();
                            }}
                            shouldPlay={playing}
                            onError={(err) => {
                                console.error('Video playback error:', err);
                                setError('Failed to play video');
                            }}
                        />
                    )}
                    {videoSourceType === 'youtube' && (
                        <YoutubePlayer
                            height={200}
                            play={playing}
                            videoId={getYouTubeVideoId(selectedVideo.videoUrl)}
                            onChangeState={(event) => {
                                if (event === 'ended') {
                                    handleVideoEnd();
                                    setPlaying(false);
                                }
                                if (event === 'playing') setPlaying(true);
                            }}
                            onError={(err) => {
                                console.error('YouTube playback error:', err);
                                setError('Failed to play YouTube video');
                            }}
                        />
                    )}
                    {videoSourceType === 'vimeo' && (
                        <WebView
                            style={styles.videoPlayer}
                            source={{ uri: selectedVideo.videoUrl }}
                            allowsFullscreenVideo
                            onError={(err) => {
                                console.error('Vimeo playback error:', err);
                                setError('Failed to play Vimeo video');
                            }}
                        />
                    )}
                    {videoSourceType === 'unknown' && (
                        <Text style={styles.errorText}>Unsupported video format</Text>
                    )}
                    <Text style={styles.lessonTitle}>{selectedVideo.title}</Text>
                    <Text style={styles.lessonDescription}>{selectedVideo.description}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Other Videos</Text>
                        <FlatList
                            data={course.modules.flatMap(module => module.videos).filter(v => v.videoUrl !== selectedVideo.videoUrl)}
                            renderItem={renderVideoItem}
                            keyExtractor={(item) => item.videoUrl}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.videoList}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={['#2B6BFD']}
                                    tintColor="#2B6BFD"
                                />
                            }
                        />
                    </View>
                </View>
            </LinearGradient>
        </ErrorBoundary>
    );
};

export default VideosPlayers;

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
    videoPlayer: {
        width: '100%',
        height: 200,
        backgroundColor: '#000',
        borderRadius: 12,
        marginBottom: 16,
    },
    lessonTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
        fontFamily: 'Questrial-Regular',
        marginTop: 10,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#A0AEC0',
        lineHeight: 20,
        marginBottom: 16,
        fontFamily: 'Questrial-Regular',
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
    videoList: {
        paddingVertical: 8,
    },
    videoItem: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#3D4050',
        borderRadius: 8,
    },
    videoItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    videoTitle: {
        flex: 1,
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 8,
        fontFamily: 'Questrial-Regular',
    },
    videoDuration: {
        fontSize: 12,
        color: '#A0AEC0',
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
});