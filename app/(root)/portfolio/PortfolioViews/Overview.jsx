// app/portfolio/Overview.jsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useBroker } from '@/contexts/BrokerContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SummaryCard = ({ label, value = 0, change = 0, changePercent }) => {
    const showChange = change !== 0 || (changePercent != null && changePercent !== 0);
    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
            {showChange && (
                <View style={styles.changeRow}>
                    <Text style={[
                        styles.change,
                        isPositive ? styles.positive : isNegative ? styles.negative : styles.neutral
                    ]}>
                        {isPositive ? '+' : isNegative ? '-' : ''} ₹{Math.abs(change).toLocaleString('en-IN')}
                    </Text>
                    {changePercent != null && (
                        <Text style={[
                            styles.changePercent,
                            isPositive ? styles.positive : isNegative ? styles.negative : styles.neutral
                        ]}>
                            {' '}({isPositive ? '+' : isNegative ? '-' : ''}{changePercent.toFixed(2)}%)
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

export default function Overview() {
    const {
        summary = {},
        funds,
        loading,
        todayPnL = {},
        isLive,
        error
    } = useBroker();

    // console.log('summary:', summary);
    // console.log('funds:', funds);
    // console.log('loading:', loading);
    // console.log('todayPnL:', todayPnL);
    // console.log('isLive:', isLive);
    // console.log('error:', error);

    const {
        totalInvestment = 0,
        currentValue = 0,
        totalPL = 0,
        overallPnLPercent = 0,
        realisedPL = 0,
        unrealisedPL = 0,
        availableCash = 0
    } = summary;

    const format = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    if (loading) {
        return (
            <View style={styles.center}>
                <Text style={styles.loadingText}>Syncing portfolio...</Text>
            </View>
        );
    }

    if (currentValue === 0 && availableCash === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyTitle}>No Holdings Yet</Text>
                <Text style={styles.emptySubtitle}>Your portfolio will appear here once connected</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Hero Card */}
            <LinearGradient colors={["#000", "#16213E"]} style={styles.hero}>
                <Text style={styles.heroLabel}>Total Portfolio Value</Text>
                <Text style={styles.heroAmount}>{format(currentValue)}</Text>
                {/* <Text style={[
                    styles.heroPL,
                    totalPL >= 0 ? styles.positive : styles.negative
                ]}>
                    {totalPL >= 0 ? '+' : ''}{format(totalPL)} • {overallPnLPercent >= 0 ? '+' : ''}{overallPnLPercent.toFixed(2)}%
                </Text> */}
            </LinearGradient>

            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                {/*<SummaryCard
                    label="Current Value"
                    value={format(currentValue)}
                    change={unrealisedPL}
                    changePercent={totalInvestment > 0 ? (unrealisedPL / totalInvestment) * 100 : 0}
                />
                <SummaryCard
                    label="Total P&L"
                    value={format(totalPL)}
                    change={totalPL}
                    changePercent={overallPnLPercent}
                />
                <SummaryCard
                    label="Unrealised P&L"
                    value={format(unrealisedPL)}
                    change={unrealisedPL}
                />
                <SummaryCard
                    label="Realised P&L"
                    value={format(realisedPL)}
                    change={realisedPL}
                />
                <SummaryCard
                    label="Cash Balance"
                    value={format(availableCash)}
                />
                <SummaryCard
                    label="Today's P&L"
                    value={format(todayPnL.todayTotalPL || 0)}
                    change={todayPnL.todayTotalPL || 0} 
                // Optional: add % if you calculate it on backend
                />*/}
            </View>

            {/* Live Status Indicator (React Native Safe) */}
            {/* <View style={styles.statusContainer}>
                {isLive ? (
                    <View style={styles.liveStatus}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>Live prices active</Text>
                    </View>
                ) : (
                    <View style={styles.offlineStatus}>
                        <Text style={styles.offlineText}>
                            {error || "Connecting to live prices..."}
                        </Text>
                    </View>
                )}
            </View> */}
        </View>
    );
}

// Add these new styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F0F1A" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F0F1A" },
    loadingText: { color: "#888", fontSize: 16 },
    emptyTitle: { color: "#FFF", fontSize: 24, fontWeight: "700" },
    emptySubtitle: { color: "#666", fontSize: 15, marginTop: 8 },

    hero: {
        padding: 24,
        paddingTop: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        alignItems: "center",
    },
    heroLabel: { color: "#888", fontSize: 14, marginBottom: 8 },
    heroAmount: { color: "#FFF", fontSize: 38, fontWeight: "800" },
    heroPL: { fontSize: 18, fontWeight: "700", marginTop: 8 },

    positive: { color: "#05FF93" },
    negative: { color: "#FF3366" },
    neutral: { color: "#888" },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    statBox: {
        backgroundColor: "rgba(30, 30, 50, 0.7)",
        padding: 18,
        borderWidth: 1,
        borderColor: "rgba(100, 100, 150, 0.2)",
        borderRadius: 20,
        width: width * 0.45,
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    statLabel: { color: "#888", fontSize: 13, fontWeight: "600" },
    statValue: { color: "#FFF", fontSize: 22, fontWeight: "800", marginTop: 6 },

    summaryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    card: {
        backgroundColor: "rgba(30, 30, 50, 0.7)",
        borderWidth: 1,
        borderColor: "rgba(100, 100, 150, 0.2)",
        padding: 18,
        borderRadius: 20,
        width: "48%",
        marginBottom: 16,
        elevation: 3,
    },
    label: { color: "#A0A0D0", fontSize: 13, fontWeight: "600", marginBottom: 6 },
    value: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },

    changeRow: { flexDirection: "row", marginTop: 8, alignItems: "center", flexWrap: "wrap" },
    change: { fontSize: 13.5, fontWeight: "700" },
    changePercent: { fontSize: 13, fontWeight: "600", marginLeft: 4 },

    // Live Status
    statusContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    liveStatus: {
        flexDirection: "row",
        alignItems: "center",
    },
    liveDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#05FF93",
        marginRight: 8,
    },
    liveText: {
        color: "#05FF93",
        fontSize: 14,
        fontWeight: "600",
    },
    offlineStatus: {
        backgroundColor: "rgba(255, 51, 102, 0.15)",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 51, 102, 0.3)",
    },
    offlineText: {
        color: "#FF3366",
        fontSize: 14,
        textAlign: "center",
    },
});