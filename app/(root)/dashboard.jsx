import HomeHeader from '@/components/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = Math.min(width * 0.9, 400);
const API_BASE_URL = 'http://192.168.1.50:3000/api';

const menuItems = [
    // { name: 'Algo Builder', route: 'algobuilder', icon: 'rocket' },
    // { name: 'Detailed Metrics', route: 'detailedmatrics', icon: 'chart-bar' },
    // { name: 'Strategy Backtesting', route: 'strategybacktesting', icon: 'history' },
    // { name: 'AI Generated Trade', route: 'aigeneratedtrade', icon: 'robot' },
    { name: 'Settings', route: 'settings', icon: 'robot' },
];

const MenuButton = ({ item, onPress, isLogout = false }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value) }],
    }));

    return (
        <Animated.View style={[styles.menuButtonContainer, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPressIn={() => (scale.value = 0.95)}
                onPressOut={() => (scale.value = 1)}
                onPress={onPress}
                style={styles.touchable}
                accessibilityLabel={item.name}
            >
                <LinearGradient
                    colors={isLogout ? ['#FF4E50', '#F70808'] : ['#000', '#666666']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.buttonBorder}
                >
                    <LinearGradient
                        colors={isLogout ? ['#FF4E50', '#F70808'] : ['#191922', '#000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <View style={styles.menuButton}>
                            <MaterialCommunityIcons
                                name={isLogout ? 'logout' : item.icon}
                                size={24}
                                color={isLogout ? '#fff' : '#05FF93'}
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>{isLogout ? 'Logout' : item.name}</Text>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const Dashboard = () => {
    // Handle logout
    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                await axios.post(
                    `${API_BASE_URL}/TdUsers/logout`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
                );
            }
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('lastRoute');
            await AsyncStorage.removeItem('tokenExpiry');
            Alert.alert('Success', 'Logged out successfully');
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', JSON.stringify(error.response?.data || error.message, null, 2));
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to log out. Please try again.');
        }
    };

    // Handle navigation to different screens
    const navigateToScreen = (screenName) => {
        Haptics.trigger('impactLight');
        router.push(`/${screenName}`);
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Menu'} />
            <View style={styles.content}>
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <MenuButton
                            key={index}
                            item={item}
                            onPress={() => navigateToScreen(item.route)}
                        />
                    ))}
                    <MenuButton
                        item={{ name: 'Logout' }}
                        onPress={handleLogout}
                        isLogout={true}
                    />
                </View>
            </View>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 10,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    menuContainer: {
        width: '100%',
        maxWidth: BUTTON_WIDTH,
        alignItems: 'center',
    },
    menuButtonContainer: {
        width: '100%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    touchable: {
        width: '100%',
    },
    buttonGradient: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonBorder: {
        borderRadius: 16,
        overflow: 'hidden',
        padding: 1,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Sora-SemiBold',
    },
});