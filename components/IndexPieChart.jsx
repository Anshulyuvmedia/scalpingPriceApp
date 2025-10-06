import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import { useIndex } from '../contexts/IndexContext';

const screenWidth = Dimensions.get('window').width;

const IndexPieChart = () => {
    const { indicesData, loading, error } = useIndex();
    const [selectedIndex, setSelectedIndex] = useState('NIFTY 50');
    const [selectedSegment, setSelectedSegment] = useState(null);

    useEffect(() => {
        if (!loading && !error && indicesData[selectedIndex]) {
            // console.log('Chart Data for', selectedIndex, ':', indicesData[selectedIndex].data);
        }
    }, [selectedIndex, loading, error, indicesData]);

    if (loading) return <View><Text style={{ color: '#FFF', fontFamily: 'Questrial-Regular' }}>Loading...</Text></View>;
    if (error) return <View><Text style={{ color: '#FFF', fontFamily: 'Questrial-Regular' }}>{error}</Text></View>;

    const chartData = indicesData[selectedIndex]?.data || [];
    const changeText = indicesData[selectedIndex]?.change || 'N/A';

    if (!chartData || chartData.length === 0) {
        return (
            <View>
                <Text style={{ color: '#FFF', fontFamily: 'Questrial-Regular' }}>
                    No chart data available
                </Text>
            </View>
        );
    }

    const pieData = chartData.map(item => {
        const value = typeof item.value === 'number' ? item.value : (parseFloat(item.value) || 0);
        return {
            value: Math.abs(value),
            color: item.color || '#000000',
            name: item.name || 'Unknown',
            focused: selectedSegment === item.name,
            text: `${item.name}\n${value.toFixed(2)}%`,
            textColor: '#FFF',
            textSize: 14,
            fontFamily: 'Questrial-Regular',
            percentageColor: value >= 0 ? '#34C759' : '#FF3B30',
            labelPosition: 'outward',
        };
    });

    const handleSegmentPress = (item) => {
        setSelectedSegment(item.name === selectedSegment ? null : item.name);
    };

    return (
        <View style={styles.container}>
            <View style={styles.chartSection}>
                <LinearGradient
                    colors={['#444', '#AEAED4']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.gradientBorder}
                >
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownLabel}>Index:</Text>
                        <Picker
                            selectedValue={selectedIndex}
                            onValueChange={(itemValue) => {
                                setSelectedIndex(itemValue);
                                setSelectedSegment(null);
                            }}
                            style={styles.dropdown}
                            itemStyle={styles.dropdownItem}
                            dropdownIconColor="#FFF"
                        >
                            {Object.keys(indicesData).map((indexName) => (
                                <Picker.Item
                                    key={indexName}
                                    label={indexName}
                                    value={indexName}
                                />
                            ))}
                        </Picker>
                    </View>
                </LinearGradient>

                <View style={styles.chartWrapper}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={150}
                        innerRadius={50}
                        center={[screenWidth / 2, 250]}
                        innerCircleColor="#121212"
                        focusOnPress
                        sectionAutoFocus
                        onPress={handleSegmentPress}
                        focusedRadius={5}
                        focusedInnerRadius={5}
                        extraRadius={30}
                        paddingHorizontal={20}
                        paddingVertical={20}
                        showValuesAsLabels={true}
                        labelsPosition="outward"
                        showText={true}
                        showTextBackground={true}
                        textBackgroundColor="#333"
                        textBackgroundRadius={1}
                        showLabelLine={true}
                        labelLineColor="#FFF"
                        labelLineConfig={{
                            length: 30,
                            tailLength: 10,
                            color: '#FFF',
                            thickness: 1,
                            avoidOverlappingOfLabels: true,
                        }}
                        initialAngle={0}
                        style={{ height: 450, width: screenWidth }}
                        centerLabelComponent={() => (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, color: 'white', fontFamily: 'Questrial-Regular', fontWeight: 'bold' }}>
                                    {selectedIndex}
                                </Text>
                                <Text style={{ fontSize: 12, color: 'white', fontFamily: 'Questrial-Regular' }}>
                                    {changeText}
                                </Text>
                            </View>
                        )}
                        textComponent={(item) => {
                            const [name, percentage] = item.text.split('\n');
                            const displayName = name.length > 8 ? `${name.substring(0, 8)}...` : name;
                            return (
                                <Text
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                    style={{
                                        fontSize: 14,
                                        color: '#FFF',
                                        fontFamily: 'Questrial-Regular',
                                        textAlign: 'center',
                                    }}
                                >
                                    {displayName}
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: item.percentageColor,
                                            fontFamily: 'Questrial-Regular',
                                        }}
                                    >
                                        {`\n${percentage}`}
                                    </Text>
                                </Text>
                            );
                        }}
                    />
                </View>
            </View>
        </View>
    );
};

export default IndexPieChart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    chartSection: {
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
        marginHorizontal: 15,
        marginBottom: 10,
    },
    dropdownContainer: {
        width: 300,
        paddingHorizontal: 10,
        backgroundColor: '#000',
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownLabel: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: 'Questrial-Regular',
        marginRight: 8,
    },
    dropdown: {
        color: '#FFF',
        fontFamily: 'Questrial-Regular',
        fontSize: 12,
        flex: 1,
    },
    dropdownItem: {
        fontFamily: 'Questrial-Regular',
        fontSize: 14,
        color: '#FFF',
        backgroundColor: '#000',
    },
    chartWrapper: {
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
});