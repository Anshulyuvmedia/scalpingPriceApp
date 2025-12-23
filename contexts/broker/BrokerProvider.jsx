// contexts/broker/BrokerProvider.js
import React, { createContext, useContext } from 'react';

import { useBrokerConnection } from './useBrokerConnection';
import { useBrokerPortfolio } from './useBrokerPortfolio';
import { useBrokerOrders } from './useBrokerOrders';
import { useBrokerTradebook } from './useBrokerTradebook';

const BrokerContext = createContext();

export const BrokerProvider = ({ children }) => {
    const connection = useBrokerConnection();
    const portfolio = useBrokerPortfolio(connection);
    const orders = useBrokerOrders(connection);
    const tradebook = useBrokerTradebook(connection);

    const value = {
        // Connection
        broker: connection.broker,
        setBroker: connection.setBroker,
        brokerToken: connection.brokerToken,
        setBrokerToken: connection.setBrokerToken,
        isConnected: connection.isConnected,
        loading: connection.loading || (connection.isConnected && portfolio.loading),
        error: connection.error || portfolio.error,
        disconnectBroker: connection.disconnectBroker,

        // Portfolio & Live Prices
        profile: portfolio.profile,
        portfolio: portfolio.combinedPortfolio,
        holdings: portfolio.holdings,
        positions: portfolio.positions,
        funds: portfolio.funds,
        summary: portfolio.summary,
        todayPnL: portfolio.todayPnL,
        lastSync: portfolio.lastSync,
        isLive: portfolio.isLive,
        refreshPortfolio: portfolio.refreshPortfolio,
        getLivePrice: portfolio.getLivePrice,
        fetchOrderHistoryBySecurityId: portfolio.fetchOrderHistoryBySecurityId,

        // Orders
        todayOrders: orders.todayOrders,
        todayOrdersLoading: orders.todayOrdersLoading,
        todayOrdersRefreshing: orders.todayOrdersRefreshing,
        fetchTodayOrders: orders.fetchTodayOrders,
        refreshTodayOrders: orders.refreshTodayOrders,
        modifyPendingOrder: orders.modifyPendingOrder,

        // Tradebook
        tradeDateRange: tradebook.tradeDateRange,
        setTradeDateRange: tradebook.setTradeDateRange,
        tradebookItems: tradebook.tradebookItems,
        tradebookHasMore: tradebook.tradebookHasMore,
        tradebookLoading: tradebook.tradebookLoading,
        tradebookRefreshing: tradebook.tradebookRefreshing,
        loadMoreTradebook: tradebook.loadMoreTradebook,
        refreshTradebook: tradebook.refreshTradebook,
    };

    return (
        <BrokerContext.Provider value={value}>
            {children}
        </BrokerContext.Provider>
    );
};

export const useBroker = () => {
    const context = useContext(BrokerContext);
    if (!context) {
        throw new Error('useBroker must be used within a BrokerProvider');
    }
    return context;
};