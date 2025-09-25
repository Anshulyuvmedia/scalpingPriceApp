// contexts/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

export const UserContext = createContext();

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
                const expiryDate = expiry && !isNaN(parseInt(expiry)) ? parseInt(expiry) : 0;

                if (storedToken && storedUser && expiryDate && Date.now() < expiryDate) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                    // console.log('userData', storedUser, 'token', storedToken);

                } else {
                    await logout(expiryDate ? "Your session has expired. Please log in again." : undefined);
                }
            } catch (err) {
                console.error("Error loading session:", err);
                await logout("Failed to load session. Please log in again.");
            } finally {
                setLoading(false);
                SplashScreen.hideAsync();
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
                ['lastRoute', '(root)/(tabs)']
            ]);
            setUser(userData);
            setToken(token);
            router.replace('/(root)/(tabs)');
        } catch (error) {
            console.error('Error saving session:', error);
            Alert.alert('Error', 'Failed to save session. Please try again.');
        }
    };

    const logout = async (reason) => {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userData', 'tokenExpiry', 'lastRoute']);
            setUser(null);
            setToken(null);
            router.replace('/(auth)/login');
            if (reason) {
                Alert.alert("Session Ended", reason);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to clear session. Please try again.');
        }
    };

    return (
        <UserContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};