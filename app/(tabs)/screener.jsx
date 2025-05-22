import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const Screener = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Screener</Text>
            <Text style={styles.subtitle}>Screen content here.</Text>
        </View>
    );
};

export default Screener;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'SpaceMono',
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'SpaceMono',
    },
});