import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import HomeHeader from '@/components/HomeHeader';
import { useLocalSearchParams } from 'expo-router';
import LinearGradient from 'react-native-linear-gradient';

const StrategyResult = () => {
    const { strategyName, strategyId, resultData } = useLocalSearchParams();

    const data = resultData ? JSON.parse(resultData) : null;

    // Assuming your backend returns something like: { stocks: ["RELIANCE", "TCS", ...], id: "123", message: "..." }
    const stocks = data?.stocks || data?.filteredStocks || data?.recommendedStocks || [];
    const message = data?.message || 'Strategy executed successfully';

    return (
        <View style={styles.container}>
            <View style={styles.bodyHeader}>
                <HomeHeader page="chatbot" title="Strategy Result" />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <LinearGradient
                    colors={['#1A0033', '#4A148C', '#723CDF']}
                    style={styles.resultCard}
                >
                    <View style={styles.resultBoxCard}>
                        <Text style={styles.title}>{strategyName}</Text>
                        {stocks.length > 0 ? (
                            <>
                                <Text style={styles.subtitle}>Selected Stocks:</Text>
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
                    </View>

                </LinearGradient>
            </ScrollView>
        </View>
    );
};

export default StrategyResult;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bodyHeader: { marginInline: 10 },
    content: { padding: 16 },
    resultCard: {
        borderRadius: 24,
        padding: 2,
        elevation: 10,
    },
    resultBoxCard: {
        borderRadius: 24,
        padding: 20,
        backgroundColor: 'black',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    id: {
        color: '#D2BDFF',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 16,
    },
    message: {
        color: '#AAA',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    subtitle: {
        color: '#9E68E4',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    stocksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    stockTag: {
        backgroundColor: '#723CDF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 100,
    },
    stockText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    noData: {
        color: '#f87171',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
});