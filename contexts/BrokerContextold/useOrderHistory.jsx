// contexts/BrokerContext/useOrderHistory.js
import React, { createContext, useContext, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePortfolio } from './usePortfolio';
import { useBroker } from '@/contexts/BrokerContext';

const OrderHistoryContext = createContext();

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const OrderHistoryProvider = ({ children }) => {
    const { appToken } = useUser();
    const { isConnected } = usePortfolio();
    const { brokerToken } = useBroker();

    const fetchOrderHistoryBySecurityId = useCallback(async (securityId, fy) => {
        if (!brokerToken || !isConnected || !securityId) return [];

        let url = `${BASE_URL}/api/BrokerConnections/order-history-by-security?securityId=${securityId}`;
        if (fy) url += `&fy=${encodeURIComponent(fy)}`;

        const res = await fetch(url, { headers: { Authorization: `Bearer ${brokerToken}` } });
        if (!res.ok) throw new Error('Failed');
        return await res.json();
    }, [brokerToken, isConnected]);

    return (
        <OrderHistoryContext.Provider value={{ fetchOrderHistoryBySecurityId }}>
            {children}
        </OrderHistoryContext.Provider>
    );
};

export const useOrderHistory = () => useContext(OrderHistoryContext);