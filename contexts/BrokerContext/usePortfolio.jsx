// contexts/BrokerContext/usePortfolio.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

const PortfolioContext = createContext();

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const PortfolioProvider = ({ children }) => {
    const { token } = useUser();

    const [broker, setBroker] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [positions, setPositions] = useState([]);
    const [funds, setFunds] = useState(null);
    const [summary, setSummary] = useState({ totalInvestment: 0, currentValue: 0, totalPL: 0, overallPnLPercent: 0 });
    const [todayPnL, setTodayPnL] = useState({ todayTotalPL: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);

            const headers = { Authorization: `Bearer ${token}` };

            const responses = await Promise.all([
                fetch(`${BASE_URL}/api/BrokerConnections/profile`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/portfolio-summary`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/funds`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/today-pnl`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/holdings`, { headers }),
                fetch(`${BASE_URL}/api/BrokerConnections/positions`, { headers }),
            ]);

            const [profileRes, summaryRes, fundsRes, todayRes, holdingsRes, positionsRes] = responses;

            if (!profileRes.ok) throw new Error("Not connected to Dhan");

            const [profile, summaryData, fundsData, todayData, rawHoldings, rawPositions] = await Promise.all(
                responses.map(r => r.json())
            );

            setBroker({ name: `Dhan • ${profile.dhanClientId}`, broker: 'dhan' });
            setFunds(fundsData);
            setSummary(summaryData);
            setTodayPnL(todayData);
            setHoldings(rawHoldings);
            setPositions(rawPositions);
        } catch (err) {
            setError(err.message || "Failed to load portfolio");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchData();
        else {
            setBroker(null);
            setHoldings([]);
            setPositions([]);
            setFunds(null);
            setSummary({ totalInvestment: 0, currentValue: 0, totalPL: 0, overallPnLPercent: 0 });
            setTodayPnL({ todayTotalPL: 0 });
            setError(null);
        }
    }, [token, fetchData]);

    // Full cleanup on unmount
    useEffect(() => {
        return () => {
            setHoldings([]);
            setPositions([]);
        };
    }, []);

    const value = {
        broker,
        holdings,
        positions,
        funds,
        summary,
        todayPnL,
        loading,
        error,
        isConnected: !!broker,
        refreshPortfolio: fetchData,
    };

    return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) throw new Error('usePortfolio must be used within BrokerProvider');
    return context;
};