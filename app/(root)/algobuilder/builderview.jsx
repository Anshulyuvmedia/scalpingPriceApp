import { StyleSheet, Text, View, Dimensions, Animated, Platform, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import FoxStrategyBuilder from './foxstrategybuilder';
import AlgoDashboard from './algodashboard';
import AlgoStrategyBuilder from './algostrategybuilder';
import HomeHeader from '@/components/HomeHeader';

const initialLayout = { width: Dimensions.get('window').width };

const BuilderView = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'AlgoDashboard', title: 'Algo Dashboard' },
        { key: 'AlgoStrategyBuilder', title: 'Strategy Builder' },
        { key: 'FoxStrategyBuilder', title: 'FOX Strategy' },
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
        FoxStrategyBuilder: FoxStrategyBuilder || (() => <Text>Loading...</Text>),
        AlgoDashboard: AlgoDashboard || (() => <Text>Loading...</Text>),
        AlgoStrategyBuilder: AlgoStrategyBuilder || (() => <Text>Loading...</Text>),
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
                    scrollEnabled={windowWidth < 700} // Adjusted for better tablet support
                    indicatorStyle={styles.tabIndicator}
                    style={styles.tabBar}
                    renderLabel={({ route, focused }) => (
                        <Pressable
                            style={styles.tabContainer}
                            accessibilityRole="tab"
                            accessibilityLabel={route.title}
                            accessible
                            onPress={() => setIndex(routes.findIndex((r) => r.key === route.key))}
                        >
                            {focused ? (
                                <LinearGradient
                                    colors={['#723CDF', '#9E68E4']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.activeTabGradient}
                                >
                                    <Text style={[styles.tabLabel, styles.activeTabLabel]} numberOfLines={1}>
                                        {route.title}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.inactiveTab}>
                                    <Text style={styles.tabLabel} numberOfLines={1}>
                                        {route.title}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
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
            <HomeHeader page="algo" />
            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: windowWidth }}
                    lazy
                    renderTabBar={renderTabBar}
                    style={styles.tabView}
                />
            </View>
        </View>
    );
};

export default BuilderView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10, // Slightly increased for better spacing
        backgroundColor: '#000',
    },
    gradientBoxBorder: {
        borderRadius: 50, // Reduced for a balanced look
        padding: 1,
        marginHorizontal: 12,
        marginBottom: 8,
    },
    tabViewContainer: {
        flex: 1,
    },
    tabView: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    tabBar: {
        backgroundColor: '#000',
        borderRadius: 50,
        // paddingVertical: 6,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 120, // Ensure consistent tab sizes
    },
    activeTabGradient: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    inactiveTab: {
        backgroundColor: 'transparent',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    tabIndicator: {
        height: 0,
        backgroundColor: 'transparent',
    },
    pillIndicator: {
        position: 'absolute',
        bottom: 5,
        height: 40, // Adjusted for better alignment
        zIndex: -1,
    },
    pillGradient: {
        flex: 1,
        borderRadius: 16,
    },
    tabLabel: {
        color: '#FFF',
        fontFamily: Platform.select({
            ios: 'Questrial-Regular',
            android: 'Questrial',
        }),
        fontSize: 15, // Slightly reduced for better fit
        textAlign: 'center',
    },
    activeTabLabel: {
        fontWeight: '600',
    },
});