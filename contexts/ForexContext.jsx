import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

const ForexContext = createContext();

export const ForexProvider = ({ children }) => {
    const [rates, setRates] = useState({ forex: [], crypto: [], binary: [], commodity: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://192.168.1.20:3000/api/ForexRates/products');
                // console.log('fx:', response.data.data);
                const data = response.data.data || { forex: [], crypto: [], binary: [], commodity: [] }; // Extract 'data' key
                setRates(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching rates:', err.message);
                setError('Failed to fetch rates');
                setRates({ forex: [], crypto: [], binary: [], commodity: [] }); // Fallback on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <ForexContext.Provider value={{ rates, isLoading, error }}>
            {children}
        </ForexContext.Provider>
    );
};

export const useForex = () => {
    const context = useContext(ForexContext);
    if (!context) {
        throw new Error('useForex must be used within a ForexProvider');
    }
    return context;
};

export default ForexContext;