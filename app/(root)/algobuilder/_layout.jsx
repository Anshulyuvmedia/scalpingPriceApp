import { Stack } from 'expo-router';

export default function AlgoBuilderLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="builderview" options={{ title: 'Algo View' }} />
        </Stack>
    );
}