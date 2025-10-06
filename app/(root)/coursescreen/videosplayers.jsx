import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
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
    const [selectedVideoIndices, setSelectedVideoIndices] = useState(null); // Store moduleIndex and videoIndex
    const [videoStatus, setVideoStatus] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);

    const API_BASE_URL = 'http://192.168.1.50:3000/api';

    const getVideoSourceType = (url) => {
        if (!url) return 'unknown';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('vimeo.com')) return 'vimeo';
        if (url.endsWith('.mp4') || url.endsWith('.mkv')) return 'file';
        return 'unknown';
    };

    const getYouTubeVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const fetchCourseAndVideo = async () => {
        if (!courseId || !videoId || !API_BASE_URL) {
            console.error('Missing parameters or configuration:', { courseId, videoId, API_BASE_URL });
            setError(
                !courseId ? 'No course selected.' :
                !videoId ? 'No video selected.' :
                'API base URL is not defined.'
            );
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
            // console.log('Modules:', selectedCourse.modules);
            setCourse(selectedCourse);

            const [moduleIndex, videoIndex] = videoId.split('-').map(Number);
            if (isNaN(moduleIndex) || isNaN(videoIndex)) {
                console.error('Invalid videoId format:', videoId);
                setError('Invalid video ID format. Please use moduleIndex-videoIndex (e.g., 0-0).');
                setIsLoading(false);
                return;
            }

            const selectedModule = selectedCourse.modules[moduleIndex];
            // console.log('Selected Module:', selectedModule);
            if (!selectedModule || !selectedModule.videos[videoIndex]) {
                console.error('Video not found for ID:', videoId);
                if (selectedCourse.modules.length > 0 && selectedCourse.modules[0].videos.length > 0) {
                    const fallbackVideo = selectedCourse.modules[0].videos[0];
                    // console.log('Falling back to first video:', fallbackVideo);
                    setSelectedVideo(fallbackVideo);
                    setSelectedVideoIndices({ moduleIndex: 0, videoIndex: 0 });
                } else {
                    setError('No videos available in this course.');
                    setIsLoading(false);
                    return;
                }
            } else {
                const video = selectedModule.videos[videoIndex];
                // console.log('Selected Video:', video);
                setSelectedVideo(video);
                setSelectedVideoIndices({ moduleIndex, videoIndex });
            }

            const allVideos = selectedCourse.modules.flatMap((module, mIndex) =>
                module.videos.map((video, vIndex) => ({
                    ...video,
                    moduleIndex: mIndex,
                    videoIndex: vIndex,
                }))
            );
            // console.log('All Videos:', allVideos);
            const initialStatus = allVideos.reduce((acc, v) => ({ ...acc, [`${v.moduleIndex}-${v.videoIndex}`]: false }), {});
            setVideoStatus(initialStatus);
        } catch (err) {
            console.error('Fetch Error:', err.message, err.code);
            setError('Failed to load course or video. Please check your network or server and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // console.log('Params:', { courseId, videoId });
        fetchCourseAndVideo();
    }, [courseId, videoId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCourseAndVideo();
        setRefreshing(false);
    };

    const handleVideoEnd = () => {
        if (selectedVideo && selectedVideoIndices) {
            setVideoStatus(prev => ({
                ...prev,
                [`${selectedVideoIndices.moduleIndex}-${selectedVideoIndices.videoIndex}`]: true,
            }));
            // console.log(`Video ${selectedVideo.title} marked as complete`);
        }
    };

    const handleVideoSelect = (video, moduleIndex, videoIndex) => {
        // console.log('Selecting video:', video.title, video.videoUrl, { moduleIndex, videoIndex });
        setSelectedVideo(video);
        setSelectedVideoIndices({ moduleIndex, videoIndex });
        setPlaying(false);
        router.push({
            pathname: './videosplayers',
            params: { courseId, videoId: `${moduleIndex}-${videoIndex}` },
        });
    };

    const renderVideoItem = ({ item }) => {
        const { moduleIndex, videoIndex } = item;
        // console.log('Rendering video item:', { title: item.title, moduleIndex, videoIndex });
        return (
            <TouchableOpacity
                style={styles.videoItem}
                onPress={() => handleVideoSelect(item, moduleIndex, videoIndex)}
                disabled={
                    selectedVideoIndices &&
                    moduleIndex === selectedVideoIndices.moduleIndex &&
                    videoIndex === selectedVideoIndices.videoIndex
                }
            >
                <View style={styles.videoItemContent}>
                    <Ionicons
                        name={videoStatus[`${moduleIndex}-${videoIndex}`] ? 'checkmark-circle' : 'play-circle-outline'}
                        size={20}
                        color={videoStatus[`${moduleIndex}-${videoIndex}`] ? '#00FF00' : '#2B6BFD'}
                    />
                    <Text style={styles.videoTitle}>{item.title}</Text>
                    <Text style={styles.videoDuration}>{item.duration}</Text>
                </View>
            </TouchableOpacity>
        );
    };

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
    const otherVideos = course?.modules
        .flatMap((module, mIndex) =>
            module.videos.map((video, vIndex) => ({
                ...video,
                moduleIndex: mIndex,
                videoIndex: vIndex,
            }))
        )
        .filter(
            v =>
                !(
                    selectedVideoIndices &&
                    v.moduleIndex === selectedVideoIndices.moduleIndex &&
                    v.videoIndex === selectedVideoIndices.videoIndex
                )
        ) || [];
    console.log('Other Videos for FlatList:', otherVideos);

    return (
        <ErrorBoundary>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.timeText}>{course.courseName}</Text>
                <Text style={styles.timeText}></Text>
            </View>
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
                        {otherVideos.length === 0 ? (
                            <Text style={styles.errorText}>No other videos available.</Text>
                        ) : (
                            <FlatList
                                data={otherVideos}
                                renderItem={renderVideoItem}
                                keyExtractor={(item) => `${item.moduleIndex}-${item.videoIndex}`}
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
                        )}
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
        backgroundColor: '#000',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingInline: 16,
    },
    backButton: {
        padding: 8,
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
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