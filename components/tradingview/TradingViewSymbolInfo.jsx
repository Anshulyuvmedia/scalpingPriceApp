// components/TradingViewSymbolInfo.jsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

const TradingViewSymbolInfo = ({ symbol }) => {
    const displaySymbol = symbol.trim().toUpperCase();
    const tvSymbol = `BSE:${displaySymbol}`; // e.g., NSE:TCS

    // Get half the screen height (dynamic for different devices/orientations)
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
                src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
                async
            >
            {
                "symbols": [
                    [
                        "${displaySymbol}",
                        "${tvSymbol}|6M"
                    ]
                ],
                "chartOnly": false,
                "width": "100%",
                "height": "100%",
                "locale": "en",
                "colorTheme": "dark",
                "isTransparent": true,
                "autosize": true,
                "showVolume": true,
                "hideDateRanges": false,
                "scalePosition": "right",
                "scaleMode": "Normal",
                "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
                "fontSize": "10",
                "noTimeScale": false    ,
                "valuesTracking": "1",
                "changeMode": "price-and-percent",
                "gridLineColor": "rgba(242, 242, 242, 0.06)",
                "upColor": "#22ab94",
                "downColor": "#f7525f",
                "wickUpColor": "#22ab94",
                "wickDownColor": "#f7525f",
                "borderUpColor": "#22ab94",
                "borderDownColor": "#f7525f",
                "backgroundColor": "#0F0F0F",
                "widgetFontColor": "#DBDBDB"
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
                height: widgetHeight,   // Full width, half screen height
                backgroundColor: 'transparent' 
            }}
            scrollEnabled={false}       // Optional: disable scrolling for better feel
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
        />
    );
};

export default TradingViewSymbolInfo;