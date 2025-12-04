// contexts/BrokerContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

const BrokerContext = createContext();

const NGROK_URL = 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev';
const PRODUCTION_URL = 'https://api.yourapp.com';

const BASE_URL = __DEV__
    ? `${NGROK_URL}/api/BrokerConnections`
    : `${PRODUCTION_URL}/api/BrokerConnections`;

export const BrokerProvider = ({ children }) => {
    const { token } = useUser();

    const [broker, setBroker] = useState(null);           // { name, broker: 'dhan', clientId }
    const [portfolio, setPortfolio] = useState([]);       // Real holdings
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);

    const fetchRealData = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            console.log("Fetching Dhan data...");

            const profileRes = await fetch(`${BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!profileRes.ok) {
                const text = await profileRes.text();
                throw new Error(`Profile failed: ${profileRes.status}`);
            }

            const profile = await profileRes.json();
            console.log("Dhan profile loaded:", profile.dhanClientId);  // ← Fixed: Use dhanClientId

            // NEW: Fetch merged portfolio (holdings + positions)
            const portfolioRes = await fetch(`${BASE_URL}/portfolio`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!portfolioRes.ok) {
                const text = await portfolioRes.text();
                throw new Error(`Portfolio failed: ${portfolioRes.status}`);
            }

            const rawPortfolio = await portfolioRes.json();

            const brokerInfo = {
                name: `Dhan • ${profile.dhanClientId}`,     // ← Fixed: Clean display
                broker: 'dhan',
                clientId: profile.dhanClientId
            };
            console.log('brokerInfo', brokerInfo);

            setBroker(brokerInfo);
            setPortfolio(transformDhanHoldings(rawPortfolio));  // Transformed merged data
            setLastSync(new Date().toLocaleTimeString('en-IN'));
            console.log("DHAN DATA LOADED SUCCESSFULLY");

        } catch (err) {
            console.log("Dhan sync failed:", err.message);
            setError(err.message || "Failed to sync with Dhan");
        } finally {
            setLoading(false);
        }
    };

    const refreshPortfolio = async () => {
        setLoading(true);
        await fetchRealData();
    };

    useEffect(() => {
        if (token) {
            refreshPortfolio();
            const interval = setInterval(refreshPortfolio, 5 * 60 * 1000); // 5 min
            return () => clearInterval(interval);
        } else {
            setBroker(null);
            setPortfolio([]);
            setLoading(false);
        }
    }, [token]);

    return (
        <BrokerContext.Provider value={{
            broker,
            portfolio,
            loading,
            lastSync,
            error,
            refreshPortfolio,
            isConnected: broker?.broker === 'dhan',   // True only if real data loaded
        }}>
            {children}
        </BrokerContext.Provider>
    );
};

export const useBroker = () => useContext(BrokerContext);

// Updated Transform (Matches Dhan v2 Holdings + Positions)
const transformDhanHoldings = (holdings = []) => {
    return holdings.map(h => ({
        id: h.isin || h.securityId || h.tradingSymbol,
        symbol: h.tradingSymbol || 'N/A',
        name: h.tradingSymbol || 'Unknown Stock',  // No companyName in v2
        qty: Number(h.holdingQuantity) || Number(h.totalQty) || Number(h.dpQty) || Number(h.netQty) || 0,  // Fallbacks
        avgPrice: Number(h.avgCostPrice) || Number(h.buyAvg) || 0,
        investment: (Number(h.avgCostPrice) || Number(h.buyAvg) || 0) * (Number(h.holdingQuantity) || Number(h.totalQty) || Number(h.dpQty) || Number(h.netQty) || 0),
        profitLoss: Number(h.unrealizedProfitLoss) || Number(h.unrealizedProfit) || 0,  // From positions
        realisedPL: Number(h.realizedProfitLoss) || Number(h.realizedProfit) || 0,  // From positions
        daysPL: 0,  // Not in v2 portfolio (use separate day P&L API if needed)
        exchange: h.exchangeSegment === 'NSE_EQ' ? 'NSE' : (h.exchange === 'BSE' ? 'BSE' : 'NSE'),  // Fallback
        ltp: Number(h.ltp) || 0,  // Approximated in backend merge
    }));
};