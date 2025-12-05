// contexts/BrokerContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

const BrokerContext = createContext();
const NGROK_URL = 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev';
const PRODUCTION_URL = 'https://api.yourapp.com';
const BASE_URL = __DEV__
    ? `${NGROK_URL}/api/BrokerConnections`
    : `${PRODUCTION_URL}/api/BrokerConnections`;

export const BrokerProvider = ({ children }) => {
    const { token } = useUser();
    const [broker, setBroker] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [positions, setPositions] = useState([]);
    const [funds, setFunds] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({
        totalInvestment: 0,
        currentValue: 0,
        overallPnL: 0,
        overallPnLPercent: 0,
    });

    const fetchRealData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            setLoading(true);

            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch all static data
            const [profileRes, holdingsRes, positionsRes, portfolioRes, fundsRes] = await Promise.all([
                fetch(`${BASE_URL}/profile`, { headers }),
                fetch(`${BASE_URL}/holdings`, { headers }),
                fetch(`${BASE_URL}/positions`, { headers }),
                fetch(`${BASE_URL}/portfolio`, { headers }),
                fetch(`${BASE_URL}/funds`, { headers }),
            ]);

            if (![profileRes, holdingsRes, positionsRes, portfolioRes, fundsRes].every(r => r.ok)) {
                throw new Error("Failed to fetch portfolio data");
            }

            const [profile, rawHoldings, rawPositions, rawPortfolio, rawFunds] = await Promise.all([
                profileRes.json(),
                holdingsRes.json(),
                positionsRes.json(),
                portfolioRes.json(),
                fundsRes.json(),
            ]);

            // 2. Extract all unique securityIds
            const allItems = [...rawHoldings, ...rawPositions];
            const securityIds = [...new Set(
                allItems
                    .map(i => i.securityId || i.isin)
                    .filter(Boolean)
            )];

            // 3. Fetch LIVE LTP + daily change
            let liveQuotes = {};
            if (securityIds.length > 0) {
                const quoteRes = await fetch(`${BASE_URL}/market-quotes`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(securityIds)
                });
                if (quoteRes.ok) {
                    liveQuotes = await quoteRes.json(); // { "1333": { ltp, change, changePercent } }
                }
            }

            // 4. Apply live prices
            const applyLivePrice = (item) => {
                const securityId = item.securityId || item.isin;
                const quote = securityId ? liveQuotes[securityId] : null;

                const qty = Math.abs(
                    Number(item.qty) ||
                    Number(item.netQty) ||
                    Number(item.availableQty) ||
                    Number(item.holdingQuantity) || 0
                );

                const avgPrice = Number(item.avgCostPrice || item.buyAvg || 0);
                const investment = avgPrice * qty;

                if (quote && quote.ltp > 0) {
                    const current = quote.ltp * qty;
                    const profitLoss = current - investment;

                    return {
                        ...item,
                        ltp: quote.ltp,
                        change: quote.change,
                        changePercent: quote.changePercent,
                        current,
                        investment,
                        profitLoss,
                    };
                }

                // Fallback (old behavior)
                const fallbackLtp = Number(item.ltp) || avgPrice;
                const current = fallbackLtp * qty;
                const profitLoss = Number(item.unrealizedProfitLoss || item.unrealizedProfit || 0);

                return {
                    ...item,
                    ltp: fallbackLtp,
                    change: 0,
                    changePercent: 0,
                    current,
                    investment,
                    profitLoss,
                };
            };

            const enhancedHoldings = rawHoldings.map(applyLivePrice);
            const enhancedPositions = rawPositions.map(applyLivePrice);
            const enhancedPortfolio = rawPortfolio.map(applyLivePrice);
            // 4.1 Compute Portfolio Summary
            const computeSummary = (items) => {
                let totalInvestment = 0;
                let currentValue = 0;

                items.forEach(item => {
                    totalInvestment += Number(item.investment || 0);
                    currentValue += Number(item.current || 0);
                });

                const overallPnL = currentValue - totalInvestment;
                const overallPnLPercent =
                    totalInvestment > 0 ? (overallPnL / totalInvestment) * 100 : 0;

                return {
                    totalInvestment: Number(totalInvestment.toFixed(2)),
                    currentValue: Number(currentValue.toFixed(2)),
                    overallPnL: Number(overallPnL.toFixed(2)),
                    overallPnLPercent: Number(overallPnLPercent.toFixed(2)),
                };
            };
            // 4.2 Set Summary from enhancedPortfolio
            const summaryData = computeSummary(enhancedPortfolio);
            setSummary(summaryData);

            // 5. Final state
            setBroker({
                name: `Dhan • ${profile.dhanClientId || 'Connected'}`,
                broker: 'dhan',
                clientId: profile.dhanClientId || ''
            });

            setHoldings(transformDhanHoldings(enhancedHoldings));
            setPositions(transformDhanPositions(enhancedPositions));
            setPortfolio(transformDhanHoldings(enhancedPortfolio));
            setFunds(rawFunds);
            setLastSync(new Date().toLocaleTimeString('en-IN'));
            console.log(`LIVE DATA LOADED – ${Object.keys(liveQuotes).length} symbols updated`);

        } catch (err) {
            console.error("Dhan sync failed:", err);
            setError(err.message || "Failed to sync with Dhan");
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Expose refresh
    const refreshPortfolio = () => fetchRealData();

    useEffect(() => {
        if (token) fetchRealData();
        else {
            setBroker(null);
            setPortfolio([]);
            setHoldings([]);
            setPositions([]);
            setFunds(null);
            setLoading(false);
        }
    }, [token, fetchRealData]);

    return (
        <BrokerContext.Provider value={{
            broker,
            portfolio,
            holdings,
            positions,
            funds,
            summary,
            loading,
            lastSync,
            error,
            refreshPortfolio,
            isConnected: !!broker?.broker,
        }}>
            {children}
        </BrokerContext.Provider>
    );
};

