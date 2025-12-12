// app/broker/auth/DhanOAuth.jsx
import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useUser } from '@/contexts/UserContext';
import { useBroker } from '@/contexts/BrokerContext';
import { useRouter } from 'expo-router';

const BASE_URL = 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev/api/BrokerConnections';

export default function DhanOAuth() {
    const { appToken } = useUser();           // ← Only to start OAuth
    const { setBrokerToken, refreshPortfolio } = useBroker();
    const router = useRouter();
    const [loginUrl, setLoginUrl] = useState(null);
    const webviewRef = useRef(null);

    useEffect(() => {
        const startLogin = async () => {
            try {
                const res = await fetch(`${BASE_URL}/start-login`, {
                    headers: { Authorization: `Bearer ${appToken}` },
                });
                const data = await res.json();
                setLoginUrl(data.loginUrl);
            } catch (err) {
                alert('Failed to start Dhan login');
                router.back();
            }
        };
        if (appToken) startLogin();
    }, [appToken]);

    const handleMessage = (event) => {
        const data = event.nativeEvent.data;

        try {
            const msg = JSON.parse(data);

            if (msg.type === 'DHAN_OAUTH_SUCCESS' && msg.brokerToken) {
                // SUCCESS: Save broker token ONLY
                setBrokerToken(msg.brokerToken);
                refreshPortfolio();
                router.back();
                return;
            }
        } catch (e) { }

        if (data === 'DHAN_OAUTH_SUCCESS') {
            refreshPortfolio();
            router.back();
        }
    };

    if (!loginUrl) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#00D09C" />
                <Text style={styles.text}>Preparing Dhan login...</Text>
            </View>
        );
    }

    return (
        <WebView
            ref={webviewRef}
            source={{ uri: loginUrl }}
            onMessage={handleMessage}
            injectedJavaScript={`
        (function() {
            window.originalPostMessage = window.postMessage;
            window.postMessage = function(message) {
                window.ReactNativeWebView.postMessage(message);
            };
        })();
        true;
    `}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#00D09C" />
                    <Text style={styles.text}>Loading Dhan login...</Text>
                </View>
            )}
            style={{ backgroundColor: '#000' }}
        />

    );
}

const styles = StyleSheet.create({
    loading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#FFF',
        marginTop: 20,
        fontSize: 16,
    },
});