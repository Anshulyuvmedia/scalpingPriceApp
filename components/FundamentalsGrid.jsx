import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const FundamentalsGrid = ({ data }) => {
    const renderItem = ({ item }) => (
        <LinearGradient colors={['#2A2A3D', '#1E1E2F']} style={styles.item}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
        </LinearGradient>
    );

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
        />
    );
};

const styles = StyleSheet.create({
    row: { justifyContent: 'space-between' },
    item: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12 },
    label: { color: '#888', fontSize: 13 },
    value: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 6 },
});

export default FundamentalsGrid;