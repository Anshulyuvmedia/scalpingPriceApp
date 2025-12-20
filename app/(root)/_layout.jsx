// app/(root)/_layout.jsx
import { Stack } from 'expo-router';

export default function RootMainStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="aigeneratedtrade" options={{ headerShown: false }} />
            <Stack.Screen name="strategybacktesting" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="detailedmatrics" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="tradealertscreens" options={{ headerShown: false }} />
            <Stack.Screen name="packages/package" options={{ headerShown: false }} />

            <Stack.Screen name="portfolio/PortfolioScreen" options={{ headerShown: false }} />
            <Stack.Screen name="portfolio/PortfolioViews/PortfolioTabs" options={{ headerShown: false }} />
            <Stack.Screen name="portfolio/PortfolioViews/DematHolding" options={{ headerShown: false }} />
            <Stack.Screen name="portfolio/PortfolioViews/TradeBook" options={{ headerShown: false }} />
            <Stack.Screen name="portfolio/PortfolioViews/Overview" options={{ headerShown: false }} />
            <Stack.Screen name="portfolio/OpenPositions/OpenPosition" options={{ headerShown: false }} />

            <Stack.Screen name="OrderHistoryScreen" options={{ headerShown: false }} />
            <Stack.Screen name="StrategyDetailScreen" options={{ headerShown: false, title: 'StrategyDetailScreen' }} />
            <Stack.Screen name="StrategyResult" options={{ headerShown: false, title: 'StrategyResult' }} />
            <Stack.Screen name="SignalDetails" options={{ headerShown: false, title: 'SignalDetails' }} />
            <Stack.Screen name="SignalResult" options={{ headerShown: false, title: 'SignalResult' }} />
            <Stack.Screen name="AgloDetailView" options={{ headerShown: false, title: 'AgloDetailView' }} />
            <Stack.Screen name="StockListScreen" options={{ headerShown: false, title: 'StockListScreen' }} />

            <Stack.Screen name="auth/DhanOAuth" options={{ headerShown: false }} />
            <Stack.Screen name="auth/BrokerConnection" options={{ headerShown: false, title: 'BrokerConnection' }} />
            <Stack.Screen name="auth/BrokerForm" options={{ headerShown: false, title: 'BrokerForm' }} />

            <Stack.Screen name="orderbook/OrderBookTabs" options={{ headerShown: false, title: 'Order Book' }} />
            <Stack.Screen name="orderbook/ModifyOrder" options={{ headerShown: false, title: 'Modify Order' }} />
            <Stack.Screen name="TechnicalChart" options={{ headerShown: false, title: 'Technical Chart' }} />
        </Stack>
    );
}