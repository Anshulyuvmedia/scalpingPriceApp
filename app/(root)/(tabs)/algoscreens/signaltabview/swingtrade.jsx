// signaltabview/SwingTrade.jsx
import React from 'react';
import SignalTabView from '@/components/SignalTabView';

const SwingTrade = ({ strategies, isLoading, onRefresh }) => (
  <SignalTabView
    strategies={strategies}
    isLoading={isLoading}
    onRefresh={onRefresh}
    emptyMessage="No swing signals yet"
    defaultBroker="Stratzy"
  />
);

export default SwingTrade;