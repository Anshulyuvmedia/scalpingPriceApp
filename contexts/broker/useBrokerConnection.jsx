// contexts/broker/useBrokerConnection.jsx
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/contexts/UserContext';

export const useBrokerConnection = () => {
    const { appToken } = useUser();

    const [broker, setBroker] = useState(null);         // 'dhan' or null
    const [brokerToken, setBrokerToken] = useState(null); // Dhan JWT string
    const [loading, setLoading] = useState(true);        // Initial restore loading
    const [error, setError] = useState(null);

    const isConnected = !!broker && !!brokerToken;

    /* ==================== RESTORE FROM STORAGE ==================== */
    useEffect(() => {
        const restore = async () => {
            try {
                // console.log('🔄 Attempting to restore broker session from AsyncStorage...');

                const [savedBroker, savedToken] = await Promise.all([
                    AsyncStorage.getItem('broker'),
                    AsyncStorage.getItem('brokerToken')
                ]);

                // console.log('📥 Restored from storage:', {
                //     savedBroker,
                //     hasToken: !!savedToken,
                //     tokenLength: savedToken?.length || 0
                // });

                if (savedBroker && savedToken) {
                    // console.log('✅ Session restored successfully!');
                    setBroker(savedBroker);
                    setBrokerToken(savedToken);
                } else {
                    console.log('ℹ️ No saved broker session found.');
                }
            } catch (e) {
                console.error('❌ Broker restore failed:', e);
                setError('Failed to restore broker connection');
            } finally {
                setLoading(false);
                console.log('🏁 Restore phase completed. loading = false');
            }
        };

        restore();
    }, []); // Run only once on mount

    /* ==================== PERSIST TO STORAGE ==================== */
    useEffect(() => {
        const persist = async () => {
            try {
                if (broker && brokerToken) {
                    await AsyncStorage.multiSet([
                        ['broker', broker],
                        ['brokerToken', brokerToken]
                    ]);
                    // console.log('✅ Broker session successfully saved to AsyncStorage', {
                    //     broker,
                    //     tokenLength: brokerToken.length
                    // });
                } else {
                    // Only clear if we actually have something to remove (avoid unnecessary writes)
                    if (broker || brokerToken) {
                        await AsyncStorage.multiRemove(['broker', 'brokerToken']);
                        console.log('🗑️ Broker session cleared from AsyncStorage');
                    }
                }
            } catch (e) {
                console.error('❌ Failed to save broker session:', e);
                setError('Failed to save broker connection');
            }
        };

        // Small delay to batch rapid state changes (e.g., setBroker + setBrokerToken in same tick)
        const timeoutId = setTimeout(persist, 100);

        return () => clearTimeout(timeoutId);
    }, [broker, brokerToken]);

    /* ==================== DISCONNECT ==================== */
    const disconnectBroker = useCallback(async () => {
        console.log('🔌 disconnectBroker called');
        try {
            setBroker(null);
            setBrokerToken(null);
            setError(null);  // ← Also clear connection error
            await AsyncStorage.multiRemove(['broker', 'brokerToken']);
            console.log('✅ Broker fully disconnected and storage cleared');
        } catch (e) {
            console.error('❌ Disconnect failed:', e);
        }
    }, []);

    /* ==================== DEBUG: Current State Summary ==================== */
    // console.log('🔍 Current broker state:', {
    //     broker,
    //     isConnected,
    //     hasBrokerToken: !!brokerToken,
    //     tokenLength: brokerToken?.length || 0,
    //     loading,
    //     error
    // });

    return {
        broker,
        setBroker,
        brokerToken,
        setBrokerToken,
        appToken,

        isConnected,
        loading,
        error,
        setError,
        disconnectBroker,
    };
};