import axios from 'axios';
import { createContext, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = 'http://192.168.1.23:3000/api';

export const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            if (process.env.NODE_ENV === 'development') {
                // console.log('fetchPlans - Sending GET request to:', `${API_BASE_URL}/TdPlans`);
            }
            const response = await axios.get(`${API_BASE_URL}/TdPlans`, { timeout: 10000 });
            if (process.env.NODE_ENV === 'development') {
                // console.log('fetchPlans - Response:', response.data);
            }
            setPlans(response.data);
        } catch (err) {
            console.error('fetchPlans - Error:', err);
            setError('Failed to fetch plans. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    };

    const subscribeToPlan = async (userId, planId, token) => {
        try {
            if (!userId || !planId || !token) {
                throw new Error('Missing required parameters for subscription');
            }
            setLoading(true);
            setError(null);
            if (process.env.NODE_ENV === 'development') {
                console.log('subscribeToPlan - Sending POST request to:', `${API_BASE_URL}/TdSubscriptions`, {
                    userId,
                    planId,
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            const response = await axios.post(
                `${API_BASE_URL}/TdSubscriptions`,
                { userId, planId },
                { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
            );
            if (process.env.NODE_ENV === 'development') {
                console.log('subscribeToPlan - Response:', response.data);
            }
            return response.data;
        } catch (err) {
            console.error('subscribeToPlan - Error:', err);
            const errorCode = err.response?.data?.error?.code || err.code;
            const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to subscribe to plan';
            let userFriendlyMessage;
            switch (errorCode) {
                case 'INVALID_TOKEN':
                    userFriendlyMessage = 'Session issue: Please log out and log in again.';
                    break;
                case 'UNAUTHORIZED':
                    userFriendlyMessage = 'You are not authorized to perform this action.';
                    break;
                case 'USER_NOT_FOUND':
                    userFriendlyMessage = 'User not found.';
                    break;
                case 'PLAN_NOT_FOUND':
                    userFriendlyMessage = 'Plan not found.';
                    break;
                case 'INVALID_DURATION':
                    userFriendlyMessage = 'Invalid plan duration.';
                    break;
                case 'ECONNABORTED':
                case 'Network Error':
                    userFriendlyMessage = 'Network error. Please check your connection and try again.';
                    break;
                default:
                    userFriendlyMessage = errorMessage;
            }
            console.log('subscribeToPlan - Error message:', userFriendlyMessage);
            setError(userFriendlyMessage);
            throw new Error(userFriendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const value = useMemo(() => ({ plans, loading, error, fetchPlans, subscribeToPlan }), [plans, loading, error]);

    return (
        <PackageContext.Provider value={value}>
            {children}
        </PackageContext.Provider>
    );
};