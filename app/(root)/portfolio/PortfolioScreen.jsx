// app/portfolio/PortfolioScreen.jsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, Animated, Pressable, } from 'react-native';
import { TabView } from 'react-native-tab-view';
import LinearGradient from 'react-native-linear-gradient';
import HomeHeader from '@/components/HomeHeader';
import PortfolioTabs from './PortfolioViews/PortfolioTabs';
import OpenPosition from './OpenPositions/OpenPosition';

const PortfolioScreen = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'portfolio', title: 'Portfolio' },
        { key: 'open', title: 'Open Position' },
    ]);

    const [layout, setLayout] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setLayout(window);
        });
        return () => subscription?.remove();
    }, []);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'portfolio':
                return <PortfolioTabs />;
            case 'open':
                return <OpenPosition />;
            default:
                return null;
        }
    };

    const renderTabBar = (props) => {
        const { navigationState, position } = props;
        const currentIndex = navigationState.index;

        return (
            <View style={styles.tabBarWrapper}>
                <View style={styles.tabBar}>

                    {/* Animated Pill */}
                    <Animated.View
                        style={[
                            styles.animatedPill,
                            {
                                transform: [
                                    {
                                        translateX: position.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [8, layout.width / 2 - 15],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#723CDF', '#9E68E4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.pillGradient}
                        />
                    </Animated.View>

                    {/* Tab Items */}
                    {routes.map((route, i) => {
                        const isActive = currentIndex === i;

                        return (
                            <Pressable
                                key={route.key}
                                style={styles.tabItem}
                                onPress={() => setIndex(i)}   // ← tab switch
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        isActive && styles.activeTabText,
                                    ]}
                                >
                                    {route.title}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <HomeHeader page="chatbot" title="My Portfolio" />
            </View>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
                swipeEnabled={false}
                initialLayout={{ width: layout.width }}
                lazy={true}
                animationEnabled={true}
            />
        </View>
    );
};

export default PortfolioScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { paddingHorizontal: 16, paddingBottom: 4 },
    tabBarWrapper: { paddingHorizontal: 16, paddingBottom: 5 },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#111111',
        borderRadius: 30,
        height: 56,
        position: 'relative',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.37,
        shadowRadius: 12,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    tabText: {
        fontSize: 15.8,
        color: '#777777',
        fontFamily: Platform.select({
            ios: 'Questrial-Regular',
            android: 'Questrial',
        }),
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    animatedPill: {
        position: 'absolute',
        left: 0,
        top: 6,
        width: '48%',
        height: 44,
        borderRadius: 26,
        zIndex: 1,
    },
    pillGradient: { flex: 1, borderRadius: 26 },
});