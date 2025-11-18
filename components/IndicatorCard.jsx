import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 20) / 2; // 40px horizontal padding + 20px total gap (10px each side)

const IndicatorCard = ({ name, svg, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.touchable}>
            <LinearGradient
                colors={['#D2BDFF', '#0C0C1800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.3, y: 0.3 }}
                style={styles.gradientBorder}
            >
                <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
                    <View style={styles.content}>
                        {/* SVG Payoff Diagram */}
                        <View style={styles.svgWrapper}>
                            {svg}
                        </View>

                        {/* Strategy Name */}
                        <Text style={styles.name} numberOfLines={2}>
                            {name}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default IndicatorCard;

const styles = StyleSheet.create({
    touchable: {
        marginHorizontal: 5,
        marginBottom: 12,
    },
    gradientBorder: {
        borderRadius: 25,
        padding: 1.5, // thickness of gradient border
    },
    cardContainer: {
        backgroundColor: '#000',
        borderRadius: 25,
        overflow: 'hidden',
    },
    content: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    svgWrapper: {
        width: 140,
        height: 100,
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Sora-Regular', // or 'Sora-SemiBold' if you want bolder
        textAlign: 'center',
        lineHeight: 20,
    },
});