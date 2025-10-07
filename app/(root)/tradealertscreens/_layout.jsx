import { Stack } from 'expo-router';

export default function TradeAlertsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000' },
            }}
        >
            <Stack.Screen name="tradealerts" options={{ headerShown: false }} />
            <Stack.Screen name="fxdetails" options={{ headerShown: false }} /> 
        </Stack>
    );
}