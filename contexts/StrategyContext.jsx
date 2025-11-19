// contexts/StrategyContext.jsx
import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const API_BASE_URL = 'http://192.168.1.23:3000/api'; // Change in production

// Create Context
const StrategyContext = createContext(undefined);

// Provider Component
export const StrategyProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [allStrategies, setAllStrategies] = useState([]);
    const [swingTrade, setSwingTrade] = useState([]);
    const [stockOption, setStockOption] = useState([]);
    const [indexOption, setIndexOption] = useState([]);
    const [indexStrategies, setIndexStrategies] = useState([]);

    // Categorize strategies
    const categorizeStrategies = useCallback((strategies) => {
        const swingTrade = [];
        const intradayStrategies = [];   // All ≤15min + time-based (no interval)

        const indexOption = [];      // ← Will be SAME as intraday
        const stockOption = [];      // ← Will be SAME as intraday
        const indexStrategies = [];  // ← Optional: same or empty

        strategies.forEach((strategy) => {
            const orderSettings = strategy.orderSettings || {};
            const intervalStr = orderSettings.interval?.trim();
            const interval = intervalStr ? parseInt(intervalStr, 10) : 0;
            const hasValidInterval = intervalStr && !isNaN(interval) && interval > 0;

            const type = strategy.strategyType || '';

            // Rare case
            if (type === 'index_strategy') {
                indexStrategies.push(strategy);
                return;
            }

            // Is it Intraday? (≤15 min OR no interval)
            const isIntraday = !hasValidInterval || (hasValidInterval && interval <= 15);

            if (isIntraday) {
                intradayStrategies.push(strategy);
            } else {
                swingTrade.push(strategy);
            }
        });

        // Duplicate intraday strategies into ALL three tabs as you want
        stockOption.push(...intradayStrategies);
        indexOption.push(...intradayStrategies);
        indexStrategies.push(...intradayStrategies);

        setSwingTrade(swingTrade);
        setStockOption(stockOption);
        setIndexOption(indexOption);
        setIndexStrategies(indexStrategies);
        setAllStrategies(strategies);
    }, []);


    // Fetch from API
    const fetchStrategies = useCallback(async () => {
        try {
            setError(null);

            const response = await axios.get(`${API_BASE_URL}/TdStrategys`);

            categorizeStrategies(response.data);
            // console.log('response.data', response.data);
        } catch (err) {
            console.error('Strategy fetch error:', err);
            setError(err.response?.data?.error?.message || 'Failed to load signals');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [categorizeStrategies]);

    // Initial load
    useEffect(() => {
        fetchStrategies();
    }, [fetchStrategies]);

    // Manual refresh
    const refetch = () => {
        setRefreshing(true);
        fetchStrategies();
    };

    // Value exposed to components
    const value = {
        // States
        loading,
        refreshing,
        error,
        allStrategies,

        // Categorized
        swingTrade,
        stockOption,
        indexOption,
        indexStrategies,

        // Actions
        refetch,
    };

    return (
        <StrategyContext.Provider value={value}>
            {children}
        </StrategyContext.Provider>
    );
};

// Custom Hook
export const useStrategies = () => {
    const context = useContext(StrategyContext);
    if (!context) {
        throw new Error('useStrategies must be used within StrategyProvider');
    }
    return context;
};