export const useBroker = () => useContext(BrokerContext);

// Add to existing BrokerContext.js
const transformDhanHoldings = (items = []) => items.map(h => {
    const qty = Math.abs(Number(h.qty) || Number(h.availableQty) || Number(h.holdingQuantity) || 0);
    const avgPrice = Number(h.avgCostPrice || h.buyAvg || 0);
    const current = Number(h.ltp || avgPrice) * qty;
    const unrealisedPL = current - (avgPrice * qty);
    return {
        id: h.isin || h.securityId || h.tradingSymbol,
        symbol: h.tradingSymbol || 'N/A',
        name: h.tradingSymbol || 'Unknown',
        qty,
        avgPrice,
        investment: avgPrice * qty,
        current,
        profitLoss: unrealisedPL,
        realisedPL: Number(h.realizedProfitLoss || h.realisedPL || 0),
        unrealisedPL,
        ltp: h.ltp,
        change: h.change || 0,
        changePercent: h.changePercent || 0,
        exchange: h.exchange || 'NSE',
    };
});

const transformDhanPositions = (items = []) => items.map(p => {
    const qty = Math.abs(Number(p.netQty) || 0);
    const avgPrice = Number(p.buyAvg || p.costPrice || 0);
    const current = Number(p.ltp || avgPrice) * qty;
    const unrealisedPL = current - (avgPrice * qty);
    return {
        id: p.securityId || p.tradingSymbol,
        symbol: p.tradingSymbol,
        name: p.tradingSymbol,
        qty,
        avgPrice,
        investment: avgPrice * qty,
        current,
        profitLoss: unrealisedPL,
        realisedPL: Number(p.realizedProfit || p.realisedPL || 0),
        unrealisedPL,
        ltp: p.ltp,
        change: p.change || 0,
        changePercent: p.changePercent || 0,
        exchange: p.exchangeSegment?.split('_')[0] || 'NSE',
        positionType: p.positionType,
        productType: p.productType,
    };
});

// Compute summary based on merged portfolio
const computeSummary = (items) => {
    let totalInvestment = 0, currentValue = 0, unrealisedPL = 0, realisedPL = 0;

    items.forEach(i => {
        totalInvestment += i.investment || 0;
        currentValue += i.current || 0;
        unrealisedPL += i.unrealisedPL || 0;
        realisedPL += i.realisedPL || 0;
    });

    const totalPL = unrealisedPL + realisedPL;
    const overallPnLPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

    return {
        totalInvestment: Number(totalInvestment.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        totalPL: Number(totalPL.toFixed(2)),
        unrealisedPL: Number(unrealisedPL.toFixed(2)),
        realisedPL: Number(realisedPL.toFixed(2)),
        overallPnLPercent: Number(overallPnLPercent.toFixed(2)),
    };
};
