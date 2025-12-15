// contexts/StrategyContext.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const API_BASE_URL = 'http://192.168.1.48:3000/api'; // Change in production

// Global axios instance with automatic access_token injection
const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    // console.log('DEBUG: Token from AsyncStorage:', token ? 'PRESENT' : 'MISSING');  // ← ADD THIS
    if (token) {
        config.params = { ...config.params, access_token: token };
        // console.log('DEBUG: Full config.params:', config.params);  // ← ADD THIS
    }
    return config;
});

const StrategyContext = createContext(undefined);

export const StrategyProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState(null);

    const [allStrategies, setAllStrategies] = useState([]);
    const [swingTrade, setSwingTrade] = useState([]);
    const [stockOption, setStockOption] = useState([]);
    const [indexOption, setIndexOption] = useState([]);
    const [indexStrategies, setIndexStrategies] = useState([]);

    // === CATEGORIZATION (unchanged) ===
    const categorizeStrategies = useCallback((strategies) => {
        const swing = [];
        const intraday = [];
        const index = [];

        strategies.forEach((s) => {
            const interval = parseInt(s.orderSettings?.interval || '0', 10);
            const isIntraday = !interval || interval <= 15;

            if (s.strategyType === 'index_strategy') {
                index.push(s);
            }

            if (isIntraday) {
                intraday.push(s);
            } else {
                swing.push(s);
            }
        });

        setSwingTrade(swing);
        setStockOption(intraday);
        setIndexOption(intraday);
        setIndexStrategies([...intraday, ...index]);
        setAllStrategies(strategies);
    }, []);

    // === FETCH ALL STRATEGIES (public) ===
    const fetchStrategies = useCallback(async () => {
        try {
            setError(null);
            const res = await axios.get(`${API_BASE_URL}/TdStrategys`); // Public endpoint
            categorizeStrategies(res.data);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to load signals');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [categorizeStrategies]);

    useEffect(() => {
        fetchStrategies();
    }, [fetchStrategies]);

    const refetch = () => {
        setRefreshing(true);
        fetchStrategies();
    };

    const executeStrategy = useCallback(async (strategyId, broker, quantity) => {
        if (!strategyId || !broker) throw new Error('Invalid parameters');

        setExecuting(true);
        try {
            const payload = { broker };
            if (quantity > 0) payload.quantity = quantity;

            const res = await api.post(`/TdStrategys/${strategyId}/execute`, payload);
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.error?.message || err.message || 'Execution failed';
            throw new Error(msg);
        } finally {
            setExecuting(false);
        }
    }, []);

    // === GET MY ACTIVE EXECUTIONS ===
    const getActiveExecutions = useCallback(async () => {
        try {
            // include paused too
            const res = await api.get('/StrategyExecutions/active', {
                params: { status: 'queued,running,paused' },
            });
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to fetch active');
        }
    }, []);


    // === GET MY HISTORY ===
    const getHistory = useCallback(async (limit = 50, skip = 0) => {
        try {
            const res = await api.get('/StrategyExecutions/history', { params: { limit, skip } });
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to fetch history');
        }
    }, []);

    const pauseExecution = useCallback(async (executionId) => {
        try {
            await api.post(`/StrategyExecutions/${executionId}/pause`);
            return { success: true };
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to pause');
        }
    }, []);

    const resumeExecution = useCallback(async (executionId) => {
        try {
            await api.post(`/StrategyExecutions/${executionId}/resume`);
            return { success: true };
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to resume');
        }
    }, []);

    const cancelExecution = useCallback(async (executionId) => {
        try {
            await api.post(`/StrategyExecutions/${executionId}/cancel`);
            return { success: true };
        } catch (err) {
            throw new Error(err.response?.data?.error?.message || 'Failed to cancel');
        }
    }, []);

    const value = {
        loading,
        refreshing,
        executing,
        error,

        allStrategies,
        swingTrade,
        stockOption,
        indexOption,
        indexStrategies,

        refetch,
        executeStrategy,
        getActiveExecutions,   // ← New
        getHistory,            // ← New

        pauseExecution,
        resumeExecution,
        cancelExecution,
    };

    return (
        <StrategyContext.Provider value={value}>
            {children}
        </StrategyContext.Provider>
    );
};

export const useStrategies = () => {
    const context = useContext(StrategyContext);
    if (!context) throw new Error('useStrategies must be used within StrategyProvider');
    return context;
};