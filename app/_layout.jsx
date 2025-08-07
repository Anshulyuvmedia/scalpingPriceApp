// app/_layout.jsx
import { Stack, usePathname } from 'expo-router';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import './globals.css'

// Prevent the splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const pathname = usePathname();

    // Normalize the pathname and check for the tradealerts route
    const normalizedPath = pathname.toLowerCase().replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes
    const isTradeAlertsRoute = normalizedPath.includes('tradealertscreens/tradealerts');
    const statusBarColor = isTradeAlertsRoute ? '#723CDF' : '#000'; // Purple for tradealerts, black for others

    // Load the fonts
    const [fontsLoaded, fontError] = useFonts({
        'Questrial-Regular': require('../assets/fonts/Questrial-Regular.ttf'),
        'Sora-Regular': require('../assets/fonts/Sora-Regular.ttf'),
        'Sora-Bold': require('../assets/fonts/Sora-Bold.ttf'),
        'Sora-ExtraBold': require('../assets/fonts/Sora-ExtraBold.ttf'),
        'Sora-Medium': require('../assets/fonts/Sora-Medium.ttf'),
        'Sora-Light': require('../assets/fonts/Sora-Light.ttf'),
        'Sora-SemiBold': require('../assets/fonts/Sora-SemiBold.ttf'),
    });

    // Hide splash screen once fonts are loaded or if there's an error
    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    // Render nothing until fonts are loaded and no error occurs
    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <SafeAreaViewWrapper statusBarColor={statusBarColor} />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

function SafeAreaViewWrapper({ statusBarColor }) {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: '#000', // Set global black background for all screens
                // paddingBottom: insets.bottom, // Add padding to account for bottom navigation bar
            }}
            edges={['top', 'left', 'right']} // Exclude bottom edge to manually handle insets.bottom
        >
            {/* View to simulate the status bar background */}
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
                        paddingBottom: insets.bottom, // Ensure Stack content respects bottom inset
                    },
                }}
            >
                <Stack.Screen name="(root)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaView>
    );
}