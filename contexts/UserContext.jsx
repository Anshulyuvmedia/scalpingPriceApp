// contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// 1. Create Context
export const UserContext = createContext();

// 2. Custom Hook — THIS WAS MISSING!
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// 3. Provider
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('userData');
                const expiry = await AsyncStorage.getItem('tokenExpiry');
                const expiryDate = expiry ? parseInt(expiry, 10) : 0;

                if (storedToken && storedUser && expiryDate > Date.now()) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                } else {
                    await logout(expiryDate ? 'Session expired. Please login again.' : undefined);
                }
            } catch (err) {
                console.error('Error loading session:', err);
                await logout('Failed to load session.');
            } finally {
                setLoading(false);
                await SplashScreen.hideAsync();
            }
        };

        loadSession();
    }, []);

    const login = async (userData, token, ttl = 14 * 24 * 60 * 60 * 1000) => {
        try {
            const expiry = Date.now() + ttl;
            await AsyncStorage.multiSet([
                ['userToken', token],
                ['userData', JSON.stringify(userData)],
                ['tokenExpiry', expiry.toString()],
                ['lastRoute', '(root)/(tabs)'],
            ]);
            setUser(userData);
            setToken(token);
            router.replace('/(root)/(tabs)');
        } catch (error) {
            console.error('Login save error:', error);
            Alert.alert('Error', 'Failed to save login session.');
        }
    };

    const logout = async (reason) => {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userData', 'tokenExpiry', 'lastRoute']);
            setUser(null);
            setToken(null);
            router.replace('/(auth)/login');
            if (reason) Alert.alert('Logged Out', reason);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};