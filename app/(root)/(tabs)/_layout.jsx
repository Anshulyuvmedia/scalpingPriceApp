// app/(root)/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Custom TabBarIcon component with animation
  const AnimatedTabBarIcon = ({ iconName, color, focused }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;
    const translateYAnim = useRef(new Animated.Value(focused ? -10 : 0)).current;
    const iconOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.5)).current;
    const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: focused ? 1.2 : 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: focused ? -10 : 0,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacityAnim, {
          toValue: focused ? 1 : 0.5,
          duration: 200,
          delay: focused ? 100 : 0,
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacityAnim, {
          toValue: focused ? 1 : 0,
          duration: 200,
          delay: focused ? 100 : 0,
          useNativeDriver: true,
        }),
      ]).start();
    }, [focused]);

    // Map iconName to Ionicons for active and inactive states
    const getIconName = () => {
      const iconMap = {
        home: focused ? 'home' : 'home-outline',
        chatbot: focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline',
        course: focused ? 'book' : 'book-outline',
        algo: focused ? 'hardware-chip-sharp' : 'hardware-chip-outline',
        screener: focused ? 'search' : 'search-outline',
      };
      return iconMap[iconName] || 'circle';
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: iconOpacityAnim,
          width: 50,
          height: 50,
          borderRadius: 40,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: focused ? 0 : 20,
        }}
      >
        <LinearGradient
          colors={focused ? ['#723CDF', '#FAC1EC'] : ['transparent', 'transparent']}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: focused ? 6 : 0,
            borderColor: '#25242F',
          }}
        >
          <Ionicons
            name={getIconName()}
            size={22}
            color={focused ? '#fff' : color}
          />
        </LinearGradient>
        <Animated.Text
          className={`text-xs font-questrial ${focused ? 'text-white' : 'text-gray-100'}`}
          style={{ opacity: labelOpacityAnim }}
        >
          {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
        </Animated.Text>
      </Animated.View>
    );
  };

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
          height: 70,
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
            <AnimatedTabBarIcon iconName="home" color={color} focused={focused} />
          ),
          tabBarLabel: () => null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          headerShown: false,
          title: 'Chatbot',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon iconName="chatbot" color={color} focused={focused} />
          ),
          tabBarLabel: () => null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="course"
        options={{
          headerShown: false,
          title: 'Course',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon iconName="course" color={color} focused={focused} />
          ),
          tabBarLabel: () => null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="algoscreens"
        options={{
          headerShown: false,
          title: 'Algo',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon iconName="algo" color={color} focused={focused} />
          ),
          tabBarLabel: () => null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="screener"
        options={{
          headerShown: false,
          title: 'Screener',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon iconName="screener" color={color} focused={focused} />
          ),
          tabBarLabel: () => null,
          lazy: true,
        }}
      />
    </Tabs>
  );
}