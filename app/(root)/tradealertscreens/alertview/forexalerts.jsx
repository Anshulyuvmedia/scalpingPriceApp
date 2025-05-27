import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import { FontAwesome } from '@expo/vector-icons';

const ForexAlerts = () => {
    return (
        <ScrollView>
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-white font-sora-bold">USD/CHF</Text>
                    <Text className="text-[#83838D] font-questrial">2 days ago</Text>
                </View>
                <View className="bg-red-500 rounded-full px-4 py-2">
                    <Text className="text-white">Sell Market</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center mt-3">
                <View>
                    <Text className="text-white font-sora-bold">USD/CHF CHART</Text>
                    <View className="flex-row mt-1">
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                    </View>

                </View>
            </View>
            <View className="flex-row justify-between items-center p-3 my-3">
                <View>
                    <Text className="text-[#83838D] font-questrial">Entry</Text>
                    <Text className="text-white font-sora-bold">0.86</Text>
                </View>
                <View>
                    <Text className="text-[#83838D] font-questrial">TP1</Text>
                    <Text className="text-white font-sora-bold">0.8626</Text>
                </View>
                <View>
                    <Text className="text-[#83838D] font-questrial">TP2</Text>
                    <Text className="text-white font-sora-bold">0.865</Text>
                </View>
                <View>
                    <Text className="text-[#83838D] font-questrial">TP3</Text>
                    <Text className="text-white font-sora-bold">0.8675</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center mt-3">
                <View>
                    <Text className="text-white font-sora-bold text-2xl">1110</Text>
                    <Text className="text-[#05FF92] font-sora">+306.14</Text>
                </View>
            </View>
            
        </ScrollView>
    )
}

export default ForexAlerts

const styles = StyleSheet.create({})