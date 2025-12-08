// contexts/BrokerContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import io from 'socket.io-client';

const BrokerContext = createContext();

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const BrokerProvider = ({ children }) => {
    const { token } = useUser();

    // Portfolio & Live Data
    const [broker, setBroker] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [positions, setPositions] = useState([]);
    const [funds, setFunds] = useState(null);
    const [summary, setSummary] = useState({ totalInvestment: 0, currentValue: 0, totalPL: 0, overallPnLPercent: 0 });
    const [todayPnL, setTodayPnL] = useState({ todayTotalPL: 0, todayRealisedPL: 0, todayUnrealisedPL: 0 });
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState(null);

    // TradeBook Date Range
    const [tradeDateRange, setTradeDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    // TradeBook Pagination State
    const [tradebookItems, setTradebookItems] = useState([]);
    const [tradebookPage, setTradebookPage] = useState(0);
    const [tradebookHasMore, setTradebookHasMore] = useState(true);
    const [tradebookLoading, setTradebookLoading] = useState(false);
    const [tradebookRefreshing, setTradebookRefreshing] = useState(false);

    const socketRef = useRef(null);
    const livePricesRef = useRef({});
    const abortControllerRef = useRef();
    const isConnected = !!broker;
    // ──────────────────────────────
    // Portfolio & Live Price Logic
    // ──────────────────────────────
    const applyLivePrice = (item, quote) => {
        const ltp = quote?.ltp ?? item.ltp;
        const qty = Math.abs(Number(item.netQty || item.qty || item.holdingQuantity || 0));
        const avg = Number(item.buyAvg || item.avgCostPrice || 0);
        const current = ltp * qty;
        const investment = avg * qty;
        const unrealisedPL = current - investment;

        return {
            ...item,
            ltp,
            change: quote?.change || 0,
            changePercent: quote?.changePercent || 0,
            current,
            investment,
            profitLoss: unrealisedPL + Number(item.realizedProfit || item.realizedProfitLoss || 0),
            unrealisedPL,
        };
    };

    const recalculateSummary = () => {
        const items = [...holdings, ...positions];
        const totalInvestment = items.reduce((s, i) => s + (i.investment || 0), 0);
        const currentValue = items.reduce((s, i) => s + (i.current || 0), 0);
        const totalPL = currentValue - totalInvestment;
        const pct = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

        setSummary({
            totalInvestment: Number(totalInvestment.toFixed(2)),
            currentValue: Number(currentValue.toFixed(2)),
            totalPL: Number(totalPL.toFixed(2)),
            overallPnLPercent: Number(pct.toFixed(2)),
        });
    };

    const fetchInitialData = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };

            const [profileRes, summaryRes, fundsRes, todayPnlRes] = await Promise.all([
                fetch(`${BASE_URL}/api/BrokerConnections/profile`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/portfolio-summary`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/funds`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/today-pnl`, { headers })
            ]);

            if (!profileRes.ok) throw new Error("Not connected to Dhan");

            const [profile, summary, funds, todayPnL] = await Promise.all([
                profileRes.json(), summaryRes.json(), fundsRes.json(), todayPnlRes.json()
            ]);

            setBroker({ name: `Dhan • ${profile.dhanClientId}`, broker: 'dhan', clientId: profile.dhanClientId });
            setFunds(funds);
            setSummary(summary);
            setTodayPnL(todayPnL);

            const [holdingsRes, positionsRes] = await Promise.all([
                fetch(`${BASE_URL}/api/BrokerConnections/holdings`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/positions`, { headers })
            ]);

            const rawHoldings = await holdingsRes.json();
            const rawPositions = await positionsRes.json();

            setHoldings(rawHoldings.map(h => applyLivePrice(h, livePricesRef.current[h.securityId || h.isin])));
            setPositions(rawPositions.map(p => applyLivePrice(p, livePricesRef.current[p.securityId])));
            setPortfolio([...rawHoldings, ...rawPositions]);
            setLastSync(new Date().toLocaleTimeString('en-IN'));

            startWebSocket();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const startWebSocket = async () => {
        if (!token || socketRef.current?.connected) return;

        await fetch(`${BASE_URL}/api/BrokerConnections/start-live-feed`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });

        socketRef.current = io(BASE_URL, { query: { token }, transports: ['websocket'] });

        socketRef.current.on('connect', () => {
            setIsLive(true);
            const symbols = [...holdings, ...positions]
                .map(i => i.securityId || i.isin)
                .filter(Boolean);
            if (symbols.length > 0) {
                socketRef.current.emit('market', { type: 'SUBSCRIBE', symbols });
            }
        });

        socketRef.current.on('market', (msg) => {
            if (msg.type === 'LIVE_QUOTE' && msg.data) {
                const { securityId, ltp, change, changePercent } = msg.data;
                livePricesRef.current[securityId] = { ltp: Number(ltp), change: Number(change), changePercent: Number(changePercent) };

                setHoldings(prev => prev.map(h => (h.id == securityId) ? applyLivePrice(h, livePricesRef.current[securityId]) : h));
                setPositions(prev => prev.map(p => (p.id == securityId) ? applyLivePrice(p, livePricesRef.current[securityId]) : p));
                recalculateSummary();
            }
        });

        socketRef.current.on('disconnect', () => setIsLive(false));
    };

    const refreshPortfolio = () => {
        livePricesRef.current = {};
        fetchInitialData();
    };

    // ──────────────────────────────
    // TradeBook Pagination Fetcher
    // ──────────────────────────────
    const fetchTradebookPage = useCallback(async (page = 0, isRefresh = false) => {
        if (!token || !isConnected) return;
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            setTradebookLoading(true);
            setTradebookRefreshing(isRefresh);

            const res = await fetch(
                `${BASE_URL}/api/BrokerConnections/tradebook?from=${tradeDateRange.from}&to=${tradeDateRange.to}&page=${page}`,
                { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error('Failed to fetch tradebook');

            const data = await res.json();

            // ONLY TRADES – NO LEDGER
            const newItems = (data.trades || [])
                .filter(i => i.exchangeTime)
                .sort((a, b) => new Date(b.exchangeTime) - new Date(a.exchangeTime));

            // Add unique _id if backend didn’t already (safety)
            newItems.forEach((item, idx) => {
                item._id = item._id || `${item.exchangeTime}-${item.tradedQuantity}-${item.tradedPrice}-${idx}`;
            });

            setTradebookItems(prev => isRefresh || page === 0 ? newItems : [...prev, ...newItems]);
            setTradebookHasMore(data.hasMore === true);
            setTradebookPage(page);
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Tradebook fetch error:', err);
        } finally {
            setTradebookLoading(false);
            setTradebookRefreshing(false);
        }
    }, [token, tradeDateRange.from, tradeDateRange.to, isConnected]);

    const loadMoreTradebook = () => {
        if (!tradebookLoading && tradebookHasMore) {
            fetchTradebookPage(tradebookPage + 1);
        }
    };

    const refreshTradebook = () => {
        fetchTradebookPage(0, true);
    };

    // ──────────────────────────────
    // Order History by Security ID (for per-stock history)
    // ──────────────────────────────
    const fetchOrderHistoryBySecurityId = useCallback(async (securityId, fy) => {
        if (!token || !isConnected || !securityId) {
            return [];
        }

        const headers = { Authorization: `Bearer ${token}` };
        let url = `${BASE_URL}/api/BrokerConnections/order-history-by-security?securityId=${securityId}`;
        if (fy) {
            url += `&fy=${encodeURIComponent(fy)}`;
        }
        const res = await fetch(url, { headers });

        if (!res.ok) {
            throw new Error(`Failed to fetch trades: ${res.status}`);
        }

        return await res.json();
    }, [token, isConnected]);

    // Reset tradebook when date changes
    useEffect(() => {
        if (isConnected) {
            setTradebookItems([]);
            setTradebookPage(0);
            setTradebookHasMore(true);
            fetchTradebookPage(0, true);
        }
    }, [tradeDateRange.from, tradeDateRange.to, isConnected]);

    // Initial load
    useEffect(() => {
        if (token) {
            fetchInitialData();
        } else {
            setBroker(null);
            setPortfolio([]);
            setIsLive(false);
            if (socketRef.current) socketRef.current.close();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [token]);

    return (
        <BrokerContext.Provider value={{
            // Portfolio
            broker,
            portfolio,
            holdings,
            positions,
            funds,
            summary,
            todayPnL,
            loading,
            lastSync,
            error,
            isConnected: !!broker,
            isLive,
            refreshPortfolio,

            // TradeBook
            tradeDateRange,
            setTradeDateRange,
            tradebookItems,
            tradebookHasMore,
            tradebookLoading,
            tradebookRefreshing,
            loadMoreTradebook,
            refreshTradebook,

            fetchOrderHistoryBySecurityId,
        }}>
            {children}
        </BrokerContext.Provider>
    );
};

export const useBroker = () => useContext(BrokerContext);