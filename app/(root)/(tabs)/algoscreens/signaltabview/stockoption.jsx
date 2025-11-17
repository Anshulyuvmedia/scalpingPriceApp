// signaltabview/StockOption.jsx
import React from 'react';
import SignalTabView from '@/components/SignalTabView';

const StockOption = ({ strategies, isLoading, onRefresh }) => (
  <SignalTabView
    strategies={strategies}
    isLoading={isLoading}
    onRefresh={onRefresh}
    emptyMessage="No stock option signals yet"
    defaultBroker="Stratzy"
  />
);

export default StockOption;