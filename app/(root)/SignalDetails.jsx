// screens/SignalDetails.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import HomeHeader from '@/components/HomeHeader';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

const SignalDetails = () => {
    const route = useRoute();
    const { signal } = route.params || {};

    const [selectedBroker, setSelectedBroker] = useState('Stratzy');
    const brokers = ['Stratzy', '5Paisa', 'AngelOne', 'IFL', 'Kotak', 'Master'];

    if (!signal) {
        return (
            <View style={styles.container}>
                <HomeHeader page="chatbot" title="Signal Details" />
                <View style={styles.centerWrapper}>
                    <Text style={styles.noData}>No signal data available</Text>
                </View>
            </View>
        );
    }

    const instrument = signal.instruments?.[0] || {};
    const currentPrice = instrument.price || 0;
    const instrumentType = instrument.type || '';
    const exchange = instrument.exchange || '';
    const lotsize = instrument.lot || 0;

    const postions = signal.optionPositionBuilder?.positions?.[0] || {};

    const parseEntryConditions = () => {
        const conds = signal.entryConditions?.conditions?.[0];
        if (!conds) return 'No entry conditions set';

        const long = conds.longIndicator
            ? `${formatIndicator(conds.longIndicator, conds.longParams)} ${formatComparator(
                conds.longComparator
            )} ${formatIndicator(conds.longSecondIndicator, conds.longSecondParams)}`
            : null;

        const short = conds.shortIndicator
            ? `${formatIndicator(conds.shortIndicator, conds.shortParams)} ${formatComparator(
                conds.shortComparator
            )} ${formatIndicator(conds.shortSecondIndicator, conds.shortSecondParams)}`
            : null;

        const parts = [];
        if (long) parts.push(`LONG: ${long}`);
        if (short) parts.push(`SHORT: ${short}`);

        return parts.length > 0 ? parts.join('\n') : 'Conditions configured (details hidden)';
    };

    const formatIndicator = (name, params) => {
        if (!name) return 'Unknown';
        const base = name.toUpperCase().replace(/-/g, ' ');
        if (!params) return base;

        const period = params?.period || params?.length;
        const type = params?.type || params?.movingAverageType;

        if (period && type) {
            return `${base}(${period}, ${type.toUpperCase()})`;
        }
        if (period) return `${base}(${period})`;
        return base;
    };

    const formatComparator = (comp) => {
        if (!comp) return '';
        return (
            {
                'crosses-above': 'crosses above',
                'crosses-below': 'crosses below',
                'greater-than': '>',
                'less-than': '<',
                equals: '=',
            }[comp] || comp
        );
    };

    const entryText = parseEntryConditions();
    const exitEnabled = signal.exitConditions?.isEnabled === true;
    const exitText = exitEnabled ? 'Exit rules active' : 'No exit conditions';

    return (
        <View style={styles.container}>
            <View className="mx-3">
                <HomeHeader page="chatbot" title="Signal Details" />
            </View>

            <View style={styles.contentWrapper}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* HERO */}
                    <LinearGradient
                        colors={['#723CDF', '#9D7BEF']}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroTopRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.strategyName}>
                                    {signal.strategyName || 'Strategy'}
                                </Text>
                                <Text style={styles.symbol}>
                                    {instrument.name || 'Symbol'}
                                </Text>
                            </View>

                            <View style={styles.liveBadge}>
                                <Feather name="zap" size={16} color="#000" />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        </View>

                        <View style={styles.heroBottomRow}>
                            <View style={styles.heroMetric}>
                                <Text style={styles.heroMetricLabel}>Current Price</Text>
                                <Text style={styles.heroMetricValue}>
                                    ₹{currentPrice.toFixed(2)}
                                </Text>
                            </View>
                            <View style={styles.heroMetric}>
                                <Text style={styles.heroMetricLabel}>Lot Size</Text>
                                <Text style={styles.heroMetricValue}>{lotsize}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* INSTRUMENT DETAILS */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Instrument Details</Text>
                        <View style={styles.cardRow}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Instrument Type</Text>
                                <Text style={styles.metricValue}>{instrumentType}</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Exchange</Text>
                                <Text style={styles.metricValue}>{exchange}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ORDER DETAILS */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Details</Text>
                        <View style={styles.cardRow}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Order Type</Text>
                                <Text style={styles.metricValue}>
                                    {signal.orderSettings?.orderType}
                                </Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Transaction</Text>
                                <Text style={styles.metricValue}>
                                    {signal.orderSettings?.transactionType}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardRow}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Chart Type</Text>
                                <Text style={styles.metricValue}>
                                    {signal.orderSettings?.chartType}
                                </Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Interval</Text>
                                <Text style={styles.metricValue}>
                                    {signal.orderSettings?.interval} min
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* POSITION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Position Settings</Text>
                        <View style={styles.card}>
                            <View style={styles.positionGrid}>
                                <PositionItem label="Long CE" value={postions.longIsCE} />
                                <PositionItem label="Short CE" value={postions.shortIsCE} />
                                <PositionItem label="Buy" value={postions.isBuy} />
                                <PositionItem label="Weekly" value={postions.isWeekly} />
                                <PositionItem label="Qty" value={postions.qty} />
                                <PositionItem
                                    label="First Selection"
                                    value={postions.firstSelection}
                                />
                                <PositionItem
                                    label="Second Selection"
                                    value={postions.secondSelection}
                                />
                                <PositionItem
                                    label="TP Selection"
                                    value={postions.tpSelection}
                                />
                                <PositionItem label="TP Value" value={postions.tpValue} />
                                <PositionItem label="TP On" value={postions.tpOn} />
                                <PositionItem
                                    label="SL Selection"
                                    value={postions.slSelection}
                                />
                                <PositionItem label="SL Value" value={postions.slValue} />
                                <PositionItem label="SL On" value={postions.slOn} />
                                <PositionItem
                                    label="Pre-punch SL"
                                    value={postions.prePunchSL}
                                />
                            </View>
                        </View>
                    </View>

                    {/* SCHEDULE */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trading Schedule</Text>
                        <View style={styles.card}>
                            <InfoRow
                                icon="clock"
                                label="Start Time"
                                value={signal.orderSettings?.startTime || '09:16'}
                            />
                            <InfoRow
                                icon="square"
                                label="Square Off"
                                value={signal.orderSettings?.squareOff || '15:15'}
                            />
                            <InfoRow
                                icon="calendar"
                                label="Days"
                                value={
                                    signal.orderSettings?.days?.join(', ') || 'MON - FRI'
                                }
                            />
                            {signal.orderSettings?.interval && (
                                <InfoRow
                                    icon="bar-chart-2"
                                    label="Interval"
                                    value={`${signal.orderSettings.interval} min`}
                                    showDivider={false}
                                />
                            )}
                        </View>
                    </View>

                    {/* ENTRY CONDITIONS */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Entry Conditions</Text>
                        <View style={styles.conditionBox}>
                            <Text style={styles.conditionText}>{entryText}</Text>
                        </View>
                    </View>

                    {/* EXIT CONDITIONS */}
                    {exitEnabled && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Exit Conditions</Text>
                            <View style={styles.conditionBox}>
                                <Text style={styles.conditionText}>{exitText}</Text>
                            </View>
                        </View>
                    )}

                    {/* RISK MANAGEMENT */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Risk Management</Text>
                        <View style={styles.cardRow}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Max Trades / Day</Text>
                                <Text style={styles.metricValue}>
                                    {signal.riskManagement?.total || 'Unlimited'}
                                </Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Every Increase</Text>
                                <Text style={styles.metricValue}>
                                    {signal.riskManagement?.trailProfit?.everyIncrease}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardRow}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Trail Profit By</Text>
                                <Text style={styles.metricValue}>
                                    {signal.riskManagement?.trailProfit?.trailProfitBy}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* BROKER SELECTION */}
                    <View style={[styles.section, { marginBottom: 8 }]}>
                        <Text style={styles.sectionTitle}>Execute with Broker</Text>
                        <View style={styles.card}>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={brokers}
                                keyExtractor={(i) => i}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setSelectedBroker(item)}
                                        style={[
                                            styles.brokerChip,
                                            selectedBroker === item
                                                ? styles.brokerActive
                                                : styles.brokerInactive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.brokerText,
                                                selectedBroker === item && styles.brokerTextActive,
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.brokerListContent}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* EXECUTE BUTTON (STICKY) */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.executeBtn}>
                        <Text style={styles.executeText}>
                            Execute with {selectedBroker}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const PositionItem = ({ label, value }) => (
    <View style={styles.positionItem}>
        <Text style={styles.positionLabel}>{label}</Text>
        <Text style={styles.positionValue}>
            {value !== undefined && value !== null && value !== ''
                ? String(value)
                : '-'}
        </Text>
    </View>
);

