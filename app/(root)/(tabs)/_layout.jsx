// app/(root)/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import icons from '@/constants/icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Custom TabBarIcon component with animation
  const AnimatedTabBarIcon = ({ iconName, color, focused }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
    const iconOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0.5)).current;
    const labelOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: focused ? 1.1 : 1,
          friction: 5,
          tension: 40,
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

    // Map iconName to the correct PNG based on focused state
    const getIconSource = () => {
      return focused ? icons[`${iconName}filled`] : icons[iconName];
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: iconOpacityAnim,
          width: 60,
          height: 60,
          borderRadius: 40,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: focused ? -24 : 24,
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
          <Image
            source={getIconSource()}
            style={{
              width: 26,
              height: 26,
              tintColor: focused ? '#fff' : color,
            }}
            resizeMode="contain"
          />
        </LinearGradient>
        <Animated.Text
          className={`text-sm mt-1 font-questrial ${focused ? 'text-white' : 'text-gray-100'}`}
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
          height: 80,
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