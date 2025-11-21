import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import LinearGradient from 'react-native-linear-gradient';
import HomeHeader from '@/components/HomeHeader';

const SignalResult = () => {
    const { strategyId, resultData, strategyName } = useLocalSearchParams();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (resultData) {
            try {
                const parsed = JSON.parse(resultData);
                setResult(parsed);
            } catch (err) {
                console.error('Failed to parse resultData:', err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [resultData]);

    // Extract stocks from various possible keys your backend might return
    const stocks = result?.stocks ||
        result?.filteredStocks ||
        result?.recommendedStocks ||
        result?.selectedStocks ||
        result?.tickers ||
        [];

    const message = result?.message || result?.msg || 'Strategy executed successfully';

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#723CDF" />
                <Text style={styles.loadingText}>Processing result...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.bodyHeader}>
                <HomeHeader page="chatbot" title="Signal Result" />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <LinearGradient
                    colors={['#1A0033', '#4A148C', '#723CDF']}
                    style={styles.resultCard}
                >
                    <View style={styles.resultBoxCard}>
                        {/* Strategy Name */}
                        <Text style={styles.title}>
                            {strategyName || `Strategy #${strategyId}` || 'Executed Strategy'}
                        </Text>

                        {/* Strategy ID (optional) */}
                        {strategyId && (
                            <Text style={styles.id}>ID: {strategyId}</Text>
                        )}

                        {/* Success/Error Message */}
                        {message && (
                            <Text style={styles.message}>{message}</Text>
                        )}

                        {/* Selected Stocks */}
                        {stocks.length > 0 ? (
                            <>
                                <Text style={styles.subtitle}>
                                    {stocks.length} Stock{stocks.length > 1 ? 's' : ''} Selected:
                                </Text>
                                <View style={styles.stocksGrid}>
                                    {stocks.map((stock, i) => (
                                        <View key={i} style={styles.stockTag}>
                                            <Text style={styles.stockText}>{stock}</Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        ) : (
                            <Text style={styles.noData}>
                                No stocks matched the criteria.
                            </Text>
                        )}

                        {/* Optional: Show raw result in dev mode */}
                        {/* {__DEV__ && result && (
                            <Text style={styles.debug}>
                                Debug: {JSON.stringify(result, null, 2)}
                            </Text>
                        )} */}
                    </View>
                </LinearGradient>
            </ScrollView>
        </View>
    );
};

export default SignalResult;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    bodyHeader: {
        marginHorizontal: 10,
        marginTop: 10,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#AAA',
        marginTop: 16,
        fontSize: 16,
    },
    resultCard: {
        borderRadius: 24,
        padding: 2,
        elevation: 15,
        shadowColor: '#723CDF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    resultBoxCard: {
        backgroundColor: '#000',
        borderRadius: 24,
        padding: 24,
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    id: {
        color: '#D2BDFF',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'monospace',
    },
    message: {
        color: '#D2BDFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    subtitle: {
        color: '#9E68E4',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 10,
    },
    stocksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 8,
    },
    stockTag: {
        backgroundColor: '#723CDF',
        paddingHorizontal: 18,
        paddingVertical: 11,
        borderRadius: 30,
        minWidth: 110,
        elevation: 3,
    },
    stockText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 15,
    },
    noData: {
        color: '#f87171',
        fontSize: 17,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
});