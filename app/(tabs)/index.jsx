import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Index = () => {
  return (
    <View className="flex-1 justify-center items-center bg-[#000]">
      <Text className="text-white text-2xl font-[SpaceMono] font-bold">
        Home
      </Text>
      <Text className="text-white text-lg font-[SpaceMono]">
        Welcome to the Home screen.
      </Text>
    </View>
  )
}

export default Index

const styles = StyleSheet.create({})