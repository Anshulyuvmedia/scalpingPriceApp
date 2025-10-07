import { Stack, usePathname, router } from 'expo-router';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useContext } from 'react';
import './globals.css';
import { UserContext, UserProvider } from '@/contexts/UserContext';
import { IndexProvider } from '@/contexts/IndexContext'; // Import IndexProvider
import { ForexProvider } from '@/contexts/ForexContext';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const [fontsLoaded, fontError] = useFonts({
        'Questrial-Regular': require('../assets/fonts/Questrial-Regular.ttf'),
        'Sora-Regular': require('../assets/fonts/Sora-Regular.ttf'),
        'Sora-Bold': require('../assets/fonts/Sora-Bold.ttf'),
        'Sora-ExtraBold': require('../assets/fonts/Sora-ExtraBold.ttf'),
        'Sora-Medium': require('../assets/fonts/Sora-Medium.ttf'),
        'Sora-Light': require('../assets/fonts/Sora-Light.ttf'),
        'Sora-SemiBold': require('../assets/fonts/Sora-SemiBold.ttf'),
    });

    if (!fontsLoaded && !fontError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <UserProvider>
                    <IndexProvider> {/* Add IndexProvider here */}
                        <ForexProvider>
                            <SafeAreaViewWrapper />
                        </ForexProvider>
                    </IndexProvider>
                </UserProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

function SafeAreaViewWrapper() {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const { user, token, loading } = useContext(UserContext); // Move context usage here
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        if (loading) return;

        const normalizedPath = pathname.toLowerCase().replace(/^\/|\/$/g, '');
        const isLoginRoute = normalizedPath.includes('login');

        if (user && token && !isLoginRoute && !hasRedirected) {
            setHasRedirected(true);
            router.replace('/(root)/(tabs)');
        } else if (!user && !token && !isLoginRoute && !hasRedirected) {
            setHasRedirected(true);
            router.replace('/(auth)/login');
        }
    }, [loading, user, token, pathname, hasRedirected]);

    const normalizedPath = pathname.toLowerCase().replace(/^\/|\/$/g, '');
    const isTradeAlertsRoute = normalizedPath.includes('tradealertscreens/tradealerts');
    const statusBarColor = isTradeAlertsRoute ? '#723CDF' : '#000';

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: '#000',
            }}
            edges={['top', 'left', 'right']}
        >
            <View
                style={{
                    height: insets.top,
                    backgroundColor: statusBarColor,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                }}
            />
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: '#000',
                        paddingBottom: insets.bottom,
                    },
                }}
            >
                <Stack.Screen name="(root)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaView>
    );
}