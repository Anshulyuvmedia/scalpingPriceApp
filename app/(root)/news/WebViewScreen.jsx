import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text,  } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const WebViewScreen = () => {
    const { url } = useLocalSearchParams();
    const router = useRouter();

    // console.log('WebViewScreen URL:', url);

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Invalid URL</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#999" /> <Text style={styles.closeButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
            <WebView
                source={{ uri: url }}
                style={styles.webView}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error:', nativeEvent);
                    router.back();
                }}
                startInLoadingState={true}
                scalesPageToFit={true}
                // onLoadStart={() => console.log('WebView loading:', url)}
                // onLoadEnd={() => console.log('WebView loaded:', url)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingInline: 10,
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    closeButton: {
        padding: 10,
        alignSelf: 'flex-start',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    webView: {
        flex: 1,
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#6200ea',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default WebViewScreen;