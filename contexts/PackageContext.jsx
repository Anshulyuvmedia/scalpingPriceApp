
import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

const API_BASE_URL = 'http://192.168.1.20:3000/api';

export const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            // console.log('fetchPlans - Sending GET request to:', `${API_BASE_URL}/TdPlans`);
            const response = await axios.get(`${API_BASE_URL}/TdPlans`, { timeout: 10000 });
            // console.log('fetchPlans - Response:', response.data);
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
            setLoading(true);
            setError(null);
            console.log('subscribeToPlan - Sending POST request to:', `${API_BASE_URL}/TdUsers/subscribeToPlan`, {
                userId,
                planId,
                headers: { Authorization: `Bearer ${token}` }
            });
            const response = await axios.post(
                `${API_BASE_URL}/TdUsers/subscribeToPlan`,
                { userId, planId },
                { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
            );
            console.log('subscribeToPlan - Response:', response.data);
            return response.data;
        } catch (err) {
            console.error('subscribeToPlan - Error:', err);
            const errorMessage = err.response?.data?.error?.message || 'Failed to subscribe to plan';
            console.log('subscribeToPlan - Error message:', errorMessage);
            if (errorMessage.includes('No role assigned')) {
                throw new Error('Session issue: Please log out and log in again.');
            }
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    return (
        <PackageContext.Provider value={{ plans, loading, error, fetchPlans, subscribeToPlan }}>
            {children}
        </PackageContext.Provider>
    );
};
