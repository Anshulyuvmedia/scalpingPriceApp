// app/_layout.tsx
import { useFonts } from 'expo-font';
import { router, Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import './globals.css';

import { BrokerProvider } from '@/contexts/broker/BrokerProvider';
import { ForexProvider } from '@/contexts/ForexContext';
import { IndexProvider } from '@/contexts/IndexContext';
import { PackageProvider } from '@/contexts/PackageContext';
import { StrategyProvider } from '@/contexts/StrategyContext';
import { UserProvider, useUser } from '@/contexts/UserContext';

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

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

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
                    <PackageProvider>
                        <IndexProvider>
                            <ForexProvider>
                                <StrategyProvider>
                                    <BrokerProvider>
                                        <AppContent />
                                    </BrokerProvider>
                                </StrategyProvider>
                            </ForexProvider>
                        </IndexProvider>
                    </PackageProvider>
                </UserProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

// Separate component — now has access to UserContext
function AppContent() {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const { user, token, loading } = useUser(); // Now safe!

    useEffect(() => {
        if (loading) return;

        const currentPath = pathname.toLowerCase().replace(/^\/|\/$/g, '');
        const isAuthRoute = currentPath.includes('login') || currentPath.includes('auth');

        if (user && token && isAuthRoute) {
            router.replace('/(root)/(tabs)');
        } else if (!user && !token && !isAuthRoute) {
            router.replace('/(auth)/login');
        }
    }, [loading, user, token, pathname]);

    const currentPath = pathname.toLowerCase().replace(/^\/|\/$/g, '');
    const isTradeAlerts = currentPath.includes('tradealertscreens/tradealerts');
    const statusBarColor = isTradeAlerts ? '#723CDF' : '#000';

    return (
        <>
            {/* StatusBar outside — no flickering */}
            <StatusBar style="light" backgroundColor={statusBarColor} />

            <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'left', 'right']}>
                {/* Custom top padding bar */}
                <View style={{
                    height: insets.top,
                    backgroundColor: statusBarColor,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                }} />

                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            backgroundColor: '#000',
                            paddingBottom: insets.bottom,
                        },
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="(root)" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                </Stack>
            </SafeAreaView>
        </>
    );
}