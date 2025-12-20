// components/TradingViewSymbolInfo.jsx
import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions, View, ActivityIndicator, StyleSheet } from 'react-native';

const TradingViewSymbolInfo = ({ symbol }) => {
    const displaySymbol = symbol.trim().toUpperCase();
    const tvSymbol = `BSE:${displaySymbol}`;

    const screenHeight = Dimensions.get('window').height;
    const widgetHeight = screenHeight / 2;

    const [loading, setLoading] = useState(true);

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
                    background: transparent;
                }
                .tradingview-widget-container,
                .tradingview-widget-container__widget {
                    width: 100%;
                    height: 100%;
                }
            </style>
        </head>
        <body>
            <div class="tradingview-widget-container">
                <div class="tradingview-widget-container__widget"></div>
                <script
                    src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
                >
                {
                    "symbols": ["${tvSymbol}|6M"],
                    "colorTheme": "dark",
                    "isTransparent": true,
                    "autosize": true,
                    "width": "100%"
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
                style={styles.webview}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                scrollEnabled={false}
                bounces={false}
            />
        </View>
    );
};

export default TradingViewSymbolInfo;

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
