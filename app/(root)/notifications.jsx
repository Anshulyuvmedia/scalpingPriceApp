import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Notifications = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
    const [filterType, setFilterType] = useState('all'); // 'all', 'read', 'unread'
    const [readStatus, setReadStatus] = useState({});
    const rbSheetRef = useRef(null);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Get API base URL from app.json with fallback
    const API_BASE_URL = 'http://192.168.1.37:3000/api';

    // Load read status from AsyncStorage
    const loadReadStatus = useCallback(async () => {
        try {
            const storedStatus = await AsyncStorage.getItem('notificationReadStatus');
            if (storedStatus) {
                setReadStatus(JSON.parse(storedStatus));
            }
        } catch (err) {
            console.error('AsyncStorage Load Error:', err.message);
        }
    }, []);

    // Save read status to AsyncStorage
    const saveReadStatus = useCallback(async (newStatus) => {
        try {
            await AsyncStorage.setItem('notificationReadStatus', JSON.stringify(newStatus));
        } catch (err) {
            console.error('AsyncStorage Save Error:', err.message);
        }
    }, []);

    // Debug logging
    useEffect(() => {
        // console.log('Notifications - Constants.expoConfig', Constants.expoConfig);
        // console.log('Notifications - API_BASE_URL', API_BASE_URL);
        loadReadStatus();
    }, [loadReadStatus]);

    // Function to fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!API_BASE_URL) {
            console.error('API base URL is not defined');
            setError('API base URL is not defined. Please check app.json configuration.');
            setIsLoading(false);
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications`, { timeout: 10000 });
            // console.log('Notifications API Response:', response.data);
            if (Array.isArray(response.data)) {
                const updatedNotifications = response.data.map(notif => ({
                    ...notif,
                    isRead: readStatus[notif.id] ?? notif.isRead ?? false,
                }));
                setNotifications(updatedNotifications);
                applySortAndFilter(updatedNotifications, sortOrder, filterType);
                setError(null);
            } else {
                console.error('Invalid API response format:', response.data);
                setError('Invalid response from server. Please try again.');
            }
        } catch (err) {
            console.error('Fetch Error:', err.message, err.code);
            setError('Failed to load notifications. Please check your network or server and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL, readStatus, sortOrder, filterType]);

    // Apply sorting and filtering
    const applySortAndFilter = (data, sort, filter) => {
        let filtered = [...data];
        if (filter === 'read') {
            filtered = filtered.filter(notif => notif.isRead);
        } else if (filter === 'unread') {
            filtered = filtered.filter(notif => !notif.isRead);
        }
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });
        setFilteredNotifications(filtered);
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
        if (!API_BASE_URL) {
            setError('API base URL is not defined.');
            setRefreshing(false);
            return;
        }
        setRefreshing(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications`, { timeout: 10000 });
            console.log('Refresh API Response:', response.data);
            if (Array.isArray(response.data)) {
                const updatedNotifications = response.data.map(notif => ({
                    ...notif,
                    isRead: readStatus[notif.id] ?? notif.isRead ?? false,
                }));
                setNotifications(updatedNotifications);
                applySortAndFilter(updatedNotifications, sortOrder, filterType);
                setError(null);
            } else {
                setError('Invalid response from server. Please try again.');
            }
        } catch (err) {
            console.error('Refresh Error:', err.message, err.code);
            setError('Failed to refresh notifications. Please try again.');
        } finally {
            setRefreshing(false);
        }
    }, [API_BASE_URL, readStatus, sortOrder, filterType]);

    // Mark notification as read
    const markAsRead = useCallback(
        async (notificationId) => {
            setReadStatus(prev => {
                const newStatus = { ...prev, [notificationId]: true };
                saveReadStatus(newStatus);
                return newStatus;
            });
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
            applySortAndFilter(
                notifications.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                ),
                sortOrder,
                filterType
            );
        },
        [notifications, sortOrder, filterType, saveReadStatus]
    );

    // Handle notification press
    const handleNotificationPress = (notification) => {
        setSelectedNotification(notification);
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        rbSheetRef.current?.open();
    };

    // Handle sort toggle
    const toggleSortOrder = () => {
        const newSortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
        setSortOrder(newSortOrder);
        applySortAndFilter(notifications, newSortOrder, filterType);
    };

    // Handle filter change
    const changeFilter = (newFilter) => {
        setFilterType(newFilter);
        applySortAndFilter(notifications, sortOrder, newFilter);
    };

    const renderNotificationItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
            onPress={() => handleNotificationPress(item)}
        >
            <LinearGradient
                colors={['#000', !item.isRead ? '#2B6BFD' : '#AEAED4']}
                start={{ x: 0.3, y: 0.6 }}
                end={{ x: 0, y: 0 }}
                style={styles.notificationBorder}
            >
                <View style={styles.notificationContent}>
                    <Ionicons
                        name={item.isRead ? 'mail-open-outline' : 'mail-outline'}
                        size={20}
                        color={item.isRead ? '#A0AEC0' : '#FFFFFF'}
                        style={styles.notificationIcon}
                    />
                    <View style={styles.notificationTextContainer}>
                        <Text style={styles.notificationTitle}>{item.title}</Text>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                            {item.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                            {moment(item.createdAt).fromNow()}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    if (isLoading && !refreshing) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2B6BFD" />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>

            </View>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
                    onPress={() => changeFilter('all')}
                >
                    <Text style={styles.filterText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filterType === 'read' && styles.activeFilter]}
                    onPress={() => changeFilter('read')}
                >
                    <Text style={styles.filterText}>Read</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filterType === 'unread' && styles.activeFilter]}
                    onPress={() => changeFilter('unread')}
                >
                    <Text style={styles.filterText}>Unread</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
                    <Ionicons
                        name={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color="#FFFFFF"
                    />
                    <Text style={styles.sortText}>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</Text>
                </TouchableOpacity>
            </View>
            {filteredNotifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={48} color="#A0AEC0" />
                    <Text style={styles.emptyText}>
                        {filterType === 'read'
                            ? 'No read notifications'
                            : filterType === 'unread'
                                ? 'No unread notifications'
                                : 'No notifications available'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredNotifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.notificationList}
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
            <RBSheet
                ref={rbSheetRef}
                height={350}
                openDuration={250}
                customStyles={{
                    container: {
                        backgroundColor: '#28282B',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 10,
                        paddingBottom: insets.bottom,
                    },
                }}
            >
                {selectedNotification && (
                    <View style={styles.sheetContainer}>
                        <Text style={styles.sheetTitle}>{selectedNotification.title}</Text>
                        <Text style={styles.sheetMessage}>{selectedNotification.message}</Text>
                        <Text style={styles.sheetTime}>
                            {moment(selectedNotification.createdAt).format('MMMM D, YYYY, h:mm A')}
                        </Text>
                        <TouchableOpacity
                            style={styles.sheetCloseButton}
                            onPress={() => rbSheetRef.current?.close()}
                        >
                            <Text style={styles.sheetCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </RBSheet>
        </View>
    );
};

export default Notifications;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        padding: 8,
    },
    backText: {
        color: '#2B6BFD',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    timeText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#000',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#3D4050',
    },
    activeFilter: {
        backgroundColor: '#2B6BFD',
    },
    filterText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#3D4050',
    },
    sortText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 4,
        fontFamily: 'Questrial-Regular',
    },
    notificationList: {
        padding: 16,
    },
    notificationItem: {
        marginBottom: 12,
    },
    unreadNotification: {
        opacity: 1,
    },
    notificationBorder: {
        borderRadius: 12,
        padding: 1,
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28282B',
        borderRadius: 12,
        padding: 16,
    },
    notificationIcon: {
        marginRight: 12,
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Questrial-Regular',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#A0AEC0',
        marginBottom: 4,
        fontFamily: 'Questrial-Regular',
    },
    notificationTime: {
        fontSize: 12,
        color: '#A0AEC0',
        fontFamily: 'Questrial-Regular',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Questrial-Regular',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#A0AEC0',
        fontSize: 16,
        marginTop: 8,
        fontFamily: 'Questrial-Regular',
    },
    sheetContainer: {
        flex: 1,
        padding: 16,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
        fontFamily: 'Questrial-Regular',
    },
    sheetMessage: {
        fontSize: 16,
        color: '#A0AEC0',
        lineHeight: 22,
        marginBottom: 12,
        fontFamily: 'Questrial-Regular',
    },
    sheetTime: {
        fontSize: 14,
        color: '#A0AEC0',
        marginBottom: 16,
        fontFamily: 'Questrial-Regular',
    },
    sheetCloseButton: {
        backgroundColor: '#2B6BFD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 'auto',
        alignItems: 'center',
    },
    sheetCloseText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
});