// app/(root)/(tabs)/chatbot/tabview/_layout.jsx
import { Stack } from 'expo-router';

export default function TabViewLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="IndexTab" options={{ title: 'Index Tab' }} />
            <Stack.Screen name="StocksTab" options={{ title: 'Stocks Tab' }} />
            <Stack.Screen name="FutureTab" options={{ title: 'Future Tab' }} />
        </Stack>
    );
}