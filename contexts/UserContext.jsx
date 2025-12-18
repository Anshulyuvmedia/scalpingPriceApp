// contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const UserContext = createContext();

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used inside UserProvider');
    return ctx;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [appToken, setAppToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const entries = await AsyncStorage.multiGet([
                    'userToken',
                    'userData',
                    'tokenExpiry',
                ]);

                const token = entries[0][1];
                const userData = entries[1][1];
                const expiry = entries[2][1];

                const isValid =
                    token &&
                    userData &&
                    expiry &&
                    parseInt(expiry, 10) > Date.now();

                if (isValid) {
                    setAppToken(token);
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setLoading(false);
                await SplashScreen.hideAsync();
            }
        };

        loadSession();
    }, []);

    const login = async (userData, token, ttl = 14 * 24 * 60 * 60 * 1000) => {
        const expiry = Date.now() + ttl;

        await AsyncStorage.multiSet([
            ['userToken', token],
            ['userData', JSON.stringify(userData)],
            ['tokenExpiry', expiry.toString()],
        ]);

        setAppToken(token);
        setUser(userData);
        return true;
    };

    const logout = async () => {
        await AsyncStorage.multiRemove(['userToken', 'userData', 'tokenExpiry', 'lastRoute']);
        setAppToken(null);
        setUser(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                userId: user?.id || null,
                appToken,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
