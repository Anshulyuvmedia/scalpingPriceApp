// components/portfolio/PortfolioSummary.jsx
import { View, Text, StyleSheet } from 'react-native';

const SummaryCard = ({ label, amount, percent }) => {
    // Determine if percent is negative/positive/zero
    const isNegative = percent != null && percent < 0;
    const isPositive = percent != null && percent > 0;

    // Safely format percentage
    const formattedPercent =
        percent != null && isFinite(percent)
            ? `${Math.abs(percent).toFixed(2)}%`
            : `${Math.abs(percent).toFixed(2)}%`;

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.amount}>{amount}</Text>
            <Text
                style={[
                    styles.percent,
                    isNegative && styles.negative,
                    isPositive && styles.positive,
                ]}
            >
                {isNegative ? '(-' : '('}
                {formattedPercent}
                {isNegative ? ')' : isPositive ? ')' : ')'}
            </Text>
        </View>
    );
};

export default function PortfolioSummary({
    totalInvestment,
    totalCurrentValue,
    totalPL,
    totalUnrealisedPL,
    totalRealisedPL,
    totalDaysPL,
}) {
    // Safe percentage calculation (prevents division by zero)
    const calcPercent = (change) =>
        totalInvestment === 0 ? null : (change / totalInvestment) * 100;

    return (
        <View style={styles.container}>
            <SummaryCard
                label="Current Value"
                amount={`₹${totalCurrentValue.toFixed(0)}`}
                percent={calcPercent(totalCurrentValue - totalInvestment)}
            />

            <SummaryCard
                label="Investment"
                amount={`₹${totalInvestment.toFixed(0)}`}
                percent={null} // No percentage
            />

            <SummaryCard
                label="Total P&L"
                amount={`₹${totalPL.toFixed(0)}`}
                percent={calcPercent(totalPL)}
            />

            <SummaryCard
                label="Unrealised P&L"
                amount={`₹${totalUnrealisedPL.toFixed(0)}`}
                percent={calcPercent(totalUnrealisedPL)}
            />

            <SummaryCard
                label="Realised P&L"
                amount={`₹${totalRealisedPL.toFixed(0)}`}
                percent={calcPercent(totalRealisedPL)}
            />

            <SummaryCard
                label="Day's P&L"
                amount={`₹${totalDaysPL.toFixed(0)}`}
                percent={calcPercent(totalDaysPL)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#2A2A40',
        padding: 14,
        borderRadius: 12,
        width: '31%',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    label: {
        color: '#A9A9A9',
        fontSize: 12,
        marginBottom: 4,
    },
    amount: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    percent: {
        color: '#888',
        fontSize: 12,
        marginTop: 3,
        fontWeight: '600',
    },
    positive: {
        color: '#05FF93', // Bright Green
    },
    negative: {
        color: '#FF0505', // Bright Red
    },
});