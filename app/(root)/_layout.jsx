// app/(root)/_layout.jsx
import { Stack } from 'expo-router';

export default function RootMainStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* <Stack.Screen name="news" options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="(drawer)" options={{ headerShown: false }} /> */}
        </Stack>
    );
}