// screens/BrokerConnection.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { MaterialIcons } from '@expo/vector-icons';
import images from '@/constants/images';
import { router } from 'expo-router';
import { useBroker } from '@/contexts/BrokerContext';

const brokers = [
    { id: 'dhan', name: 'Dhan', logo: images.dhanimg, description: 'Zero brokerage • Lightning fast' },
    { id: 'zerodha', name: 'Zerodha', logo: images.zerodha, description: 'Coming Soon' },
    { id: 'upstox', name: 'Upstox', logo: images.upstox, description: 'Coming Soon' },
    { id: 'angelone', name: 'Angel One', logo: images.angleone, description: 'Coming Soon' },
    { id: 'groww', name: 'Groww', logo: images.groww, description: 'Coming Soon' },
];

const BrokerCard = ({ broker, isConnected, onPress }) => {
    const isAvailable = broker.id === 'dhan';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!isAvailable}
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
                        <MaterialIcons name="check-circle" size={28} color="#00D09C" />
                        <Text style={styles.connectedText}>Connected</Text>
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
    const { broker, isConnected, loading, error, refreshPortfolio } = useBroker();

    const handleBrokerPress = (brokerId) => {
        if (brokerId === 'dhan') {
            router.push({
                pathname: 'BrokerForm',
                params: { broker: 'dhan' },
            });
        } else {
            Alert.alert(
                `${brokerId.charAt(0).toUpperCase() + brokerId.slice(1)} Coming Soon`,
                "This broker integration is under development. We'll notify you when it's ready!",
                [{ text: "Got it" }]
            );
        }
    };

    // Auto-refresh when screen opens if connected
    React.useEffect(() => {
        if (isConnected) {
            refreshPortfolio();
        }
    }, [isConnected]);

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        refreshPortfolio().finally(() => setRefreshing(false));
    }, [refreshPortfolio]);

    return (
        <View style={styles.container}>
            <HomeHeader page="settings" title="Broker Connection" />

            {loading && !refreshing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00D09C" />
                    <Text style={styles.loadingText}>Syncing with Dhan...</Text>
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 15 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00D09C']}
                        tintColor="#00D09C"
                    />
                }
            >
                <Text style={styles.headerText}>Connect Your Broker</Text>
                <Text style={styles.subText}>
                    Link your trading account to view holdings, place orders & track performance
                </Text>

                {brokers.map((b) => (
                    <BrokerCard
                        key={b.id}
                        broker={b}
                        isConnected={b.id === 'dhan' && isConnected}
                        onPress={() => handleBrokerPress(b.id)}
                    />
                ))}

                {error && (
                    <TouchableOpacity onPress={onRefresh} style={styles.errorContainer}>
                        <Text style={styles.errorText}>Sync failed • Tap to retry</Text>
                    </TouchableOpacity>
                )}

                {isConnected && !loading && !error && !refreshing && (
                    <Text style={styles.successText}>
                        Last sync: {new Date().toLocaleTimeString('en-IN')}
                    </Text>
                )}

                <View style={styles.footerNote}>
                    <MaterialIcons name="info-outline" size={16} color="#888" />
                    <Text style={styles.noteText}>
                        More brokers added every week!
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default BrokerConnection;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: { color: '#FFF', marginTop: 15, fontSize: 16 },

    headerText: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 8 },
    subText: { color: '#AAA', fontSize: 15, marginBottom: 25, lineHeight: 20 },

    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    disabledCard: { opacity: 0.5 },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    logoContainer: { position: 'relative', width: 64, height: 64 },
    logo: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#111' },

    connectedBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#00D09C',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    liveBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#00D09C',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    liveText: { color: '#000', fontSize: 9, fontWeight: 'bold' },

    info: { flex: 1, marginLeft: 16 },
    brokerName: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    description: { color: '#00D09C', fontSize: 13, marginTop: 4, fontWeight: '500' },

    connectedStatus: { alignItems: 'center' },
    connectedText: { color: '#00D09C', fontSize: 12, fontWeight: '600', marginTop: 4 },

    soonBadge: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    soonText: { color: '#888', fontSize: 12, fontWeight: '600' },

    errorContainer: { alignItems: 'center', marginTop: 10 },
    errorText: { color: '#FF6B6B', fontSize: 14 },

    successText: { color: '#00D09C', textAlign: 'center', marginTop: 10, fontSize: 13, opacity: 0.8 },

    footerNote: { flexDirection: 'row', alignItems: 'center', marginTop: 30, paddingHorizontal: 10 },
    noteText: { color: '#888', fontSize: 14, marginLeft: 6, fontStyle: 'italic' },
});