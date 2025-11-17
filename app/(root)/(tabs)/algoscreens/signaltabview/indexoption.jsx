// signaltabview/IndexOption.jsx
import React from 'react';
import SignalTabView from '@/components/SignalTabView';

const IndexOption = ({ strategies, isLoading, onRefresh }) => (
  <SignalTabView
    strategies={strategies}
    isLoading={isLoading}
    onRefresh={onRefresh}
    emptyMessage="No index option signals yet"
    defaultBroker="Stratzy"
  />
);

export default IndexOption;