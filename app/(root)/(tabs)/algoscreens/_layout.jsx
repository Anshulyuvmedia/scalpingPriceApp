// app/(root)/(tabs)/chatbot/_layout.jsx
import { Stack } from 'expo-router';

export default function AlgoLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="algo" options={{ title: 'Algo' }} />
        </Stack>
    );
}