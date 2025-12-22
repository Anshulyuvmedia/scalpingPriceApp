// contexts/broker/useBrokerPortfolio.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const useBrokerPortfolio = (connection) => {
    const { appToken, broker, isConnected, disconnectBroker } = connection;
    const { user } = useUser();
    const [profile, setProfile] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    // Raw data from API
    const [rawHoldings, setRawHoldings] = useState([]);
    const [rawPositions, setRawPositions] = useState([]);

    // Enriched data
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
    const [lastSync, setLastSync] = useState(null);
    const [isLive, setIsLive] = useState(false);

    const livePricesRef = useRef({});
    const pollIntervalRef = useRef(null);

    const applyLivePrice = useCallback((item, quote) => {
        const ltp = quote?.ltp ?? item.ltp ?? 0;
        const qty = Math.abs(Number(item.netQty || item.qty || item.holdingQuantity || 0));
        const avg = Number(item.buyAvg || item.avgCostPrice || item.costPrice || 0);
        const currentValue = ltp * qty;
        const investment = avg * qty;
        const unrealisedPL = currentValue - investment;
        const realisedPL = Number(item.realizedProfit || item.realizedProfitLoss || 0);

        return {
            ...item,
            ltp,
            currentValue,
            investment,
            unrealisedPL,
            profitLoss: unrealisedPL + realisedPL,
            profitLossPercent: investment > 0 ? (unrealisedPL / investment) * 100 : 0,
            change: quote?.change || 0,
            changePercent: quote?.changePercent || 0,
            isLive: !!quote,
        };
    }, []);

    const recalculateSummary = useCallback(() => {
        const items = [...holdings, ...positions];
        const totalInvestment = items.reduce((sum, i) => sum + (i.investment || 0), 0);
        const currentValue = items.reduce((sum, i) => sum + (i.currentValue || 0), 0);
        const totalPL = currentValue - totalInvestment;
        const overallPnLPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

        setSummary({
            totalInvestment: Number(totalInvestment.toFixed(2)),
            currentValue: Number(currentValue.toFixed(2)),
            totalPL: Number(totalPL.toFixed(2)),
            overallPnLPercent: Number(overallPnLPercent.toFixed(2)),
        });
    }, [holdings, positions]);

    // Helper to safely convert data to array
    const toSafeArray = (data) => (Array.isArray(data) ? data : []);

    // Fetch all initial broker data
    const fetchInitialData = useCallback(async (attempt = 1, maxAttempts = 4) => {
        if (!appToken || !isConnected) {
            setInitialLoading(false);
            return;
        }
        let profileRes;
        let summaryRes;
        let fundsRes;
        let todayPnlRes;
        let holdingsRes;
        let positionsRes;

        try {
            // Only show loading spinner on first attempt
            if (attempt === 1) setInitialLoading(true);
            setRefreshing(attempt > 1);
            setError(null);

            const headers = { Authorization: `Bearer ${appToken}` };

            const [
                profileRes,
                summaryRes,
                fundsRes,
                todayPnlRes,
                holdingsRes,
                positionsRes,
            ] = await Promise.all([
                fetch(`${BASE_URL}/api/BrokerConnections/profile`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/portfolio-summary`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/funds`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/today-pnl`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/holdings`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/positions`, { headers }),
            ]);

            // Now profileRes is available below
            if (!profileRes.ok) {
                const text = await profileRes.text();
                if (profileRes.status === 401) {
                    throw new Error('AUTH_FAILED_401');  // ← Best way: throw custom error
                }
                throw new Error(`Profile sync failed: ${profileRes.status} ${text}`);
            }
            // console.log('profile', profileRes.data);
            const profile = await profileRes.json();
            setProfile(profile);
            
            // Helper to safely get JSON or fallback
            const safeJson = async (res) => {
                if (!res.ok) {
                    if (res.status === 404) return null; // treat 404 as empty
                    const text = await res.text();
                    throw new Error(`${res.status}: ${text}`);
                }
                return res.json();
            };

            const [
                summaryData,
                fundsData,
                todayPnLData,
                rawHoldingsData,
                rawPositionsData,
            ] = await Promise.all([
                safeJson(summaryRes).catch(() => ({})),
                safeJson(fundsRes).catch(() => null),
                safeJson(todayPnlRes).catch(() => ({ todayTotalPL: 0, todayRealisedPL: 0, todayUnrealisedPL: 0 })),
                safeJson(holdingsRes).catch(() => []),
                safeJson(positionsRes).catch(() => []),
            ]);

            setFunds(fundsData);
            setSummary(summaryData || {
                totalInvestment: 0,
                currentValue: 0,
                totalPL: 0,
                overallPnLPercent: 0,
            });
            setTodayPnL(todayPnLData);

            const safeHoldings = toSafeArray(rawHoldingsData);
            const safePositions = toSafeArray(rawPositionsData);

            setRawHoldings(safeHoldings);
            setRawPositions(safePositions);

            // Enrich with any cached live prices
            const enrichedHoldings = safeHoldings.map(h =>
                applyLivePrice(h, livePricesRef.current[h.securityId || h.isin])
            );
            const enrichedPositions = safePositions.map(p =>
                applyLivePrice(p, livePricesRef.current[p.securityId])
            );

            setHoldings(enrichedHoldings);
            setPositions(enrichedPositions);
            setLastSync(new Date().toLocaleTimeString('en-IN'));

            // console.log('Portfolio synced successfully', {
            //     holdings: safeHoldings.length,
            //     positions: safePositions.length,
            //     attempt,
            // });

        } catch (err) {
            console.warn(`Portfolio sync attempt ${attempt} failed:`, err);
            console.log('🔍 Full error object:', err);  // <--- IMPORTANT
            console.log('Error message:', err.message);
            console.log('Error name:', err.name);

            let isAuthError = false;

            // Check if profile response caused it
            if (profileRes && profileRes.status === 401) {
                console.log('🚨 Profile response status 401 detected directly');
                isAuthError = true;
            }

            if (err.message === 'AUTH_FAILED_401') {
                console.log('🚨 AUTH_FAILED_401 custom error caught');
                isAuthError = true;
            } else if (err.message?.includes('401')) {
                console.log('🚨 401 found in error message');
                isAuthError = true;
            } else if (err.message?.includes('Profile sync failed')) {
                console.log('🚨 Profile sync failed message detected');
                isAuthError = true;
            }

            console.log('Final isAuthError decision:', isAuthError);

            if (attempt < maxAttempts) {
                const delay = Math.min(1000 * 2 ** (attempt - 1), 8000); // 1s → 2s → 4s → 8s
                await new Promise(res => setTimeout(res, delay));
                return fetchInitialData(attempt + 1, maxAttempts);
            } else {
                console.error('All portfolio sync attempts failed');

                if (isAuthError) {
                    console.log('🔥 TRIGGERING DISCONNECT DUE TO AUTH FAILURE');
                    disconnectBroker?.();
                    console.log('Setting error to BROKER_EXPIRED');
                    setError('BROKER_EXPIRED');
                } else {
                    console.log('Setting generic error');
                    setError('Unable to sync portfolio. Please try again later.');
                }
            }
        } finally {
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, [appToken, isConnected, setError, applyLivePrice]);

    // Start live feed
    const startLiveFeed = useCallback(async () => {
        if (!appToken || !broker?.clientId) return;

        try {
            const res = await fetch(
                `${BASE_URL}/api/DhanInstruments/user/${broker.clientId}/init-subscription`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${appToken}` },
                }
            );

            if (res.ok) {
                setIsLive(true);
                console.log('✅ Dhan live feed started');
            }
        } catch (err) {
            console.warn('⚠️ Live feed init failed:', err);
            setIsLive(false);
        }
    }, [appToken, broker?.clientId]);

    // Poll live prices
    const pollLivePrices = useCallback(async () => {
        if (!appToken || !broker?.clientId) return;

        try {
            const res = await fetch(
                `${BASE_URL}/api/DhanInstruments/live-prices/user/${broker.clientId}`,
                {
                    headers: { Authorization: `Bearer ${appToken}` },
                }
            );

            if (!res.ok) return;

            const data = await res.json();
            if (!Array.isArray(data)) return;

            const newPrices = {};
            data.forEach(p => {
                if (p.securityId) {
                    newPrices[p.securityId] = { ltp: p.ltp };
                }
            });

            livePricesRef.current = { ...livePricesRef.current, ...newPrices };

            // Re-apply to current raw data
            setHoldings(prev => rawHoldings.map(h => applyLivePrice(h, newPrices[h.securityId || h.isin])));
            setPositions(prev => rawPositions.map(p => applyLivePrice(p, newPrices[p.securityId])));

            recalculateSummary();
        } catch (err) {
            console.warn('Live prices poll failed:', err);
        }
    }, [appToken, broker?.clientId]);

    // Main effect
    // Main effect
    useEffect(() => {
        console.log('🟢 useBrokerPortfolio effect triggered', {
            isConnected,
            hasAppToken: !!appToken,
            currentError: error,  // if you expose error in return
        });
        if (isConnected && appToken) {
            console.log('Starting sync and live feed');
            fetchInitialData();
            startLiveFeed();
            pollIntervalRef.current = setInterval(pollLivePrices, 4000);
            return () => clearInterval(pollIntervalRef.current);
        } else {
            console.log('Not connected or no token → cleaning up');
            setInitialLoading(false);
            setIsLive(false);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            console.log('Clearing portfolio error on disconnect');
            setError(null);
        }
    }, [isConnected, appToken]);

    // Refresh handler
    // Refresh function used by pull-to-refresh
    const refreshPortfolio = useCallback(async () => {
        livePricesRef.current = {};
        setIsLive(false);
        setHoldings([]);
        setPositions([]);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        await fetchInitialData(1, 3); // fewer retries on manual refresh
        startLiveFeed();
        pollIntervalRef.current = setInterval(pollLivePrices, 4000);
    }, [fetchInitialData, startLiveFeed, pollLivePrices]);

    const combinedPortfolio = [...holdings, ...positions];

    const getLivePrice = useCallback((securityId) => {
        const cached = livePricesRef.current[securityId];
        return cached ? { success: true, data: cached } : { success: false };
    }, []);

    const fetchOrderHistoryBySecurityId = useCallback(async (securityId, fy) => {
        if (!appToken || !securityId) return [];

        try {
            let url = `${BASE_URL}/api/BrokerConnections/order-history-by-security?securityId=${securityId}`;
            if (fy) url += `&fy=${encodeURIComponent(fy)}`;

            const res = await fetch(url, { headers: { Authorization: `Bearer ${appToken}` } });
            return res.ok ? await res.json() : [];
        } catch (err) {
            console.error('Order history fetch error:', err);
            return [];
        }
    }, [appToken]);

    return {
        holdings,
        positions,
        combinedPortfolio,
        funds,
        summary,
        todayPnL,
        lastSync,
        isLive,
        loading: initialLoading || refreshing,
        refreshing,
        refreshPortfolio,
        getLivePrice,
        fetchOrderHistoryBySecurityId,
        profile,
        disconnectBroker,
        error,  // ← ADD THIS
    };
};