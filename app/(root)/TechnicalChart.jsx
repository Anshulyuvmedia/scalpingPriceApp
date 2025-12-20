import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import HomeHeader from '@/components/HomeHeader';

const TechnicalChart = () => {
    const { symbol } = useLocalSearchParams();

    const displaySymbol = String(symbol || '').trim().toUpperCase();
    const tvSymbol = `BSE:${displaySymbol}`;

    // 🔒 Lock orientation to landscape when screen mounts
    useEffect(() => {
        ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
        );

        // 🔓 Unlock when leaving screen
        return () => {
            ScreenOrientation.unlockAsync();
        };
    }, []);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                background: #000;
                overflow: hidden;
            }
            #chart {
                width: 100%;
                height: 100%;
            }
        </style>
        <script src="https://s3.tradingview.com/tv.js"></script>
    </head>
    <body>
        <div id="chart"></div>
        <script>
            new TradingView.widget({
                autosize: true,
                symbol: "${tvSymbol}",
                interval: "1D",
                timezone: "Asia/Kolkata",
                theme: "dark",
                style: "1",
                locale: "en",
                toolbar_bg: "#000000",
                hide_side_toolbar: false,
                allow_symbol_change: false,
                container_id: "chart"
            });
        </script>
    </body>
    </html>
    `;

    return (
        <View style={styles.container}>
            <HomeHeader page="chatbot" title={displaySymbol} />

            <WebView
                source={{ html }}
                style={styles.webview}
                scrollEnabled={true}
                bounces={false}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
            />
        </View>
    );
};

export default TechnicalChart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    webview: {
        flex: 1,
        backgroundColor: '#000',
    },
});
