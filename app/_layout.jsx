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
    const statusBarColor = pathname.includes('(auth)') ? '#6200ea' : '#000'; // Purple for auth, black for root
    const insets = useSafeAreaInsets(); // Get safe area insets

    // Load the Questrial-Regular font
    const [fontsLoaded, fontError] = useFonts({
        'Questrial-Regular': require('../assets/fonts/Questrial-Regular.ttf'),
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
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                    {/* View to simulate the status bar background */}
                    <View
                        style={{
                            height: insets.top, // Match the status bar height
                            backgroundColor: statusBarColor, // Custom background color
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                        }}
                    />
                    <StatusBar style="light" />
                    <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(root)" options={{ headerShown: false }} />
                    </Stack>
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}