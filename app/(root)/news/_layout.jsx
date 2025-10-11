import { Stack } from 'expo-router';

export default function NewsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000' },
            }}
        >
            <Stack.Screen name="NewsListing" options={{ headerShown: false }} />
            <Stack.Screen name="NewsDetail" options={{ headerShown: false }} />
            <Stack.Screen name="WebViewScreen" options={{ headerShown: false }} />
        </Stack>
    );
}