// components/tradingview/TradingViewHotlist.jsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

const TradingViewHotlist = () => {
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
            </style>
        </head>
        <body>
            <div class="tradingview-widget-container">
                <div class="tradingview-widget-container__widget"></div>
                <script type="text/javascript"
                    src="https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js" async>
                {
                    "exchange": "NSE",              // Change to "BSE" if needed
                    "colorTheme": "dark",
                    "dateRange": "1D",              // Options: "1D", "1W", "1M", "3M", "12M"
                    "showChart": true,
                    "locale": "en",
                    "isTransparent": true,
                    "showSymbolLogo": true,
                    "showFloatingTooltip": true,
                    "width": "100%",
                    "height": "100%"
                }
                </script>
            </div>
        </body>
    </html>
    `;

    return (
        <WebView
            source={{ html }}
            // style={{ width: '100%', height: widgetHeight, backgroundColor: 'transparent' }}
            scrollEnabled={true}  // Allows scrolling through long lists
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
        />
    );
};

export default TradingViewHotlist;