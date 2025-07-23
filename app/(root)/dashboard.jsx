import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeHeader from '@/components/HomeHeader';
import { router } from 'expo-router';

const Dashboard = () => {
    const navigation = useNavigation();

    // Handle logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userSession');
            router.push('/(auth)');
        } catch (error) {
            console.error('Error clearing session:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
        }
    };

    // Handle navigation to different screens
    const navigateToScreen = (screenName) => {
        // Replace with actual screen names in your navigation stack
        navigation.navigate(screenName);
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Dashboard'} />

            <View style={styles.menuContainer}>

                {/* Navigation Buttons */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigateToScreen('algostrategybuilder')}
                    style={styles.menuButtonContainer}
                >
                    <View style={styles.menuButton}>
                        <Text style={styles.buttonText}>Algo Strategy Builder</Text>
                    </View>
                </TouchableOpacity>


                {/* Logout Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleLogout}
                    style={styles.menuButtonContainer}
                >
                    <View style={styles.menuButton}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'start',
        alignItems: 'start',
        paddingVertical: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: 'Questrial-Regular',
    },
    menuButtonContainer: {
        width: '100%',
        maxWidth: 400,
        marginBottom: 15,
    },
    buttonGradient: {
        borderRadius: 8,
        padding: 1,
    },
    menuButton: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 18,
        paddingBlock: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#191922',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Questrial-Regular',
    },
});