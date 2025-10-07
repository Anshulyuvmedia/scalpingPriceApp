import React from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useForex } from '@/contexts/ForexContext';
import { useNavigation } from 'expo-router'; // Import useNavigation

const CommodityAlerts = () => {
    const navigation = useNavigation(); // Use hook to get navigation
    const { rates, isLoading, error } = useForex();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    const commodityRates = rates?.commodity || [];

    return (
        <View style={styles.container}>
            {commodityRates.length === 0 ? (
                <Text style={styles.noData}>No commodity alerts available</Text>
            ) : (
                <FlatList
                    data={commodityRates}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => navigation.push('fxdetails', { currencyPair: item.name, assetType: 'commodity' })}
                        >
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={[styles.rate, { color: item.changePercent > 0 ? 'green' : 'red' }]}> {item.changePercent}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.name}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    )
}

export default CommodityAlerts

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, marginTop: 20, },
    list: { paddingBottom: 20, },
    item: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    rate: { color: '#ccc', fontSize: 14 },
    noData: { color: '#fff', textAlign: 'center', marginTop: 20 },
    loading: { color: '#fff', textAlign: 'center', marginTop: 20 },
    error: { color: '#ff4444', textAlign: 'center', marginTop: 20 },
});