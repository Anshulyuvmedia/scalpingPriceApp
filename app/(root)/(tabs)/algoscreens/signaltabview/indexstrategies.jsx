// signaltabview/IndexStrategies.jsx
import React from 'react';
import SignalTabView from '@/components/SignalTabView';

const IndexStrategies = ({ strategies, isLoading, onRefresh }) => (
  <SignalTabView
    strategies={strategies}
    isLoading={isLoading}
    onRefresh={onRefresh}
    emptyMessage="No index strategies yet"
    defaultBroker="Stratzy"
  />
);

export default IndexStrategies;