import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient';

const CallPut = () => {
    // Data for the Call vs Put slider
    const callPercentage = 60;
    const putPercentage = 40;

    return (
        <View>
            <Text>CallPut</Text>
            <View style={styles.sliderSection}>
                <LinearGradient
                    colors={['#402196', '#30F8EE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBoxBorder}
                >
                    <View style={styles.sliderbox}>
                        <Text style={styles.sliderTitle}>Open Interest: Call vs Put</Text>
                        <View style={styles.slider}>
                            <View style={styles.sliderLabelBox}>
                                <Text style={styles.sliderLabelLeft}>Call: {callPercentage}%</Text>
                                <Text style={styles.sliderLabelRight}>Put: {putPercentage}%</Text>
                            </View>
                            <View style={styles.sliderBar}>
                                <View style={[styles.callBar, { width: `${callPercentage}%` }]} />
                                <View style={[styles.putBar, { width: `${putPercentage}%` }]} />
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    )
}

export default CallPut

const styles = StyleSheet.create({
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 5,
        flex: 1,
    },
    sliderSection: {
        marginBottom: 20,
    },
    sliderbox: {
        backgroundColor: '#000',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderRadius: 25,
    },
    sliderTitle: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        fontWeight: '700',
        marginBottom: 10,
    },
    slider: {
        alignItems: 'center',
    },
    sliderBar: {
        flexDirection: 'row',
        width: '100%',
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    callBar: {
        backgroundColor: '#1F65FF',
    },
    putBar: {
        backgroundColor: '#20202C',
    },
    sliderLabelBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    sliderLabelLeft: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
    },
    sliderLabelRight: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
    },
})