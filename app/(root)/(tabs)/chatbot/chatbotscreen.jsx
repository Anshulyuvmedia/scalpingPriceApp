import { StyleSheet, Text, View, Dimensions, Animated } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import HomeHeader from '@/components/HomeHeader';
import PaidSignal from './paidsignal';
import FreeSignal from './freesignal';
import AIChartPatterns from './aichartpatterns';
import { Feather } from '@expo/vector-icons';

const initialLayout = { width: Dimensions.get('window').width - 20 }; // Account for paddingHorizontal: 10

const ChatbotScreen = () => {
    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: 'PaidSignal', title: 'Paid Signals', icon: 'bar-chart-2' },
        { key: 'FreeSignal', title: 'Free Signals', icon: 'trending-up' },
        { key: 'AIChartPatterns', title: 'AI Patterns', icon: 'pie-chart' },
    ]);

    const renderScene = SceneMap({
        PaidSignal: PaidSignal,
        FreeSignal: FreeSignal,
        AIChartPatterns: AIChartPatterns,
    });

    const renderTabBar = (props) => {
        const { navigationState, position } = props;
        const inputRange = routes.map((_, i) => i);

        return (
            <View style={styles.tabBarContainer}>
                <TabBar
                    {...props}
                    scrollEnabled
                    indicatorStyle={styles.tabIndicator}
                    style={styles.tabBar}
                    renderLabel={({ route, focused }) => (
                        <View style={styles.tabContainer}>
                            <Feather
                                name={route.icon}
                                size={20}
                                color={focused ? '#2563EB' : '#D1D5DB'}
                                style={styles.tabIcon} // Explicit icon styling
                            />
                            <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>
                                {route.title}
                            </Text>
                        </View>
                    )}
                    renderIndicator={(indicatorProps) => {
                        const { getTabWidth } = indicatorProps;
                        const tabWidths = routes.map((_, i) => getTabWidth(i));
                        const maxTabWidth = Math.max(...tabWidths, 1);

                        const translateX = position.interpolate({
                            inputRange,
                            outputRange: tabWidths.map((_, i) =>
                                tabWidths.slice(0, i).reduce((sum, w) => sum + w, 0)
                            ),
                        });

                        return (
                            <Animated.View
                                style={[
                                    styles.pillIndicator,
                                    {
                                        width: maxTabWidth,
                                        transform: [{ translateX }],
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={['#2563EB', '#60A5FA']} // Modern blue gradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.pillGradient}
                                />
                            </Animated.View>
                        );
                    }}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <HomeHeader page={'chatbot'} title={'Chatbot'} action={'refresh'} />

            {/* TabView */}
            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={initialLayout}
                    lazy
                    renderTabBar={renderTabBar}
                />
            </View>
        </View>
    );
};

export default ChatbotScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000', // Dark gray background
    },
    tabBarContainer: {
        paddingHorizontal: 10,
        // paddingVertical: 8,
        backgroundColor: '#000', // Darker shade for tab bar container
        borderRadius: 10,
        // marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5, // Slightly stronger shadow
    },
    tabViewContainer: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: '#000', // Matches container
        borderRadius: 10,
        overflow: 'visible', // Ensure icons are not clipped
        elevation: 0, // Avoid double shadow
    },
    tabContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: 100, // Ensure enough space for icon + text
    },
    tabIcon: {
        marginRight: 8, // Space between icon and text
    },
    tabIndicator: {
        height: 0, // Hide default indicator
        backgroundColor: 'transparent',
    },
    pillIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 2, // Thinner indicator
        zIndex: 0, // Ensure indicator stays below tabs
    },
    pillGradient: {
        flex: 1,
        borderRadius: 2,
    },
    tabLabel: {
        color: '#D1D5DB', // Light gray for inactive
        fontFamily: 'System',
        fontSize: 13,
        fontWeight: '500',
    },
    activeTabLabel: {
        color: '#2563EB', // Bright blue for active
        fontWeight: '700',
    },
});