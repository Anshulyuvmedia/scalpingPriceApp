// contexts/broker/useBrokerTradebook.js
import { useState, useCallback, useRef, useEffect } from 'react';

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const useBrokerTradebook = ({ appToken, isConnected }) => {
    const [tradeDateRange, setTradeDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const [tradebookItems, setTradebookItems] = useState([]);
    const [tradebookPage, setTradebookPage] = useState(0);
    const [tradebookHasMore, setTradebookHasMore] = useState(true);
    const [tradebookLoading, setTradebookLoading] = useState(false);
    const [tradebookRefreshing, setTradebookRefreshing] = useState(false);

    const abortControllerRef = useRef(null);

    const fetchTradebookPage = useCallback(
        async (page = 0, isRefresh = false) => {
            if (!appToken || !isConnected) return;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                setTradebookLoading(true);
                setTradebookRefreshing(isRefresh);

                const res = await fetch(
                    `${BASE_URL}/api/BrokerConnections/tradebook?from=${tradeDateRange.from}&to=${tradeDateRange.to}&page=${page}`,
                    {
                        signal: controller.signal,
                        headers: { Authorization: `Bearer ${appToken}` },
                    }
                );

                if (!res.ok) throw new Error('Failed to load trades');

                const data = await res.json();
                const trades = (data.trades || [])
                    .filter((t) => t.exchangeTime)
                    .sort((a, b) => new Date(b.exchangeTime) - new Date(a.exchangeTime));

                trades.forEach((t, i) => {
                    t._id =
                        t._id ||
                        `${t.exchangeTime}-${t.tradedQty || t.tradedQuantity}-${t.tradedPrice}-${i}`;
                });

                setTradebookItems((prev) =>
                    isRefresh || page === 0 ? trades : [...prev, ...trades]
                );
                setTradebookHasMore(data.hasMore === true);
                setTradebookPage(page);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Tradebook error:', err);
                }
            } finally {
                setTradebookLoading(false);
                setTradebookRefreshing(false);
            }
        },
        [appToken, tradeDateRange.from, tradeDateRange.to, isConnected]
    );

    const loadMoreTradebook = useCallback(() => {
        if (!tradebookLoading && tradebookHasMore) {
            fetchTradebookPage(tradebookPage + 1);
        }
    }, [tradebookLoading, tradebookHasMore, tradebookPage, fetchTradebookPage]);

    const refreshTradebook = useCallback(() => {
        fetchTradebookPage(0, true);
    }, [fetchTradebookPage]);

    // Auto-load on date range change
    useEffect(() => {
        if (isConnected) {
            refreshTradebook();
        }
    }, [tradeDateRange.from, tradeDateRange.to, isConnected, refreshTradebook]);

    return {
        tradeDateRange,
        setTradeDateRange,
        tradebookItems,
        tradebookHasMore,
        tradebookLoading,
        tradebookRefreshing,
        loadMoreTradebook,
        refreshTradebook,
    };
};