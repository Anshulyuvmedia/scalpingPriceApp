// app/portfolio/Overview.jsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useBroker } from '@/contexts/BrokerContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/* ------------------ Summary Card ------------------ */
const SummaryCard = ({ label, value = 0, change = 0, changePercent = 0 }) => {
    const isPositive = change >= 0;

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>

            {(change !== 0 || changePercent !== 0) && (
                <View style={styles.changeRow}>
                    <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
                        {isPositive ? '+' : ''}₹{Math.abs(change || 0).toLocaleString('en-IN')}
                    </Text>

                    {changePercent !== null && (
                        <Text style={[styles.changePercent, isPositive ? styles.positive : styles.negative]}>
                            {' • '}
                            {isPositive ? '+' : ''}
                            {(changePercent || 0).toFixed(2)}%
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

/* ------------------ Main Component ------------------ */
export default function Overview() {
    const { portfolio, funds, summary = {}, loading } = useBroker();

    const availableCash = funds?.availableBalance || 0;

    // Safe defaults
    const totalCurrentValue = summary.currentValue || 0;
    const totalPL = summary.totalPL || 0;
    const totalInvestment = summary.totalInvestment || 0;
    const unrealisedPL = summary.unrealisedPL || 0;
    const realisedPL = summary.realisedPL || 0;

    const totalPortfolioValue = totalCurrentValue + availableCash;

    const format = (n) => `₹${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    if (loading) {
        return (
            <View style={styles.center}>
                <Text style={styles.loadingText}>Syncing with Dhan...</Text>
            </View>
        );
    }

    if (!portfolio?.length && availableCash === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyTitle}>Portfolio Empty</Text>
                <Text style={styles.emptySubtitle}>
                    Connect your Dhan account to get started
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#1A1A2E", "#16213E"]} style={styles.hero}>
                <Text style={styles.heroLabel}>Total Portfolio Value</Text>
                <Text style={styles.heroAmount}>{format(totalPortfolioValue)}</Text>
                <Text style={[styles.heroPL, totalPL >= 0 ? styles.positive : styles.negative]}>
                    {totalPL >= 0 ? "+" : ""}{format(totalPL)} •
                    {totalInvestment > 0 ? ((totalPL / totalInvestment) * 100).toFixed(2) : "0.00"}%
                </Text>
            </LinearGradient>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Invested</Text>
                    <Text style={styles.statValue}>{format(totalInvestment)}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Cash</Text>
                    <Text style={styles.statValue}>{format(availableCash)}</Text>
                </View>
            </View>

            <View style={styles.summaryContainer}>
                <SummaryCard
                    label="Holdings Value"
                    value={format(totalCurrentValue)}
                    change={unrealisedPL}
                    changePercent={totalInvestment > 0 ? (unrealisedPL / totalInvestment) * 100 : 0}
                />
                <SummaryCard
                    label="Total P&L"
                    value={format(totalPL)}
                    change={totalPL}
                    changePercent={totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0}
                />
                <SummaryCard
                    label="Unrealised"
                    value={format(unrealisedPL)}
                    change={unrealisedPL}
                    changePercent={totalInvestment > 0 ? (unrealisedPL / totalInvestment) * 100 : 0}
                />
                <SummaryCard
                    label="Realised"
                    value={format(realisedPL)}
                    change={realisedPL}
                    changePercent={totalInvestment > 0 ? (realisedPL / totalInvestment) * 100 : 0}
                />
                <SummaryCard
                    label="Available Cash"
                    value={format(availableCash)}
                />
            </View>
        </View>
    );
}

/* ------------------ Styles ------------------ */
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

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    statBox: {
        backgroundColor: "#1A1A2E",
        padding: 16,
        borderRadius: 16,
        width: width * 0.44,
        alignItems: "center",
    },
    statLabel: { color: "#888", fontSize: 13 },
    statValue: { color: "#FFF", fontSize: 20, fontWeight: "700", marginTop: 4 },

    summaryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    card: {
        backgroundColor: "rgba(30, 30, 50, 0.6)",
        borderWidth: 1,
        borderColor: "rgba(100, 100, 150, 0.2)",
        padding: 18,
        borderRadius: 20,
        width: "48%",
        marginBottom: 14,
    },
    label: { color: "#A0A0D0", fontSize: 13, fontWeight: "600", marginBottom: 6 },
    value: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },

    changeRow: { flexDirection: "row", marginTop: 8, alignItems: "center" },
    change: { fontSize: 13, fontWeight: "700" },
    changePercent: { fontSize: 12, fontWeight: "600" },
});
