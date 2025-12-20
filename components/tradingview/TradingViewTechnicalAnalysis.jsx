// components/TradingViewTechnicalAnalysis.jsx
import React, { useState } from 'react';

import { WebView } from 'react-native-webview';
import { Dimensions, View, ActivityIndicator, StyleSheet } from 'react-native';

const TradingViewTechnicalAnalysis = ({ symbol }) => {
    const displaySymbol = symbol.trim().toUpperCase();
    const tvSymbol = `NSE:${displaySymbol}`;

    // Half screen height for responsive layout
    const screenHeight = Dimensions.get('window').height;
    const widgetHeight = screenHeight / 2;
    const [loading, setLoading] = useState(true);

    const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                    background: transparent;
                    overflow: hidden;
                }
                .tradingview-widget-container {
                    height: 100%;
                    width: 100%;
                }
                .tradingview-widget-container__widget {
                    height: 100%;
                    width: 100%;
                }
            </style>
        </head>
        <body>
            <div class="tradingview-widget-container">
                <div class="tradingview-widget-container__widget"></div>
                <script
                    type="text/javascript"
                    src="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                    async
                >
                {
                    "interval": "1D",
                    "width": "100%",
                    "height": "100%",
                    "isTransparent": true,
                    "colorTheme": "dark",
                    "locale": "en",
                    "symbol": "${tvSymbol}",
                    "showIntervalTabs": true,
                    "displayMode": "single"
                }
                </script>
            </div>
        </body>
    </html>
    `;

    return (
        <View style={[styles.container, { height: widgetHeight }]}>
            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#22ab94" />
                </View>
            )}
            <WebView
                source={{ html }}
                style={{
                    width: '100%',
                    height: widgetHeight,
                    backgroundColor: 'transparent',
                }}
                scrollEnabled={false}
                bounces={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                allowsInlineMediaPlayback={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
            />
        </View>

    );
};

export default TradingViewTechnicalAnalysis;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#0F0F0F',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F0F0F',
        zIndex: 10,
    },
});