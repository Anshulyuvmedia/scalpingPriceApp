// components/TradingViewTechnicalAnalysis.jsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

const TradingViewTechnicalAnalysis = ({ symbol }) => {
    const displaySymbol = symbol.trim().toUpperCase();
    const tvSymbol = `NSE:${displaySymbol}`;

    // Half screen height for responsive layout
    const screenHeight = Dimensions.get('window').height;
    const widgetHeight = screenHeight / 2;

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
        <WebView
            source={{ html }}
            style={{
                width: '100%',
                height: widgetHeight,           // Half screen height
                backgroundColor: 'transparent',
            }}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
        />
    );
};

export default TradingViewTechnicalAnalysis;