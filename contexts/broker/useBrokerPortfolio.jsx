import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
// import { useBrokerConnection } from './useBrokerConnection';
import axios from 'axios';

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

const log = (...args) => console.log('[PORTFOLIO]', ...args);
const warn = (...args) => console.warn('[PORTFOLIO]', ...args);
const errLog = (...args) => console.error('[PORTFOLIO]', ...args);

export const useBrokerPortfolio = (connection) => {
    const { user, appToken } = useUser();
    const { brokerToken, isConnected, disconnectBroker } = connection;
    const hasInitialSyncRef = useRef(false);
    const syncingRef = useRef(false);

    const wsRef = useRef(null);
    const livePricesRef = useRef({});
    const pollRef = useRef(null);
    const liveFeedStartedRef = useRef(false);

    const [profile, setProfile] = useState(null);
    const [funds, setFunds] = useState(null);
    const [rawHoldings, setRawHoldings] = useState([]);
    const [rawPositions, setRawPositions] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [positions, setPositions] = useState([]);
    const [summary, setSummary] = useState({
        totalInvestment: 0,
        currentValue: 0,
        totalPL: 0,
        overallPnLPercent: 0,
        availableCash: 0
    });
    const [todayPnL, setTodayPnL] = useState({
        todayTotalPL: 0,
        todayRealisedPL: 0,
        todayUnrealisedPL: 0,
        todayPnLPercent: 0
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [lastSync, setLastSync] = useState(null);

    /** ------------------ Axios instance ------------------ */
    const api = useMemo(() => {
        if (!appToken || !brokerToken) return null;

        return axios.create({
            baseURL: BASE_URL,
            headers: {
                Authorization: `Bearer ${appToken}`,
                'x-broker-token': brokerToken,
                'Content-Type': 'application/json'
            }
        });
    }, [appToken, brokerToken]);

    /** ------------------ Helper: Apply live price ------------------ */
    const applyLivePrice = useCallback((item, quote) => {
        const qty = Number(item.totalQty || item.holdingQuantity || item.netQty || item.qty || 0);
        const avg = Number(item.avgCostPrice || item.buyAvg || item.costPrice || 0);
        const ltp = quote?.ltp ?? item.lastTradedPrice ?? 0;
        const change = quote?.change ?? quote?.chg ?? 0;

        const investment = avg * qty;
        const currentValue = ltp * qty;
        const unrealisedPL = currentValue - investment;
        const realisedPL = Number(item.realizedProfit || item.realizedProfitLoss || 0);

        return {
            ...item,
            ltp,
            qty,
            investment,
            currentValue,
            unrealisedPL,
            profitLoss: unrealisedPL + realisedPL,
            profitLossPercent: investment > 0 ? (unrealisedPL / investment) * 100 : 0,
            todayUnrealisedPL: change * qty,
            isLive: !!quote
        };
    }, []);

    /** ------------------ Helper: Recalculate summary ------------------ */
    const recalcAll = useCallback((h, p) => {
        const items = [...h, ...p];
        const totalInvestment = items.reduce((s, i) => s + (i.investment || 0), 0);
        const currentValue = items.reduce((s, i) => s + (i.currentValue || 0), 0);
        const totalPL = currentValue - totalInvestment;

        const todayUnrealisedPL = items.reduce((s, i) => s + (i.todayUnrealisedPL || 0), 0);
        const todayRealisedPL = items.reduce((s, i) => s + Number(i.realizedProfit || i.realizedProfitLoss || 0), 0);
        const todayTotalPL = todayUnrealisedPL + todayRealisedPL;

        setSummary(prev => ({
            ...prev,
            totalInvestment: +totalInvestment.toFixed(2),
            currentValue: +currentValue.toFixed(2),
            totalPL: +totalPL.toFixed(2),
            overallPnLPercent: totalInvestment > 0 ? +(totalPL / totalInvestment * 100).toFixed(2) : 0
        }));

        setTodayPnL({
            todayUnrealisedPL: +todayUnrealisedPL.toFixed(2),
            todayRealisedPL: +todayRealisedPL.toFixed(2),
            todayTotalPL: +todayTotalPL.toFixed(2),
            todayPnLPercent: totalInvestment > 0 ? +(todayTotalPL / totalInvestment * 100).toFixed(2) : 0
        });
    }, []);

    const refreshPortfolio = useCallback(async () => {
        if (!api || !isConnected) return;

        if (syncingRef.current) {
            log('Sync already running, skipping');
            return;
        }

        syncingRef.current = true;
        setRefreshing(true);
        setLoading(true);
        setError(null);

        try {
            log('Starting portfolio sync');

            const [profileRes, fundsRes, holdingsRes, positionsRes] = await Promise.all([
                api.get('/api/BrokerConnections/profile'),
                api.get('/api/BrokerConnections/funds'),
                api.get('/api/BrokerConnections/holdings'),
                api.get('/api/BrokerConnections/positions')
            ]);

            setProfile(profileRes.data);
            setFunds(fundsRes.data || null);
            setRawHoldings(holdingsRes.data || []);
            setRawPositions(positionsRes.data || []);

            const enrichedHoldings = holdingsRes.data.map(h =>
                applyLivePrice(h, livePricesRef.current[h.securityId])
            );
            const enrichedPositions = positionsRes.data.map(p =>
                applyLivePrice(p, livePricesRef.current[p.securityId])
            );

            setHoldings(enrichedHoldings);
            setPositions(enrichedPositions);

            recalcAll(enrichedHoldings, enrichedPositions);
            setLastSync(new Date().toLocaleTimeString('en-IN'));

            log('Portfolio sync complete');
        } catch (e) {
            errLog('Portfolio sync failed:', e.response?.data || e.message);

            if (e.response?.status === 401) {
                warn('Broker token expired → disconnecting');
                setError('BROKER_EXPIRED');
                await disconnectBroker();
            } else {
                setError('PORTFOLIO_SYNC_FAILED');
            }
        } finally {
            syncingRef.current = false;
            setRefreshing(false);
            setLoading(false);
        }
    }, [api, isConnected, applyLivePrice, recalcAll, disconnectBroker]);

    /** ------------------ Fetch live quotes ------------------ */
    const fetchQuotes = useCallback(async () => {
        if (!profile?.dhanClientId || !api) return;

        try {
            const res = await axios.post(
                `${BASE_URL}/api/DhanInstruments/portfolio-quote/user/${profile.dhanClientId}`,
                {},
                { headers: { Authorization: `Bearer ${appToken}`, 'x-broker-token': brokerToken }, validateStatus: () => true }
            );

            if (res.status === 429) {
                warn('Dhan API rate limit hit (429). Retrying after 15s');
                clearInterval(pollRef.current);
                pollRef.current = setTimeout(fetchQuotes, 15000);
                return;
            }

            const data = res.data;
            if (!Array.isArray(data) || data.length === 0) {
                warn('Empty quotes received. Using previous live prices');
                const h = rawHoldings.map(x => applyLivePrice(x, livePricesRef.current[x.securityId]));
                const p = rawPositions.map(x => applyLivePrice(x, livePricesRef.current[x.securityId]));
                setHoldings(h);
                setPositions(p);
                recalcAll(h, p);
                return;
            }

            const quotes = {};
            data.forEach(q => {
                if (!q?.securityId) return;
                quotes[String(q.securityId)] = { ltp: q.ltp ?? 0, change: q.chg ?? q.change ?? 0 };
            });

            livePricesRef.current = { ...livePricesRef.current, ...quotes };

            const h = rawHoldings.map(x => applyLivePrice(x, quotes[x.securityId]));
            const p = rawPositions.map(x => applyLivePrice(x, quotes[x.securityId]));
            setHoldings(h);
            setPositions(p);
            recalcAll(h, p);
        } catch (e) {
            if (e.response) warn('Quote fetch failed', e.response.status, e.response.data);
            else warn('Quote polling failed', e.message);
        }
    }, [profile?.dhanClientId, api, rawHoldings, rawPositions, applyLivePrice, recalcAll, appToken, brokerToken]);

    /** ------------------ Start WebSocket live feed ------------------ */
    const startLiveFeed = useCallback(async () => {
        if (!profile?.dhanClientId || !api || liveFeedStartedRef.current) return;
        liveFeedStartedRef.current = true;

        try {
            log('Starting Dhan live feed...', profile.dhanClientId);
            await api.post(`/api/DhanInstruments/user/${profile.dhanClientId}/init-subscription`);
            setIsLive(true);
            log('Live feed started');
        } catch (e) {
            warn('Live feed failed, fallback to polling', e.response?.data || e.message);
            liveFeedStartedRef.current = false;
            setIsLive(false);
        }
    }, [profile?.dhanClientId, api]);

    /** ------------------ Effects ------------------ */

    useEffect(() => {
        let pollInterval;

        const startPollingAfterSync = async () => {
            if (!profile?.dhanClientId || liveFeedStartedRef.current) return;
            // Perform initial sync first
            await refreshPortfolio();
            // Start live feed
            await startLiveFeed();
            // Start polling quotes
            pollInterval = setInterval(fetchQuotes, 8000);
        };

        startPollingAfterSync();

        return () => clearInterval(pollInterval);
    }, [profile?.dhanClientId, refreshPortfolio, startLiveFeed, fetchQuotes]);



    useEffect(() => {
        if (!isConnected) {
            hasInitialSyncRef.current = false;
            setLoading(false); // 👈 ADD THIS
            return;
        }

        if (hasInitialSyncRef.current) return;

        hasInitialSyncRef.current = true;
        refreshPortfolio();
    }, [isConnected]);


    useEffect(() => {
        if (!isConnected) {
            hasInitialSyncRef.current = false;
            syncingRef.current = false;
            liveFeedStartedRef.current = false;

            livePricesRef.current = {};   // 👈 ADD
            clearInterval(pollRef.current);
        }
    }, [isConnected]);


    return {
        profile,
        funds,
        holdings,
        positions,
        combinedPortfolio: [...holdings, ...positions],
        summary,
        todayPnL,
        lastSync,
        isLive,
        loading,
        refreshing,
        error,
        refreshPortfolio
    };
};
