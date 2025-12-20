// components/TradingViewChart.jsx
import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions, View, ActivityIndicator, StyleSheet } from 'react-native';

const TradingViewChart = ({ symbol }) => {
    // This is what the USER sees → clean, no prefix
    const displaySymbol = symbol.trim().toUpperCase();
    const tvSymbol = `BSE:${displaySymbol}`;
    const [loading, setLoading] = useState(true);
    const screenHeight = Dimensions.get('window').height;
    const widgetHeight = screenHeight;
    const html = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
            body, html { margin:0; padding:0; height:100%; background:#000; overflow:hidden; }
            #chart { width:100%; height:100%; }
            </style>
            <script src="https://s3.tradingview.com/tv.js"></script>
        </head>
        <body>
            <div id="chart"></div>
            <script>
            new TradingView.widget({
                autosize: true,
                symbol: "${tvSymbol}",           // ← TradingView gets NSE:TCS
                interval: "1Y",
                timezone: "Asia/Kolkata",
                theme: "dark",
                style: "1",
                locale: "en",
                toolbar_bg: "#1e1e2f",
                enable_publishing: true,
                hide_side_toolbar: true,
                allow_symbol_change: false,
                container_id: "chart",
                disabled_features: [
                "header_widget",
                "header_symbol_search",
                "use_localstorage_for_settings"
                ],
                overrides: {
                "paneProperties.background": "#000000",
                "paneProperties.backgroundType": "solid",
                "mainSeriesProperties.showPriceLine": true
                }
            });
            </script>
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
                style={{ height: 400, backgroundColor: '#000' }}
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

export default TradingViewChart;

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
