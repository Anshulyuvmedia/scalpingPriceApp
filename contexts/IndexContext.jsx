import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

const IndexContext = createContext();

export const IndexProvider = ({ children }) => {
    const [indicesData, setIndicesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://192.168.1.50:3000/api/indices');
            const formattedData = response.data.reduce((acc, item) => {
                acc[item.name] = { data: item.data, change: item.change };
                return acc;
            }, {});
            setIndicesData(formattedData);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch indices data');
            setLoading(false);
            console.error('Axios error:', err);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <IndexContext.Provider value={{ indicesData, loading, error }}>
            {children}
        </IndexContext.Provider>
    );
};

export const useIndex = () => useContext(IndexContext);