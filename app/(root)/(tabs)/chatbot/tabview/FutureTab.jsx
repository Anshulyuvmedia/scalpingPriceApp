// app/(root)/chatbotscreens/tabview/FutureTab.jsx
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import LineChartComponent from '../../../../../components/charts/LineChartComponent';

const FutureTab = () => {
    // Sample data for the graph (e.g., stock prices over 7 days)
    const ascendingData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [45000, 45200, 45300, 45500, 45700, 45900, 46000],
    };
    const descendingData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [46000, 45900, 45700, 45500, 45300, 45200, 45000],
    };
    const fluctuatingData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [45000, 45200, 44800, 45500, 45300, 45700, 44900],
};
    return (
        <ScrollView className="p-2" contentContainerStyle={{ paddingBottom: 24 }}>
            <LinearGradient
                colors={['#AEAED4', '#000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.2, y: 1 }}
                style={styles.gradientBoxBorder}
            >
                <View style={styles.indexBox} className="bg-black">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-white font-questrial">
                            Ascending Triangle |{' '}
                            <Text className="text-[#05FF93]">Bullish Pattern</Text>
                        </Text>
                        <Feather name="arrow-up-right" size={16} color="#05FF93" style={{ marginLeft: 6 }} />
                    </View>
                    <Text className="text-white font-soraBold text-xl mb-3">
                        Magna Electrocastings Ltd.
                    </Text>
                    <View className="flex-row justify-between mt-3">
                        <View>
                            <Text className="text-[#B0B0B0] font-questrial text-xs">Formed on</Text>
                            <Text className="text-white font-sora text-base">05 Nov 9:30 AM</Text>
                        </View>
                        <View>
                            <Text className="text-[#B0B0B0] font-questrial text-xs">Breakout Price</Text>
                            <Text className="text-white font-sora text-base">₹ 42.00</Text>
                        </View>
                        <View>
                            <Text className="text-[#B0B0B0] font-questrial text-xs">Return %</Text>
                            <View className="flex-row items-center mt-0.5">
                                <Feather name="arrow-up-right" size={16} color="#05FF93" />
                                <Text className="text-[#05FF93] font-sora text-base ml-1">10%</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View className="mt-3 items-center">
                <LineChartComponent data={ascendingData} title="Bank Nifty Trend" />
            </View>

            <View className="p-3 mb-3">
                <View className="flex-row items-start mb-4">
                    <Feather name="arrow-up-right" size={30} color="#05FF93" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text className="text-[#83838D] font-questrial text-sm flex-1">
                        Ascending Triangle Pattern - Stock prices rise 60.40% of the time with an average return of 3.60% within 10 days post-Breakout.
                    </Text>
                </View>
                <TouchableOpacity className="py-3">
                    <View className="flex-row items-center">
                        <Text className="text-[#568BFF] font-questrial text-sm mr-1.5">
                            View Past Performance
                        </Text>
                        <Feather name="arrow-right" size={18} color="#568BFF" />
                    </View>
                </TouchableOpacity>

                <LinearGradient
                    colors={['#05FF93', '#000']}
                    start={{ x: 2, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.gradientBorder}
                >
                    <View className="bg-black rounded-full px-4 py-2 flex-row justify-between items-center">
                        <Text className="text-[#05FF93] font-questrial flex-1">
                            Stock price went up by 1.1% within 4 days of breakout
                        </Text>
                        <Text className="text-[#B0B0B0] font-questrial text-sm">
                            Closed 14 hours ago
                        </Text>
                    </View>
                </LinearGradient>
            </View>


            <LinearGradient
                colors={['#AEAED4', '#000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.2, y: 1 }}
                style={styles.gradientBoxBorder}
            >
                <View style={styles.indexBox} className="bg-black">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-white font-questrial">
                            Ascending Triangle |{' '}
                            <Text className="text-[#FF0505]">Bearish Pattern</Text>
                        </Text>
                        <Feather name="arrow-down-right" size={16} color="#FF0505" style={{ marginLeft: 6 }} />
                    </View>
                    <Text className="text-white font-soraBold text-xl mb-3">
                        Magna Electrocastings Ltd.
                    </Text>
                    <View className="flex-row justify-between mt-3">
                        <View>
                            <Text className="text-[#B0B0B0] font-questrial text-xs">Formed on</Text>
                            <Text className="text-white font-sora text-base">05 Nov 9:30 AM</Text>
                        </View>
                        <View>
                            <Text className="text-[#B0B0B0] font-questrial text-xs">Breakout Price</Text>
                            <Text className="text-white font-sora text-base">₹ 42.00</Text>
                        </View>
                        <View>
                            <Text className="text-[#B0B0B0] font-questrial text-xs">Return %</Text>
                            <View className="flex-row items-center mt-0.5">
                                <Feather name="arrow-down-right" size={16} color="#FF0505" />
                                <Text className="text-[#FF0505] font-sora text-base ml-1">10%</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View className="mt-3 items-center">
                <LineChartComponent data={descendingData} title="Bank Nifty Trend" />
            </View>

            <View className="p-3">
                <View className="flex-row items-start mb-4">
                    <Feather name="arrow-down-right" size={30} color="#FF0505" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text className="text-[#83838D] font-questrial text-sm flex-1">
                        Ascending Triangle Pattern - Stock prices rise 60.40%
                        of the time with an average return of 3.60% within 10
                        days post-Breakout.
                    </Text>
                </View>
                <TouchableOpacity className="py-3">
                    <View className="flex-row items-center">
                        <Text className="text-[#568BFF] font-questrial text-sm mr-1.5">
                            View Past Performance
                        </Text>
                        <Feather name="arrow-right" size={18} color="#568BFF" />
                    </View>
                </TouchableOpacity>
                <LinearGradient
                    colors={['#FF0505', '#000']}
                    start={{ x: 2, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.gradientBorder}
                >
                    <View className="bg-black rounded-full px-4 py-2 flex-row justify-between items-center">
                        <Text className="text-[#FF0505] font-questrial flex-1">
                            Stock price went up by 1.1% within 4 days of breakout
                        </Text>
                        <Text className="text-[#B0B0B0] font-questrial text-sm">
                            Closed 14 hours ago
                        </Text>
                    </View>
                </LinearGradient>
                <LineChartComponent data={fluctuatingData} title="Bank Nifty Trend" />
            </View>
        </ScrollView>
    )
}

export default FutureTab;

const styles = StyleSheet.create({
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
    },
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    indexBox: {
        borderRadius: 25,
        padding: 15,
    },
})