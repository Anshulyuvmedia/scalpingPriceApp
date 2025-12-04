// app/broker/oauth/DhanOAuthWebView.jsx
import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useUser } from '@/contexts/UserContext';
import { useBroker } from '@/contexts/BrokerContext';
import { useRouter } from 'expo-router';

const BASE_URL = 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev/api/BrokerConnections';

export default function DhanOAuthWebView() {
    const { token } = useUser();
    const { refreshPortfolio } = useBroker();
    const router = useRouter();
    const [loginUrl, setLoginUrl] = useState(null);
    const webviewRef = useRef(null);

    useEffect(() => {
        const getLoginUrl = async () => {
            try {
                const res = await fetch(`${BASE_URL}/start-login`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to start login');
                const { loginUrl } = await res.json();
                setLoginUrl(loginUrl);
            } catch (err) {
                alert('Error: ' + err.message);
                router.back();
            }
        };
        getLoginUrl();
    }, [token]);

    const handleMessage = (event) => {
        const data = event.nativeEvent.data;

        console.log("WebView message:", data); // Keep this!

        if (data.includes('DHAN_OAUTH_SUCCESS') || data.includes('DHAN_CLOSE_WEBVIEW')) {
            refreshPortfolio?.();
            router.back();
            return;
        }

        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'DHAN_OAUTH_SUCCESS' || parsed.type === 'DHAN_CLOSE_WEBVIEW') {
                refreshPortfolio?.();
                router.back();
            }
        } catch (e) {
            // ignore
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
                window.ReactNativeWebView = window.ReactNativeWebView || {};
                window.ReactNativeWebView.postMessage = window.ReactNativeWebView.postMessage || function(msg) {
                window.postMessage(msg, '*');
                };
            })();
            true;
            `}
            injectedJavaScriptBeforeContentLoad={`
                // Ensures postMessage works even if ReactNativeWebView is undefined
                window.ReactNativeWebView = window.ReactNativeWebView || {
                    postMessage: (msg) => {
                    window.parent.postMessage(msg, '*');
                    }
                };
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