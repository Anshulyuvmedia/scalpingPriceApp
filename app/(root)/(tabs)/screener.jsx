// app/(tabs)/screener.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const API_URL = 'http://192.168.1.50:3000/api';

export default function Screener() {
    const [screeners, setScreeners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchScreeners = async (pull = false) => {
        try {
            if (!pull) setLoading(true);
            const res = await axios.get(`${API_URL}/screeners`);
            // console.log(res.data);
            setScreeners(res.data);
        } catch (err) {
            console.error('API Error:', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchScreeners();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchScreeners(true);
    };

    const handleCardPress = (screenerId, title, subtitle = '') => {
        router.push({
            pathname: '/StockListScreen',
            params: { screenerId, title, subtitle },
        });
    };

    const renderScreenerCard = (item) => {
        const isBreakout = item.id === 'breakouts';
        const isOverbought = item.id === 'overbought';
        const isGainers = item.id === 'gainers';

        let cardColors = ['#EDEBFF', 'transparent'];
        let borderWidth = 2;
        let iconColor = '#FFF';

        if (isBreakout) {
            cardColors = ['#FFA4E9', '#1D28FC'];
            borderWidth = 1.5;
        } else if (isOverbought) {
            cardColors = ['#FF6B6B', '#C92A2A']; // Red fiery gradient
        } else if (isGainers) {
            cardColors = ['#00D4A1', '#00A376']; // Green success gradient
        }

        return (
            <TouchableOpacity
                onPress={() => handleCardPress(item.id, item.title, item.subtitle)}
                activeOpacity={0.85}
                style={{ marginRight: 16 }}
            >
                <LinearGradient
                    colors={cardColors}
                    start={isBreakout ? { x: 1, y: 1.3 } : { x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={{
                        borderRadius: 20,
                        padding: borderWidth,
                    }}
                >
                    <View style={[
                        styles.cardInner,
                        !isBreakout && { backgroundColor: '#0F0F1A' }
                    ]}>
                        {item.icon && (
                            <FontAwesome5 name={item.icon} size={32} color={iconColor} />
                        )}

                        <Text style={styles.cardTitle} numberOfLines={2}>
                            {item.title}
                        </Text>

                        <Text style={styles.cardCount}>
                            {item.subtitle || '0 Stocks'}
                        </Text>

                        <LinearGradient
                            colors={isBreakout ? ['#EDEBFF', 'transparent'] : ['#31314D', '#0C0C18']}
                            style={styles.buttonGradient}
                        >
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>View</Text>
                                <Feather name="arrow-up-right" size={16} color="white" />
                            </View>
                        </LinearGradient>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    // Filter screeners for each row
    const breakoutItem = screeners.find(s => s.id === 'breakouts');
    const overboughtItem = screeners.find(s => s.id === 'overbought');
    const gainersItem = screeners.find(s => s.id === 'gainers');

    if (loading) {
        return (
            <View style={styles.container}>
                <HomeHeader page="algo" />
                <ActivityIndicator size="large" color="#FFA4E9" style={{ marginTop: 100 }} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA4E9" />}
        >
            <HomeHeader page="algo" />

            {/* ROW 1: Possible Breakouts */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Possible Breakouts</Text>
            </View>
            <FlatList
                horizontal
                data={breakoutItem ? [breakoutItem] : []}
                renderItem={({ item }) => renderScreenerCard(item)}
                keyExtractor={() => 'breakouts'}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />

            {/* ROW 2: Top Overbought (High Delivery Feel) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Overbought Stocks</Text>
            </View>
            <FlatList
                horizontal
                data={overboughtItem ? [overboughtItem] : []}
                renderItem={({ item }) => renderScreenerCard(item)}
                keyExtractor={() => 'overbought'}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />

            {/* ROW 3: Top Crossers (Top Gainers) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Crossers Today</Text>
            </View>
            <FlatList
                horizontal
                data={gainersItem ? gainersItem : []}
                renderItem={({ item }) => renderScreenerCard(item)}
                keyExtractor={() => 'gainers'}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    section: { paddingHorizontal: 16, marginVertical: 20 },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        fontFamily: 'Questrial-Regular',
        marginBottom: 8,
    },
    cardInner: {
        borderRadius: 18,
        padding: 22,
        width: 220,
        height: 180,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0F0F1A',
    },
    cardTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 10,
    },
    cardCount: {
        color: '#FF6BD6',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 6,
    },
    buttonGradient: { borderRadius: 30, overflow: 'hidden' },
    button: {
        backgroundColor: '#000',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 11,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: { color: '#FFF', fontSize: 15, fontFamily: 'Questrial-Regular' },
});