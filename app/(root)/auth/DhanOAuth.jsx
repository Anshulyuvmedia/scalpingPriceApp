// app/broker/auth/DhanOAuth.jsx
import { useBroker } from '@/contexts/broker/BrokerProvider';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev/api/BrokerConnections';

export default function DhanOAuth() {
    const { appToken } = useUser();
    const { setBroker, setBrokerToken, refreshPortfolio } = useBroker();
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
        const rawData = event.nativeEvent.data;
        // console.log('WebView message received:', rawData);

        let msg;
        try {
            msg = JSON.parse(rawData);

            if (msg.type === 'DHAN_OAUTH_SUCCESS' && msg.brokerToken) {
                // console.log('Saving broker token:', msg.brokerToken);  // ← FIXED: use msg, not data

                setBroker('dhan');
                setBrokerToken(msg.brokerToken);  // This will now get the correct token
                refreshPortfolio();
                router.back();
                return;
            }
        } catch (e) {
            console.warn('Failed to parse WebView message:', e);
        }

        // Fallback (unlikely to hit now)
        if (rawData === 'DHAN_OAUTH_SUCCESS') {
            setBroker('dhan');
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
            // injectedJavaScript={`
            //     (function() {
            //         window.originalPostMessage = window.postMessage;
            //         window.postMessage = function(message) {
            //             window.ReactNativeWebView.postMessage(message);
            //         };
            //     })();
            //     true;
            // `}
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