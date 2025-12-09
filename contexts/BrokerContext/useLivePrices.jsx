// contexts/BrokerContext/useLivePrices.js
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePortfolio } from './usePortfolio';
import io from 'socket.io-client';

const LivePricesContext = createContext();

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const LivePricesProvider = ({ children }) => {
    const { token } = useUser();
    const { holdings, positions } = usePortfolio();

    const socketRef = useRef(null);
    const livePricesRef = useRef({});
    const subscribedRef = useRef(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!token) {
            // Cleanup on logout
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            livePricesRef.current = {};
            subscribedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        // Start feed once
        fetch(`${BASE_URL}/api/BrokerConnections/start-live-feed`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => { });

        // Create socket only once
        if (!socketRef.current) {
            socketRef.current = io(BASE_URL, {
                query: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 10,
                forceNew: true,
            });

            socketRef.current.on('connect', () => {
                console.log('Live prices connected');
                subscribedRef.current = false;
            });

            socketRef.current.on('market', (msg) => {
                if (msg.type === 'LIVE_QUOTE' && msg.data?.securityId) {
                    const id = String(msg.data.securityId);
                    livePricesRef.current[id] = {
                        ltp: Number(msg.data.ltp),
                        change: Number(msg.data.change ?? 0),
                        changePercent: Number(msg.data.changePercent ?? 0),
                    };
                }
            });
        }

        // Subscribe logic
        const subscribe = () => {
            if (subscribedRef.current || !socketRef.current?.connected) return;

            const symbols = [...new Set(
                [...holdings, ...positions]
                    .map(i => i.securityId || i.isin)
                    .filter(Boolean)
                    .map(String)
            )];

            if (symbols.length > 0) {
                socketRef.current.emit('market', { type: 'SUBSCRIBE', symbols });
                console.log(`Subscribed to ${symbols.length} symbols`);
                subscribedRef.current = true;
            }
        };

        subscribe();
        intervalRef.current = setInterval(subscribe, 5000);

        // Full cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.close();
                socketRef.current = null;
            }
            livePricesRef.current = {};
            subscribedRef.current = false;
        };
    }, [token, holdings, positions]);

    return (
        <LivePricesContext.Provider value={{
            isLive: !!socketRef.current?.connected,
            livePrices: livePricesRef.current,
        }}>
            {children}
        </LivePricesContext.Provider>
    );
};

export const useLivePrices = () => useContext(LivePricesContext);