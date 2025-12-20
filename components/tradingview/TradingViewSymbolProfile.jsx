// components/tradingview/TradingViewSymbolProfile.jsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

const TradingViewSymbolProfile = ({ symbol }) => {
    const displaySymbol = symbol.trim().toUpperCase();
    const tvSymbol = `NSE:${displaySymbol}`; // Use NSE:RELIANCE format (best chance for profile data)

    // Half screen height for responsive layout
    const screenHeight = Dimensions.get('window').height;
    const widgetHeight = screenHeight;

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
                    src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
                    async
                >
                {
                    "symbol": "${tvSymbol}",
                    "width": "100%",
                    "height": "100%",
                    "colorTheme": "dark",
                    "isTransparent": true,
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
            scrollEnabled={true}  // Profile can be long
            bounces={false}
            nestedScrollEnabled={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
        />
    );
};

export default TradingViewSymbolProfile;