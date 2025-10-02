// app/(root)/(tabs)/chatbot/PaidSignal.jsx
import { StyleSheet, Text, View, Dimensions, Animated, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import IndexTab from './tabview/IndexTab';
import StocksTab from './tabview/StocksTab';
import FutureTab from './tabview/FutureTab';
import useSignals from '../../../../utils/useSignals';

const initialLayout = { width: Dimensions.get('window').width - 20 };

const PaidSignal = () => {
    const [index, setIndex] = useState(0);
    const { signals, loading, error, refresh } = useSignals('Paid');

    const [routes] = useState([
        { key: 'index', title: 'Index' },
        { key: 'stocks', title: 'Stocks' },
        { key: 'futures', title: 'Futures' },
    ]);

    const renderScene = SceneMap({
        index: () => <IndexTab signals={signals.index} loading={loading} error={error} onRefresh={refresh} />,
        stocks: () => <StocksTab signals={signals.stocks} loading={loading} error={error} onRefresh={refresh} />,
        futures: () => <FutureTab signals={signals.futures} loading={loading} error={error} onRefresh={refresh} />,
    });

    const renderTabBar = (props) => {
        const { navigationState, position } = props;
        const inputRange = routes.map((_, i) => i);

        return (
            <LinearGradient
                colors={['#222', '#AEAED4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 2, y: 0 }}
                style={styles.gradientBoxBorder}
            >
                <TabBar
                    {...props}
                    scrollEnabled
                    indicatorStyle={styles.tabIndicator}
                    style={styles.tabBar}
                    renderLabel={({ route, focused }) => (
                        <View style={styles.tabContainer}>
                            {focused ? (
                                <LinearGradient
                                    colors={['#723CDF', '#9E68E4']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.activeTabGradient}
                                >
                                    <Text style={[styles.tabLabel, styles.activeTabLabel]}>{route.title}</Text>
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
                        const tabWidths = routes.map((_, i) => getTabWidth(i));
                        const maxTabWidth = Math.max(...tabWidths, 1);

                        const translateX = position.interpolate({
                            inputRange,
                            outputRange: tabWidths.map((_, i) => tabWidths.slice(0, i).reduce((sum, w) => sum + w, 0)),
                        });

                        const scaleX = position.interpolate({
                            inputRange,
                            outputRange: tabWidths.map((width) => width / maxTabWidth),
                        });

                        return (
                            <Animated.View
                                style={[
                                    styles.pillIndicator,
                                    {
                                        width: maxTabWidth,
                                        transform: [{ translateX }, { scaleX }],
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
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
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

export default PaidSignal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
        backgroundColor: '#000',
    },
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    tabViewContainer: {
        height: 'auto',
        minHeight: 600,
    },
    tabBar: {
        backgroundColor: '#000',
        borderRadius: 24,
        position: 'relative',
    },
    tabContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    activeTabGradient: {
        borderRadius: 15,
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
        bottom: 0,
        height: 48,
        zIndex: -1,
    },
    pillGradient: {
        flex: 1,
        borderRadius: 20,
    },
    tabLabel: {
        color: '#FFF',
        fontFamily: 'Questrial-Regular',
        fontSize: 14,
        textAlign: 'center',
    },
    activeTabLabel: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    errorContainer: {
        backgroundColor: '#FF4D4D',
        padding: 10,
        marginHorizontal: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#723CDF',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
});