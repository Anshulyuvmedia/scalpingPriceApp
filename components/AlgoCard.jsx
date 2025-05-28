// components/AlgoCard.jsx
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather, Octicons, AntDesign } from '@expo/vector-icons';

const AlgoCard = ({ id, name, profit, winRate, status }) => {
    const router = useRouter();

    return (
        <TouchableOpacity onPress={() => router.push(`/algo/${id}`)}>
            <LinearGradient
                colors={['#D2BDFF', '#0C0C1800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.3, y: 0.3 }}
                style={styles.cardGradientBorder}
            >
                <View style={styles.cardContainer}>
                    <View className="flex-row justify-between items-start">
                        {/* Algorithm Name */}
                        <Text style={styles.algoTitle} numberOfLines={2}>{name}</Text>
                        {/* Status Tag */}
                        <View style={[styles.statusTag,
                        { backgroundColor: status === 'Active' ? '#05FF93CC' : '#EAB308' },
                        ]}>
                            <Text style={[styles.statusText, { color: status === 'Active' ? '#fff' : '#000' },]}>{status}</Text>
                        </View>
                    </View>
                    {/* Metrics */}
                    <View style={styles.metricsContainer}>
                        <View style={styles.metric}>
                            <Text style={styles.metricValue}>{profit}</Text>
                            <Text style={styles.metricValue}>{winRate}</Text>
                        </View>
                    </View>
                    <View className="flex-row mt-2">
                        <Feather name="arrow-up-right" size={24} color="#05FF93" />
                        <Text className="text-[#05FF93] text-xl">5.2%</Text>
                    </View>
                    <View className="flex-row mt-2 justify-between items-center p-3 rounded-full border-white border">
                        <Feather name="settings" size={24} color="white" />
                        <Feather name="play-circle" size={24} color="white" />
                        <Feather name="trash-2" size={24} color="#05FF93" />
                    </View>

                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default AlgoCard;

const styles = StyleSheet.create({
    cardGradientBorder: {
        borderRadius: 25,
        padding: 1,
        margin: 5,
    },
    cardContainer: {
        backgroundColor: '#1e1e1e',
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'white',
        width: (Dimensions.get('window').width - 20) / 2,
        padding: 15,
    },
    statusTag: {
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 10,
        marginTop: 7,

    },
    statusText: {
        color: '#fff',
        fontFamily: 'Sora',
        fontSize: 10,
        paddingHorizontal: 5,
    },
    algoTitle: {
        color: '#fff',
        fontFamily: 'Questrial-Regular',
        fontSize: 18,
        marginBottom: 12,
        width: '60%',
        flexWrap: 'nowrap',
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metric: {
        flex: 1,
    },
    metricValue: {
        color: '#AEAED4',
        fontFamily: 'Sora',
        fontSize: 14,
    },
});