// screens/BrokerConnection.jsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    RefreshControl,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { MaterialIcons } from '@expo/vector-icons';
import images from '@/constants/images';
import { router } from 'expo-router';
import { useBroker } from '@/contexts/BrokerContext';
import * as Haptics from 'expo-haptics';

const brokers = [
    { id: 'dhan', name: 'Dhan', logo: images.dhanimg, description: 'Lightning fast' },
    // confirm key in images: images.angelone or images.angleone ?
    { id: 'upstox', name: 'Upstox', logo: images.upstox, description: 'Coming Soon' },
    { id: 'angelone', name: 'Angel One', logo: images.angelone ?? images.angleone, description: 'Coming Soon' },
    { id: 'groww', name: 'Groww', logo: images.groww, description: 'Coming Soon' },
];

const BrokerCard = ({ broker, isConnected, isLive, onPress }) => {
    const isAvailable = broker.id === 'dhan';
    // keep animated value stable across renders
    const scaleValueRef = React.useRef(new Animated.Value(1));

    React.useEffect(() => {
        if (isLive && isConnected) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleValueRef.current, {
                        toValue: 1.3,
                        duration: 600,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValueRef.current, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
        // when not live, ensure value reset
        scaleValueRef.current.setValue(1);
    }, [isLive, isConnected]);

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!isAvailable}
            activeOpacity={isAvailable ? 0.8 : 1}
            style={[styles.card, !isAvailable && styles.disabledCard]}
        >
            <View style={styles.cardContent}>
                <View style={styles.logoContainer}>
                    <Image source={broker.logo} style={styles.logo} resizeMode="contain" />

                    {isConnected && (
                        <View style={styles.connectedBadge}>
                            <MaterialIcons name="check" size={14} color="#000" />
                        </View>
                    )}

                    {isConnected && isLive && (
                        <Animated.View style={[styles.livePulse, { transform: [{ scale: scaleValueRef.current }] }]} />
                    )}

                    {isAvailable && !isConnected && (
                        <View style={styles.liveBadge}>
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={styles.brokerName}>{broker.name}</Text>
                    <Text style={styles.description}>{broker.description}</Text>
                </View>

                {isConnected ? (
                    <View style={styles.connectedStatus}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, isLive ? styles.liveDot : styles.connectedDot]} />
                            <Text style={[styles.statusText, isLive && styles.liveTextGlow]}>
                                {isLive ? 'LIVE' : 'Connected'}
                            </Text>
                        </View>
                    </View>
                ) : isAvailable ? (
                    <MaterialIcons name="arrow-forward-ios" size={20} color="#00D09C" />
                ) : (
                    <View style={styles.soonBadge}>
                        <Text style={styles.soonText}>Soon</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const BrokerConnection = () => {
    const { broker, isConnected, loading, error, refreshPortfolio, isLive, lastSync } = useBroker();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Haptics.selectionAsync(); // optional await
            await refreshPortfolio?.();
        } finally {
            setRefreshing(false);
        }
    }, [refreshPortfolio]);

    const [currentTime, setCurrentTime] = React.useState(new Date().toLocaleTimeString('en-IN'));

    React.useEffect(() => {
        if (isLive) {
            const timer = setInterval(() => {
                setCurrentTime(new Date().toLocaleTimeString('en-IN'));
            }, 1000);
            return () => clearInterval(timer);
        } else if (lastSync) {
            setCurrentTime(lastSync);
        }
    }, [isLive, lastSync]);

    const showError = error && !isConnected && !isLive;

    return (
        <View style={styles.container}>
            <View style={{ paddingHorizontal: 12 }}>
                <HomeHeader page="settings" title="Broker Connection" />
            </View>

            {(loading || refreshing) && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00D09C" />
                    <Text style={styles.loadingText}>
                        {refreshing ? 'Refreshing...' : 'Syncing with Dhan...'}
                    </Text>
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 15 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00D09C']} tintColor="#00D09C" />
                }
            >
                <Text style={styles.headerText}>Connect Your Broker</Text>
                <Text style={styles.subText}>
                    Link your trading account to view holdings, live PnL & place orders
                </Text>

                {isConnected && !loading && (
                    <View style={styles.syncStatus}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, isLive ? styles.liveDot : styles.connectedDot]} />
                            <Text style={styles.syncText}>
                                {isLive ? `Live • ${currentTime}` : `Connected • ${currentTime}`}
                            </Text>
                        </View>
                        {isLive && (
                            <Text style={styles.liveLabel}>Real-time updates active</Text>
                        )}
                    </View>
                )}

                {showError && (
                    <TouchableOpacity onPress={onRefresh} style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={18} color="#FF6B6B" />
                        <Text style={styles.errorText}>Sync failed • Tap to retry</Text>
                    </TouchableOpacity>
                )}

                {brokers.map((b) => (
                    <BrokerCard
                        key={b.id}
                        broker={b}
                        isConnected={b.id === 'dhan' && isConnected}
                        isLive={b.id === 'dhan' && isLive}
                        onPress={() => {
                            if (b.id === 'dhan') {
                                router.push({
                                    pathname: 'auth/BrokerForm',
                                    params: { broker: 'dhan' },
                                });
                            } else {
                                Alert.alert(
                                    `${b.name} Coming Soon`,
                                    "This broker integration is under development. We'll notify you when it's ready!",
                                    [{ text: "Got it", style: "default" }]
                                );
                            }
                        }}
                    />
                ))}

            </ScrollView>
        </View>
    );
};

export default BrokerConnection;

// styles (unchanged)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: { color: '#FFF', marginTop: 15, fontSize: 16, fontWeight: '500' },

    headerText: { color: '#FFF', fontSize: 26, fontWeight: '800', marginBottom: 8 },
    subText: { color: '#AAA', fontSize: 15, marginBottom: 30, lineHeight: 22 },

    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    disabledCard: { opacity: 0.4 },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    logoContainer: { position: 'relative', width: 70, height: 70 },
    logo: { width: 70, height: 70, borderRadius: 100, backgroundColor: '#111' },

    connectedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#00D09C',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    livePulse: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#00D09C',
        opacity: 0.4,
    },
    liveBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#00D09C',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    liveText: { color: '#000', fontSize: 10, fontWeight: '900' },

    info: { flex: 1, marginLeft: 18 },
    brokerName: { color: '#FFF', fontSize: 19, fontWeight: '700' },
    description: { color: '#00D09C', fontSize: 13.5, marginTop: 5, fontWeight: '600' },

    connectedStatus: { alignItems: 'center' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    liveDot: { backgroundColor: '#00D09C', shadowColor: '#00D09C', shadowRadius: 6, shadowOpacity: 0.9 },
    connectedDot: { backgroundColor: '#00D09C' },
    statusText: { color: '#00D09C', fontSize: 13, fontWeight: '600' },
    liveTextGlow: { textShadowColor: '#00D09C', textShadowRadius: 8 },

    soonBadge: { backgroundColor: '#333', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    soonText: { color: '#888', fontSize: 12, fontWeight: '700' },

    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,107,107,0.1)',
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FF6B6B33',
    },
    errorText: { color: '#FF6B6B', fontSize: 14, marginLeft: 6, fontWeight: '500' },

    syncStatus: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 18,
        backgroundColor: 'rgba(0,208,156,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#00D09C22',
    },
    syncText: { color: '#00D09C', fontSize: 15, fontWeight: '700' },
    liveLabel: { color: '#00D09C', fontSize: 12, marginTop: 6, opacity: 0.9, fontWeight: '500' },
});
