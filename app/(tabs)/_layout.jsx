import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingTop: 10,
          height: 90,
          elevation: 5,
          backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
        },
        tabBarLabelStyle: {
          marginBottom: 4,
          fontFamily: 'SpaceMono',
        },
        unmountOnBlur: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#723CDF', '#FAC1EC'] : ['transparent', 'transparent']}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: focused ? -24 : 24,
                borderWidth: focused ? 8 : 0,
                borderColor: '#25242F',
              }}
            >
              <IconSymbol size={28} name="house.fill" color={focused ? '#fff' : color} />
            </LinearGradient>
          ),
          tabBarLabel: ({ focused }) => (

            <Text
              className={`text-sm mt-3 font-medium   ${focused ? 'text-white' : 'text-gray-100 hidden'
                }`}
            >
              Home
            </Text>
          ),
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          headerShown: false,
          title: 'Chatbot',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#723CDF', '#FAC1EC'] : ['transparent', 'transparent']}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: focused ? -24 : 24,
                borderWidth: focused ? 8 : 0,
                borderColor: '#25242F',
              }}
            >
              <IconSymbol size={28} name="message.fill" color={focused ? '#fff' : color} />
            </LinearGradient>
          ),
          tabBarLabel: ({ focused }) => (

            <Text
              className={`text-sm mt-3 font-medium   ${focused ? 'text-white' : 'text-white hidden'
                }`}
            >
              Chatbot
            </Text>
          ),
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="course"
        options={{
          headerShown: false,
          title: 'Course',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#723CDF', '#FAC1EC'] : ['transparent', 'transparent']}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: focused ? -24 : 24,
                borderWidth: focused ? 8 : 0,
                borderColor: '#25242F',
              }}
            >
              <IconSymbol size={28} name="book.fill" color={focused ? '#fff' : color} />
            </LinearGradient>
          ),
          tabBarLabel: ({ focused }) => (

            <Text
              className={`text-sm mt-3 font-medium   ${focused ? 'text-white' : 'text-white hidden'
                }`}
            >
              Course
            </Text>
          ),
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="algo"
        options={{
          headerShown: false,
          title: 'Algo',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#723CDF', '#FAC1EC'] : ['transparent', 'transparent']}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: focused ? -24 : 24,
                borderWidth: focused ? 8 : 0,
                borderColor: '#25242F',
              }}
            >
              <IconSymbol size={28} name="chart.bar.fill" color={focused ? '#fff' : color} />
            </LinearGradient>
          ),
          tabBarLabel: ({ focused }) => (

            <Text
              className={`text-sm mt-3 font-medium   ${focused ? 'text-white' : 'text-white hidden'
                }`}
            >
              Algo
            </Text>
          ),
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="screener"
        options={{
          headerShown: false,
          title: 'Screener',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#723CDF', '#FAC1EC'] : ['transparent', 'transparent']}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: focused ? -24 : 24,
                borderWidth: focused ? 8 : 0,
                borderColor: '#25242F',
              }}
            >
              <IconSymbol size={28} name="magnifyingglass" color={focused ? '#fff' : color} />
            </LinearGradient>
          ),
          tabBarLabel: ({ focused }) => (

            <Text
              className={`text-sm mt-3 font-medium   ${focused ? 'text-white' : 'text-white hidden'
                }`}
            >
              Screener
            </Text>
          ),
          lazy: true,
        }}
      />
    </Tabs>
  );
}