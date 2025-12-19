// contexts/broker/useBrokerOrders.js
import { useState, useCallback, useRef } from 'react';

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';

export const useBrokerOrders = ({ appToken, isConnected }) => {
    const [todayOrders, setTodayOrders] = useState([]);
    const [todayOrdersLoading, setTodayOrdersLoading] = useState(false);
    const [todayOrdersRefreshing, setTodayOrdersRefreshing] = useState(false);

    const abortControllerRef = useRef(null);

    const fetchTodayOrders = useCallback(
        async (isRefresh = false) => {
            if (!appToken || !isConnected) {
                setTodayOrders([]);
                return;
            }

            // Cancel any previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                setTodayOrdersLoading(true);
                setTodayOrdersRefreshing(isRefresh);

                const res = await fetch(`${BASE_URL}/api/BrokerConnections/todayOrders`, {
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${appToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch today's orders: ${res.status} ${text || res.statusText}`);
                }
                // console.log('res', res);
                const data = await res.json();
                const orders = Array.isArray(data.orders) ? data.orders : [];

                // Sort by latest first
                const sortedOrders = orders.sort((a, b) => {
                    const timeA = a.orderUpdateTime || a.exchangeTime || 0;
                    const timeB = b.orderUpdateTime || b.exchangeTime || 0;
                    return new Date(timeB) - new Date(timeA);
                });

                // Ensure unique stable key using Dhan's orderId
                const ordersWithKey = sortedOrders.map((order) => ({
                    ...order,
                    _id: order.orderId || `fallback-${Date.now()}-${Math.random()}`,
                }));

                setTodayOrders(ordersWithKey);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Fetch today orders error:', err);
                    setTodayOrders([]);
                }
            } finally {
                setTodayOrdersLoading(false);
                setTodayOrdersRefreshing(false);
            }
        },
        [appToken, isConnected]
    );

    const modifyPendingOrder = useCallback(
        async (payload) => {
            if (!appToken || !isConnected) {
                return { success: false, message: 'No broker connected or app token missing' };
            }

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const res = await fetch(`${BASE_URL}/api/BrokerConnections/modifypendingorder`, {
                    method: 'PUT',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${appToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Modify pending order failed: ${res.status} ${text || res.statusText}`);
                }

                const data = await res.json();

                const orders = Array.isArray(data.orders) ? data.orders : [];

                const sortedOrders = orders.sort((a, b) => {
                    const timeA = a.orderUpdateTime || a.exchangeTime || 0;
                    const timeB = b.orderUpdateTime || b.exchangeTime || 0;
                    return new Date(timeB) - new Date(timeA);
                });

                const ordersWithKey = sortedOrders.map((order) => ({
                    ...order,
                    _id: order.orderId || `fallback-${Date.now()}-${Math.random()}`,
                }));

                setTodayOrders(ordersWithKey);

                return { success: true, data: ordersWithKey };
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Modify pending order error:', err);
                }
                return { success: false, message: err.message || 'Failed to modify order' };
            }
        },
        [appToken, isConnected]
    );

    const refreshTodayOrders = useCallback(() => {
        fetchTodayOrders(true);
    }, [fetchTodayOrders]);

    return {
        todayOrders,
        todayOrdersLoading,
        todayOrdersRefreshing,
        fetchTodayOrders,
        refreshTodayOrders,
        modifyPendingOrder,
    };
};