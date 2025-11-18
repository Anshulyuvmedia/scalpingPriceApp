import { StyleSheet, Text, View, Dimensions, Animated, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Signals from './signals';
import IndicatorBased from './indicatorbased';
import Algo from './algo';
import HomeHeader from '@/components/HomeHeader';

const initialLayout = { width: Dimensions.get('window').width };

const AlgoView = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'Signals', title: 'Signals' },
        { key: 'IndicatorBased', title: 'Indicator Based' },
        { key: 'Algo', title: 'Algo Trading' },
    ]);
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

    // Update layout on window resize
    useEffect(() => {
        const updateLayout = () => {
            setWindowWidth(Dimensions.get('window').width);
        };
        const subscription = Dimensions.addEventListener('change', updateLayout);
        return () => subscription?.remove();
    }, []);

    const renderScene = SceneMap({
        Signals: Signals,
        IndicatorBased: IndicatorBased,
        Algo: Algo,
    });

    const renderTabBar = (props) => {
        const { navigationState, position } = props;
        const inputRange = routes.map((_, i) => i);

        return (
            <LinearGradient
                colors={['#1A1A1A', '#4B4B7A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBoxBorder}
            >
                <TabBar
                    {...props}
                    scrollEnabled={windowWidth < 600} // Enable scrolling only on smaller screens
                    indicatorStyle={styles.tabIndicator}
                    style={styles.tabBar}
                    renderLabel={({ route, focused }) => (
                        <View
                            style={styles.tabContainer}
                            accessibilityRole="tab"
                            accessibilityLabel={route.title}
                            accessible
                        >
                            {focused ? (
                                <LinearGradient
                                    colors={['#723CDF', '#9E68E4']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.activeTabGradient}
                                >
                                    <Text style={[styles.tabLabel, styles.activeTabLabel]}>
                                        {route.title}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.inactiveTab}>
                                    <Text style={styles.tabLabel}>{route.title}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    renderIndicator={(indicatorProps) => {
                        const { getTabWidth } = indicatorProps;
                        const translateX = position.interpolate({
                            inputRange,
                            outputRange: routes.map((_, i) => getTabWidth(i) * i),
                        });

                        return (
                            <Animated.View
                                style={[
                                    styles.pillIndicator,
                                    {
                                        width: getTabWidth(index),
                                        transform: [{ translateX }],
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={['#723CDF', '#9E68E4']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.pillGradient}
                                />
                            </Animated.View>
                        );
                    }}
                />
            </LinearGradient>
        );
    };

    return (
        <View style={styles.container}>
            <View className="px-3">
                <HomeHeader page="algo" />
            </View>
            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: windowWidth }}
                    lazy
                    renderTabBar={renderTabBar}
                    style={styles.tabView}
                    swipeEnabled={false}
                />
            </View>
        </View>
    );
};

export default AlgoView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 5, // Increased padding for better spacing
        backgroundColor: '#000',
    },
    gradientBoxBorder: {
        borderRadius: 50, // Softer radius
        padding: 1,
        marginHorizontal: 10,
        // marginVertical: 10,
    },
    tabViewContainer: {
        flex: 1, // Use flex to adapt to available space
    },
    tabView: {
        borderRadius: 20,
        overflow: 'hidden', // Ensure content respects border radius
    },
    tabBar: {
        backgroundColor: '#000',
        borderRadius: 50,
        // paddingVertical: 4,
        elevation: 0, // Remove shadow on Android for cleaner look
        shadowOpacity: 0, // Remove shadow on iOS
    },
    tabContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    activeTabGradient: {
        borderRadius: 50,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    inactiveTab: {
        backgroundColor: 'transparent',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    tabIndicator: {
        height: 0, // Hide default indicator
        backgroundColor: 'transparent',
    },
    pillIndicator: {
        position: 'absolute',
        bottom: 2,
        height: 45,
        zIndex: -1,
    },
    pillGradient: {
        flex: 1,
        borderRadius: 50,
    },
    tabLabel: {
        color: '#FFF',
        fontFamily: Platform.select({
            ios: 'Questrial-Regular',
            android: 'Questrial', // Android may need font name adjustment
        }),
        fontSize: 16, // Slightly larger for readability
        textAlign: 'center',
    },
    activeTabLabel: {
        fontWeight: '600', // Semi-bold for better emphasis
    },
});