const InfoRow = ({ icon, label, value, showDivider = true }) => (
    <>
        <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
                <Feather name={icon} size={16} color="#C1A5FF" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
        {showDivider && <View style={styles.infoDivider} />}
    </>
);

export default SignalDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050509',
    },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },

    // HERO
    heroGradient: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 18,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 18,
    },
    strategyName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'Sora-SemiBold',
    },
    symbol: {
        fontSize: 13,
        color: '#E6E2FF',
        marginTop: 4,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#05FF93',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    liveText: {
        color: '#000',
        fontWeight: '700',
        marginLeft: 6,
        fontSize: 11,
    },
    heroMetric: {
        flex: 1,
    },
    heroMetricLabel: {
        fontSize: 11,
        color: '#E3D9FF',
        opacity: 0.9,
    },
    heroMetricValue: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '700',
        marginTop: 4,
    },

    // SECTIONS
    section: {
        paddingHorizontal: 16,
        marginTop: 18,
    },
    sectionTitle: {
        color: '#C1A5FF',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },

    // CARDS & GRID
    card: {
        backgroundColor: '#0B0B12',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#181828',
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 10,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#0B0B12',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#181828',
    },
    metricLabel: {
        color: '#8A8FA6',
        fontSize: 12,
    },
    metricValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'capitalize',
    },

    // POSITION GRID
    positionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    positionItem: {
        width: '48%',
        backgroundColor: '#10101A',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    positionLabel: {
        fontSize: 11,
        color: '#8A8FA6',
    },
    positionValue: {
        marginTop: 3,
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // INFO ROWS
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    infoIconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 999,
        backgroundColor: '#181828',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    infoLabel: {
        color: '#8A8FA6',
        fontSize: 11,
    },
    infoValue: {
        color: '#FFFFFF',
        fontSize: 14,
        marginTop: 2,
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#151523',
        marginVertical: 4,
    },

    // CONDITIONS
    conditionBox: {
        backgroundColor: '#05070E',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1B1B2B',
    },
    conditionText: {
        color: '#7CF2BD',
        fontSize: 13,
        fontFamily: 'monospace',
        lineHeight: 20,
    },

    // BROKER
    brokerListContent: {
        paddingVertical: 4,
    },
    brokerChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        marginRight: 8,
        borderWidth: 1,
    },
    brokerActive: {
        backgroundColor: '#723CDF',
        borderColor: '#723CDF',
    },
    brokerInactive: {
        backgroundColor: 'transparent',
        borderColor: '#26263A',
    },
    brokerText: {
        color: '#A4A8C0',
        fontSize: 13,
        fontWeight: '500',
    },
    brokerTextActive: {
        color: '#FFFFFF',
    },

    // FOOTER BUTTON
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
        backgroundColor: 'rgba(5,5,9,0.96)',
        borderTopWidth: 1,
        borderTopColor: '#141425',
    },
    executeBtn: {
        backgroundColor: '#723CDF',
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    executeText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // STATE
    noData: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
        opacity: 0.8,
    },
    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
