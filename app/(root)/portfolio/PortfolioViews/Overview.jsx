// app/portfolio/Overview.jsx
import { useBroker } from '@/contexts/broker/BrokerProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';

export default function Overview() {
    const {
        summary = {},
        broker,
        profile,
        funds,
        error,
        loading,
        isLive,
        refresh,
        refreshing,
        refreshPortfolio,  // ← now works reliably
    } = useBroker();

    // console.log('profile:', profile);
    // console.log('funds:', funds);
    // console.log('summary:', summary);

    const SEGMENT_MAP = {
        E: { label: 'Equity', color: '#22c55e' },
        D: { label: 'Derivative', color: '#3b82f6' },
        C: { label: 'Currency', color: '#eab308' },
        M: { label: 'Commodity', color: '#f97316' },
    };

    const segments = (profile?.activeSegment || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const isActive = (v) => v?.toLowerCase() === 'active';
    const formatDate = (d) => d ? d.split('.')[0].split('T')[0] : '—';
    const format = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    const { currentValue = 0, availableCash = 0 } = summary;

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <Text style={styles.loadingText}>Syncing portfolio...</Text>
            </View>
        );
    }

    if (currentValue === 0 && availableCash === 0 && !refreshing) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyTitle}>No Holdings Yet</Text>
                <Text style={styles.emptySubtitle}>Your portfolio will appear here once connected</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refreshPortfolio}
                    colors={['#22c55e']}
                    tintColor="#22c55e"
                />
            }
        >
            {/* Hero Card */}
            <LinearGradient
                colors={['#020617', '#0f172a']}
                className="px-6 pt-12 pb-8 rounded-b-3xl"
            >
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-slate-400 text-sm">Portfolio Value</Text>
                        <Text className="text-white text-3xl font-extrabold mt-1">
                            {format(summary.currentValue)}
                        </Text>
                    </View>

                    <View className="items-end">
                        <Text className="text-slate-400 text-sm">Available Cash</Text>
                        <Text className="text-white text-2xl font-bold mt-1">
                            {format(summary.availableCash)}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <View className="mx-4 mt-6 rounded-2xl bg-slate-900/80 border border-white/5 p-5">
                {/* Header */}
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white text-2xl font-bold capitalize">Dhan</Text>
                        <Text className="text-slate-400 text-base mt-1">
                            Client ID: {profile.dhanClientId}
                        </Text>
                    </View>

                    <View className={`px-3 py-1 rounded-full ${isActive(profile.dataPlan) ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <Text className={`text-base font-semibold ${isActive(profile.dataPlan) ? 'text-green-400' : 'text-red-400'}`}>
                            {profile.dataPlan}
                        </Text>
                    </View>
                </View>

                {/* Segments */}
                <View className="mt-5">
                    <Text className="text-slate-400 text-base mb-2">Active Segments</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {segments.map(code => (
                            <View
                                key={code}
                                className="px-3 py-1 rounded-full border"
                                style={{ borderColor: SEGMENT_MAP[code]?.color }}
                            >
                                <Text
                                    className="text-base font-semibold"
                                    style={{ color: SEGMENT_MAP[code]?.color }}
                                >
                                    {SEGMENT_MAP[code]?.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* DDPI & MTF */}
                <View className="flex-row justify-between mt-6">
                    {[
                        { label: 'DDPI', value: profile.ddpi },
                        { label: 'MTF', value: profile.mtf },
                    ].map(item => (
                        <View key={item.label} className="w-[48%] rounded-xl bg-white/5 p-4">
                            <Text className="text-slate-400 text-base">{item.label}</Text>
                            <Text className={`mt-2 font-bold ${item.value === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                                {item.value === 'Active' ? 'Enabled' : 'Disabled'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Dates */}
                <View className="flex-row justify-between mt-6">
                    <View>
                        <Text className="text-slate-400 text-base">Token Validity</Text>
                        <Text className="text-white text-sm font-semibold mt-1">
                            {profile.tokenValidity}
                        </Text>
                    </View>

                    <View className="items-end">
                        <Text className="text-slate-400 text-base">Data Validity</Text>
                        <Text className="text-white text-sm font-semibold mt-1">
                            {formatDate(profile.dataValidity)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Live Status Indicator */}
            {/* <View className="mt-6 items-center px-4">
                {isLive ? (
                    <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-green-400" />
                        <Text className="text-green-400 text-sm font-medium">
                            Live prices active
                        </Text>
                    </View>
                ) : (
                    <View className="bg-red-500/10 px-4 py-2 rounded-full border border-red-500/30">
                        <Text className="text-red-400 text-base">
                            {error || 'Connecting to live prices…'}
                        </Text>
                    </View>
                )}
            </View> */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#020617',
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    emptyTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    emptySubtitle: {
        color: '#64748b',
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});