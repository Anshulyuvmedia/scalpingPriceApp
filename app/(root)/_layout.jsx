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
            <Stack.Screen name="portfolio" options={{ headerShown: false }} />
            <Stack.Screen name="OrderHistoryScreen" options={{ headerShown: false }} />
            <Stack.Screen name="StrategyDetailScreen" options={{ title: 'StrategyDetailScreen' }} />
        </Stack>
    );
}