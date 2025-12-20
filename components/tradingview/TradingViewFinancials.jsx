// components/tradingview/TradingViewFinancials.jsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

const TradingViewFinancials = ({ symbol }) => {
    const displaySymbol = symbol.trim().toUpperCase();
    const tvSymbol = `BSE:${displaySymbol}`; // Critical: Use NSE:RELIANCE format

    // Half screen height for responsive layout
    const screenHeight = Dimensions.get('window').height;
    const widgetHeight = screenHeight * 2;

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
                    overflow: hidden;
                }
                .tradingview-widget-container {
                    width: 100%;
                }
                .tradingview-widget-container__widget {
                    width: 100%;
                }
            </style>
        </head>
        <body>
            <div class="tradingview-widget-container">
                <div class="tradingview-widget-container__widget"></div>
                <script
                    type="text/javascript"
                    src="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
                    async
                >
                {
                    "symbol": "${tvSymbol}",
                    "colorTheme": "dark",
                    "isTransparent": true,
                    "width": "100%",
                    "height": "100%",
                    "displayMode": "regular",
                    "locale": "en"
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
                height: widgetHeight,
                backgroundColor: 'transparent',
            }}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
        />
    );
};

export default TradingViewFinancials;