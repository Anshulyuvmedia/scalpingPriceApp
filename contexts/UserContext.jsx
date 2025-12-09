// contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load session once on app start
    useEffect(() => {
        let isMounted = true;

        const loadSession = async () => {
            try {
                const [storedToken, storedUser, expiryStr] = await AsyncStorage.multiGet([
                    'userToken',
                    'userData',
                    'tokenExpiry',
                ]);

                const expiry = expiryStr ? parseInt(expiryStr, 10) : 0;

                // Validate session
                if (storedToken && storedUser && expiry > Date.now()) {
                    if (isMounted) {
                        setUser(JSON.parse(storedUser));
                        setToken(storedToken);
                    }
                } else {
                    // Expired or invalid → clean up
                    await AsyncStorage.multiRemove(['userToken', 'userData', 'tokenExpiry']);
                }
            } catch (err) {
                console.error('Failed to load session:', err);
                await AsyncStorage.multiRemove(['userToken', 'userData', 'tokenExpiry']);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    // Only hide splash when we're truly ready
                    await SplashScreen.hideAsync();
                }
            }
        };

        loadSession();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (userData, accessToken, ttl = 14 * 24 * 60 * 60 * 1000) => {
        try {
            const expiry = Date.now() + ttl;

            await AsyncStorage.multiSet([
                ['userToken', accessToken],
                ['userData', JSON.stringify(userData)],
                ['tokenExpiry', expiry.toString()],
                ['lastRoute', '(root)/(tabs)'],
            ]);

            setUser(userData);
            setToken(accessToken);

            // Navigate after state update
            router.replace('/(root)/(tabs)');
        } catch (error) {
            console.error('Login persistence failed:', error);
            Alert.alert('Login Error', 'Failed to save session. Please try again.');
        }
    };

    const logout = useCallback(async (reason = 'You have been logged out.') => {
        if (loading) return; // Prevent double navigation

        try {
            await AsyncStorage.multiRemove(['userToken', 'userData', 'tokenExpiry', 'lastRoute']);
            setUser(null);
            setToken(null);

            // Only navigate if not already on login
            const currentRoute = router.pathname || '';
            if (!currentRoute.includes('login')) {
                router.replace('/(auth)/login');
            }

            if (reason) {
                Alert.alert('Logged Out', reason);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            Alert.alert('Error', 'Failed to logout properly.');
        }
    }, [loading]);

    const value = {
        user,
        token,
        loading,
        login,
        logout,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};