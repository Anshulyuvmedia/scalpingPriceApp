// contexts/BrokerContext/useOrderHistory.js
import React, { createContext, useContext, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePortfolio } from './usePortfolio';

const OrderHistoryContext = createContext();

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const OrderHistoryProvider = ({ children }) => {
    const { token } = useUser();
    const { isConnected } = usePortfolio();

    const fetchOrderHistoryBySecurityId = useCallback(async (securityId, fy) => {
        if (!token || !isConnected || !securityId) return [];

        let url = `${BASE_URL}/api/BrokerConnections/order-history-by-security?securityId=${securityId}`;
        if (fy) url += `&fy=${encodeURIComponent(fy)}`;

        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed');
        return await res.json();
    }, [token, isConnected]);

    return (
        <OrderHistoryContext.Provider value={{ fetchOrderHistoryBySecurityId }}>
            {children}
        </OrderHistoryContext.Provider>
    );
};

export const useOrderHistory = () => useContext(OrderHistoryContext);