// contexts/BrokerContext/useTradebook.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePortfolio } from './usePortfolio';

const TradebookContext = createContext();

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const TradebookProvider = ({ children }) => {
    const { token } = useUser();
    const { isConnected } = usePortfolio();

    const [tradeDateRange, setTradeDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const [tradebookItems, setTradebookItems] = useState([]);
    const [tradebookPage, setTradebookPage] = useState(0);
    const [tradebookHasMore, setTradebookHasMore] = useState(true);
    const [tradebookLoading, setTradebookLoading] = useState(false);

    const abortControllerRef = useRef(null);

    const fetchTradebookPage = useCallback(async (page = 0, isRefresh = false) => {
        if (!token || !isConnected) return;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setTradebookLoading(true);
        try {
            const res = await fetch(
                `${BASE_URL}/api/BrokerConnections/tradebook?from=${tradeDateRange.from}&to=${tradeDateRange.to}&page=${page}`,
                {
                    signal: abortControllerRef.current.signal,
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error('Failed');

            const data = await res.json();
            const newItems = (data.trades || [])
                .filter(i => i.exchangeTime)
                .sort((a, b) => new Date(b.exchangeTime) - new Date(a.exchangeTime))
                .map((item, idx) => ({
                    ...item,
                    _id: item._id || `${item.exchangeTime}-${idx}`,
                }));

            setTradebookItems(prev => (isRefresh || page === 0) ? newItems : [...prev, ...newItems]);
            setTradebookHasMore(data.hasMore === true);
            setTradebookPage(page);
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Tradebook error:', err);
        } finally {
            setTradebookLoading(false);
        }
    }, [token, isConnected, tradeDateRange]);

    useEffect(() => {
        if (isConnected) {
            setTradebookItems([]);
            setTradebookPage(0);
            setTradebookHasMore(true);
            fetchTradebookPage(0, true);
        }
    }, [tradeDateRange.from, tradeDateRange.to, isConnected, fetchTradebookPage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const value = {
        tradeDateRange,
        setTradeDateRange,
        tradebookItems,
        tradebookHasMore,
        tradebookLoading,
        loadMoreTradebook: () => !tradebookLoading && tradebookHasMore && fetchTradebookPage(tradebookPage + 1),
        refreshTradebook: () => fetchTradebookPage(0, true),
    };

    return <TradebookContext.Provider value={value}>{children}</TradebookContext.Provider>;
};

export const useTradebook = () => useContext(TradebookContext);