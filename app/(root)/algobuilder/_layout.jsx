import { Stack } from 'expo-router';

export default function AlgoBuilderLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="builderview" options={{ title: 'Algo View' }} />
            <Stack.Screen name="algo" options={{ title: 'Algo' }} />
            <Stack.Screen name="indicatorbased" options={{ title: 'indicatorbased' }} />
            <Stack.Screen name="signals" options={{ title: 'signal' }} />
        </Stack>
    );
}