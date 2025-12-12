// contexts/BrokerContext/index.js
// import React from 'react';
// import { PortfolioProvider, usePortfolio } from './usePortfolio';
// import { LivePricesProvider, useLivePrices } from './useLivePrices';
// import { TradebookProvider, useTradebook } from './useTradebook';
// import { OrderHistoryProvider, useOrderHistory } from './useOrderHistory';

// export const BrokerProvider = ({ children }) => (
//     <PortfolioProvider>
//         <LivePricesProvider>
//             <TradebookProvider>
//                 <OrderHistoryProvider>
//                     {children}
//                 </OrderHistoryProvider>
//             </TradebookProvider>
//         </LivePricesProvider>
//     </PortfolioProvider>
// );

// export const useBroker = () => ({
//     ...usePortfolio(),
//     ...useLivePrices(),
//     ...useTradebook(),
//     ...useOrderHistory(),
// });