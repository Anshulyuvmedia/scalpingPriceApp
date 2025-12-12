// contexts/BrokerContext.js
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import { useUser } from '@/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const BrokerContext = createContext();

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const BrokerProvider = ({ children }) => {
    const { appToken } = useUser(); // IMPORTANT: This is now used for backend fetches

    const [brokerToken, setBrokerToken] = useState(null);

    // Portfolio state
    const [broker, setBroker] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [positions, setPositions] = useState([]);
    const [funds, setFunds] = useState(null);
    const [summary, setSummary] = useState({
        totalInvestment: 0,
        currentValue: 0,
        totalPL: 0,
        overallPnLPercent: 0,
    });
    const [todayPnL, setTodayPnL] = useState({
        todayTotalPL: 0,
        todayRealisedPL: 0,
        todayUnrealisedPL: 0,
    });

    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState(null);

    // TradeBook
    const [tradeDateRange, setTradeDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const [tradebookItems, setTradebookItems] = useState([]);
    const [tradebookPage, setTradebookPage] = useState(0);
    const [tradebookHasMore, setTradebookHasMore] = useState(true);
    const [tradebookLoading, setTradebookLoading] = useState(false);
    const [tradebookRefreshing, setTradebookRefreshing] = useState(false);

    // Refs
    const socketRef = useRef(null);
    const livePricesRef = useRef({});
    const abortControllerRef = useRef(null);

    const isConnected = !!broker;

    // -------------------------------------------------
    // Local Helpers
    // -------------------------------------------------
    const applyLivePrice = (item, quote) => {
        const ltp = quote?.ltp ?? item.ltp ?? 0;
        const qty = Math.abs(
            Number(item.netQty || item.qty || item.holdingQuantity || 0)
        );
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
            profitLoss:
                unrealisedPL +
                Number(item.realizedProfit || item.realizedProfitLoss || 0),
            unrealisedPL,
        };
    };

    const recalculateSummary = useCallback(() => {
        const items = [...holdings, ...positions];
        const totalInvestment = items.reduce(
            (sum, i) => sum + (i.investment || 0),
            0
        );
        const currentValue = items.reduce(
            (sum, i) => sum + (i.current || 0),
            0
        );
        const totalPL = currentValue - totalInvestment;
        const overallPnLPercent =
            totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

        setSummary({
            totalInvestment: Number(totalInvestment.toFixed(2)),
            currentValue: Number(currentValue.toFixed(2)),
            totalPL: Number(totalPL.toFixed(2)),
            overallPnLPercent: Number(overallPnLPercent.toFixed(2)),
        });
    }, [holdings, positions]);

    // -------------------------------------------------
    // Local Token Persistence (BrokerToken)
    // -------------------------------------------------
    useEffect(() => {
        AsyncStorage.getItem('brokerToken')
            .then((token) => token && setBrokerToken(token))
            .catch(console.warn);
    }, []);

    useEffect(() => {
        if (brokerToken) {
            AsyncStorage.setItem('brokerToken', brokerToken);
        } else {
            AsyncStorage.removeItem('brokerToken');
        }
    }, [brokerToken]);

    // -------------------------------------------------
    // Fetch Initial Portfolio Data
    // -------------------------------------------------
    const fetchInitialData = useCallback(async () => {
        if (!appToken) {
            setBroker(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // ❗ NOW USING appToken here — very important
            const headers = { Authorization: `Bearer ${appToken}` };

            const [
                profileRes,
                summaryRes,
                fundsRes,
                todayPnlRes,
            ] = await Promise.all([
                fetch(`${BASE_URL}/api/BrokerConnections/profile`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/portfolio-summary`, {
                    headers,
                }),
                fetch(`${BASE_URL}/api/BrokerConnections/funds`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/today-pnl`, {
                    headers,
                }),
            ]);

            if (!profileRes.ok) throw new Error('Broker not connected');

            const [profile, summary, funds, todayPnL] = await Promise.all([
                profileRes.json(),
                summaryRes.json(),
                fundsRes.json(),
                todayPnlRes.json(),
            ]);

            setBroker({
                name: `Dhan • ${profile.dhanClientId}`,
                broker: 'dhan',
                clientId: profile.dhanClientId,
            });

            setFunds(funds);
            setSummary(summary);
            setTodayPnL(todayPnL);

            const [holdingsRes, positionsRes] = await Promise.all([
                fetch(`${BASE_URL}/api/BrokerConnections/holdings`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/positions`, {
                    headers,
                }),
            ]);

            const rawHoldings = await holdingsRes.json();
            const rawPositions = await positionsRes.json();

            const updatedHoldings = rawHoldings.map((h) =>
                applyLivePrice(
                    h,
                    livePricesRef.current[h.securityId || h.isin]
                )
            );
            const updatedPositions = rawPositions.map((p) =>
                applyLivePrice(p, livePricesRef.current[p.securityId])
            );

            setHoldings(updatedHoldings);
            setPositions(updatedPositions);
            setPortfolio([...rawHoldings, ...rawPositions]);
            setLastSync(new Date().toLocaleTimeString('en-IN'));

            startWebSocket();
        } catch (err) {
            console.error('Broker fetch failed:', err);
            setError(err.message);
            setBroker(null);
        } finally {
            setLoading(false);
        }
    }, [appToken]);

    // -------------------------------------------------
    // WebSocket Live Price Connection
    // -------------------------------------------------
    const startWebSocket = useCallback(() => {
        if (!brokerToken || socketRef.current?.connected) return;

        socketRef.current = io(BASE_URL, {
            query: { appToken }, // backend checks appToken, not brokerToken
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 20000,
        });

        socketRef.current.on('connect', () => {
            setIsLive(true);
            const symbols = [...holdings, ...positions]
                .map((i) => i.securityId || i.isin)
                .filter(Boolean)
                .slice(0, 100);

            if (symbols.length > 0) {
                socketRef.current.emit('market', {
                    type: 'SUBSCRIBE',
                    symbols,
                });
            }
        });

        socketRef.current.on('market', (msg) => {
            if (msg.type !== 'LIVE_QUOTE' || !msg.data) return;

            const { securityId, ltp, change, changePercent } = msg.data;
            const quote = {
                ltp: Number(ltp),
                change: Number(change),
                changePercent: Number(changePercent),
            };
            livePricesRef.current[securityId] = quote;

            setHoldings((prev) =>
                prev.map((item) =>
                    (item.securityId || item.isin) === securityId
                        ? applyLivePrice(item, quote)
                        : item
                )
            );
            setPositions((prev) =>
                prev.map((item) =>
                    item.securityId === securityId
                        ? applyLivePrice(item, quote)
                        : item
                )
            );

            recalculateSummary();
        });

        socketRef.current.on('disconnect', () => setIsLive(false));
    }, [appToken, brokerToken, holdings, positions, recalculateSummary]);

    const refreshPortfolio = useCallback(() => {
        livePricesRef.current = {};
        fetchInitialData();
    }, [fetchInitialData]);

    // -------------------------------------------------
    // TradeBook
    // -------------------------------------------------
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
                    .sort(
                        (a, b) =>
                            new Date(b.exchangeTime) - new Date(a.exchangeTime)
                    );

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

    // -------------------------------------------------
    // Effects
    // -------------------------------------------------
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (isConnected) {
            fetchTradebookPage(0, true);
        }
    }, [tradeDateRange.from, tradeDateRange.to, isConnected]);

    useEffect(() => {
        return () => {
            socketRef.current?.close();
            abortControllerRef.current?.abort();
        };
    }, []);

    // -------------------------------------------------
    // Utils
    // -------------------------------------------------
    const fetchOrderHistoryBySecurityId = useCallback(
        async (securityId, fy) => {
            if (!appToken || !securityId) return [];

            try {
                const headers = { Authorization: `Bearer ${appToken}` };
                let url = `${BASE_URL}/api/BrokerConnections/order-history-by-security?securityId=${securityId}`;
                if (fy) url += `&fy=${encodeURIComponent(fy)}`;

                const res = await fetch(url, { headers });
                if (!res.ok) {
                    console.warn(
                        `Order history fetch failed: ${res.status}`
                    );
                    return [];
                }
                return await res.json();
            } catch (err) {
                console.error(
                    'fetchOrderHistoryBySecurityId error:',
                    err
                );
                return [];
            }
        },
        [appToken]
    );

    return (
        <BrokerContext.Provider
            value={{
                // Core
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
                isConnected,
                isLive,
                refreshPortfolio,

                // TradeBook
                tradeDateRange,
                setTradeDateRange,
                tradebookItems,
                tradebookHasMore,
                tradebookLoading,
                tradebookRefreshing,
                loadMoreTradebook: () =>
                    !tradebookLoading &&
                    tradebookHasMore &&
                    fetchTradebookPage(tradebookPage + 1),
                refreshTradebook: () => fetchTradebookPage(0, true),

                // OAuth
                setBrokerToken,
                brokerToken,

                // Utils
                fetchOrderHistoryBySecurityId,
            }}
        >
            {children}
        </BrokerContext.Provider>
    );
};

export const useBroker = () => {
    const context = useContext(BrokerContext);
    if (!context)
        throw new Error('useBroker must be used within BrokerProvider');
    return context;
};
