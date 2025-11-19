// utils/useSignals.js
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://192.168.1.23:3000/api';

const useSignals = (signalType) => {
    const [signals, setSignals] = useState({
        index: [],
        stocks: [],
        futures: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSignals = async () => {
        try {
            setLoading(true);
            // console.log(`Fetching signals for signalType: ${signalType}`);
            // console.log(`API URL: ${API_BASE_URL}/TdSignals/by-type?signalType=${signalType}`);

            const response = await axios.get(`${API_BASE_URL}/TdSignals/by-type`, {
                params: { signalType },
                timeout: 10000,
            });
            // console.log('API Response:', response.data);

            // API returns array directly
            const filteredSignals = response.data;

            // Group signals by category
            const groupedSignals = {
                index: filteredSignals.filter((signal) => signal.category === 'Index'),
                stocks: filteredSignals.filter((signal) => signal.category === 'Stocks'),
                futures: filteredSignals.filter((signal) => signal.category === 'Futures'),
            };

            // console.log('Grouped Signals:', groupedSignals);
            setSignals(groupedSignals);
        } catch (err) {
            const errorMessage = err.response
                ? `API Error: ${err.response.status} - ${err.response.statusText} - ${JSON.stringify(err.response.data)}`
                : `Network Error: ${err.message}`;
            console.error('Fetch Signals Error:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignals();
    }, [signalType]);

    return { signals, loading, error, refresh: fetchSignals };
};

export default useSignals;