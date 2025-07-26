import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'react-native-haptic-feedback';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = Math.min(width * 0.9, 400);

const menuItems = [
    { name: 'Algo Strategy Builder', route: 'algostrategybuilder', icon: 'cog' },
    { name: 'Algo Dashboard', route: 'algodashboard', icon: 'chart-line' },
    { name: 'FOX Strategy Builder', route: 'foxstrategybuilder', icon: 'rocket' },
    { name: 'Detailed Metrics', route: 'detailedmatrics', icon: 'chart-bar' },
    { name: 'Strategy Backtesting', route: 'strategybacktesting', icon: 'history' },
    { name: 'AI Generated Trade', route: 'aigeneratedtrade', icon: 'robot' },
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
            await AsyncStorage.removeItem('userSession');
            Haptics.trigger('impactMedium');
            router.push('/(auth)/login');
        } catch (error) {
            console.error('Error clearing session:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
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
        // paddingHorizontal: 16,
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