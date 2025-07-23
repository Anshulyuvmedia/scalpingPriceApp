import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import { router } from 'expo-router';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const AlgoStrategyBuilder = () => {
    const indicators = ['RSI', 'Moving Average', 'MACD', 'Bollinger Bands', 'Stochastic Oscillator'];
    const operators = ['>', '<', '>=', '<=', '='];
    const values = ['30', '50', '70', '100', '200'];
    const [entryRules, setEntryRules] = useState([
        { id: 1, indicator: 'RSI', operator: '>', value: '30' },
        { id: 2, indicator: 'Moving Average', operator: '>', value: '50' },
    ]);
    const [exitRules, setExitRules] = useState([
        { id: 1, indicator: 'RSI', operator: '>', value: '70' },
    ]);

    const addEntryRule = () => {
        const newId = entryRules.length > 0 ? Math.max(...entryRules.map(rule => rule.id)) + 1 : 1;
        setEntryRules([...entryRules, { id: newId, indicator: 'RSI', operator: '>', value: '30' }]);
    };

    const deleteEntryRule = (id) => {
        setEntryRules(entryRules.filter(rule => rule.id !== id));
    };

    const addExitRule = () => {
        const newId = exitRules.length > 0 ? Math.max(...exitRules.map(rule => rule.id)) + 1 : 1;
        setExitRules([...exitRules, { id: newId, indicator: 'RSI', operator: '>', value: '70' }]);
    };

    const deleteExitRule = (id) => {
        setExitRules(exitRules.filter(rule => rule.id !== id));
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerbox}>
                <HomeHeader />
            </View>

            {/* News and FX Signal Buttons */}
            <View style={styles.buttonRow}>
                <LinearGradient
                    colors={['#9E68E4', '#723CDF']}
                    start={{ x: 0.2, y: 1.2 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.buttonGradientBorder}
                >
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/algodashboard')}>
                        <Text style={styles.buttonText}>Algo Dashboard</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                    colors={['#9E68E4', '#723CDF']}
                    start={{ x: 0.2, y: 1.2 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.buttonGradientBorder}
                >
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/algostrategybuilder')}>
                        <Text style={styles.buttonText}>Strategy Builder</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            <ScrollView style={styles.scollerbox}>
                <View style={styles.mainbox}>
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.algobox}>
                            <Text className='font-sora-bold mb-3 text-white text-xl'>
                                Algo Strategy Builder
                            </Text>
                            {/* Backtest and Save Strategy Buttons */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.backtextButton}>
                                    <Feather name="play" size={20} color="black" />
                                    <Text className="font-Questrial-Regular" style={styles.actionButtonText}> Backtest</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.strategyButton}>
                                    <Feather name="save" size={20} color="white" />
                                    <Text className="font-Questrial-Regular" style={styles.actionText}> Save Strategy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainbox}>
                    {/* Strategy Details */}
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailsTitle}>Strategy Details</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Strategy Name</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <Text style={styles.inputText}>Rsi with EMA</Text>
                                    </LinearGradient>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Description</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <Text style={styles.inputText}>RSI</Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainbox}>
                    {/* Entry Rules */}
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={[styles.gradientBorder, { padding: 1 }]}
                    >
                        <View style={styles.detailsContainer}>
                            <View style={styles.ruleHeader}>
                                <Text style={styles.detailsTitle}>Entry Rules</Text>
                                <TouchableOpacity style={styles.addRuleButton} onPress={addEntryRule}>
                                    <Text style={styles.addRuleText}>+ Add Rule</Text>
                                </TouchableOpacity>
                            </View>
                            {entryRules.map((rule) => (
                                <LinearGradient
                                    colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                    start={{ x: 0.2, y: 1.2 }}
                                    end={{ x: 0, y: 0 }}
                                    style={[styles.gradientBorder, { padding: 1, marginBottom: 10, }]}
                                    key={rule.id}
                                >
                                    <View style={styles.ruleRow} >
                                        <View style={styles.conditionGroup}>
                                            <Text style={styles.label}>{rule.id === 1 ? 'IF' : 'AND'}</Text>
                                            <View className="flex-column">
                                                <View className="flex-row mb-2 gap-2">
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorder}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.indicator}
                                                                onValueChange={(itemValue) => {
                                                                    setEntryRules(entryRules.map(r =>
                                                                        r.id === rule.id ? { ...r, indicator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {indicators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorder}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.operator}
                                                                onValueChange={(itemValue) => {
                                                                    setEntryRules(entryRules.map(r =>
                                                                        r.id === rule.id ? { ...r, operator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {operators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                </View>
                                                <View style={styles.dropdownContainer}>
                                                    <LinearGradient
                                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                        start={{ x: 0.2, y: 1.2 }}
                                                        end={{ x: 0, y: 0 }}
                                                        style={styles.gradientBorder}
                                                    >
                                                        <Picker
                                                            selectedValue={rule.value}
                                                            onValueChange={(itemValue) => {
                                                                setEntryRules(entryRules.map(r =>
                                                                    r.id === rule.id ? { ...r, value: itemValue } : r
                                                                ));
                                                            }}
                                                            style={styles.picker}
                                                            itemStyle={styles.pickerItem}
                                                        >
                                                            {values.map((item) => (
                                                                <Picker.Item label={item} value={item} key={item} />
                                                            ))}
                                                        </Picker>
                                                    </LinearGradient>
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteEntryRule(rule.id)}>
                                            <Feather name="trash-2" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainbox}>
                    {/* Exit Rules */}
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={[styles.gradientBorder, { padding: 1 }]}
                    >
                        <View style={styles.detailsContainer}>
                            <View style={styles.ruleHeader}>
                                <Text style={styles.detailsTitle}>Exit Rules</Text>
                                <TouchableOpacity style={styles.addRuleButtonRed} onPress={addExitRule}>
                                    <Text style={styles.exitRuleText}>+ Add Rule</Text>
                                </TouchableOpacity>
                            </View>
                            {exitRules.map((rule) => (

                                <LinearGradient
                                    colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                    start={{ x: 0.2, y: 1.2 }}
                                    end={{ x: 0, y: 0 }}
                                    style={[styles.gradientBorder, { padding: 1, marginBottom: 10, }]}
                                    key={rule.id}
                                >
                                    <View style={styles.ruleRow}>
                                        <View style={styles.conditionGroup}>
                                            <Text style={styles.label}>{rule.id === 1 ? 'IF' : 'AND'}</Text>
                                            <View className="flex-column">
                                                <View className="flex-row mb-2 gap-2">
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorder}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.indicator}
                                                                onValueChange={(itemValue) => {
                                                                    setExitRules(exitRules.map(r =>
                                                                        r.id === rule.id ? { ...r, indicator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {indicators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorder}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.operator}
                                                                onValueChange={(itemValue) => {
                                                                    setExitRules(exitRules.map(r =>
                                                                        r.id === rule.id ? { ...r, operator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {operators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                </View>
                                                <View style={styles.dropdownContainer}>
                                                    <LinearGradient
                                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                        start={{ x: 0.2, y: 1.2 }}
                                                        end={{ x: 0, y: 0 }}
                                                        style={styles.gradientBorder}
                                                    >
                                                        <Picker
                                                            selectedValue={rule.value}
                                                            onValueChange={(itemValue) => {
                                                                setExitRules(exitRules.map(r =>
                                                                    r.id === rule.id ? { ...r, value: itemValue } : r
                                                                ));
                                                            }}
                                                            style={styles.picker}
                                                            itemStyle={styles.pickerItem}
                                                        >
                                                            {values.map((item) => (
                                                                <Picker.Item label={item} value={item} key={item} />
                                                            ))}
                                                        </Picker>
                                                    </LinearGradient>
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExitRule(rule.id)}>
                                            <Feather name="trash-2" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainbox}>
                    {/* Risk Management */}
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailsTitle}>Risk Management</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Stop Loss (%)</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <Text style={styles.inputText}>2</Text>
                                    </LinearGradient>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Take Profit (%)</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <Text style={styles.inputText}>5</Text>
                                    </LinearGradient>
                                </View>
                            </View>
                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Max Position Size (%)</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <Text style={styles.inputText}>10</Text>
                                    </LinearGradient>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Max Daily Loss (%)</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <Text style={styles.inputText}>5</Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView>
        </View>
    );
};

export default AlgoStrategyBuilder;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerbox: {
        paddingHorizontal: 15,
    },
    scollerbox: {
        paddingHorizontal: 15,
        marginBottom: 25,
    },
    mainbox: {
        marginTop: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        borderBottomColor: '#3C3B40',
        borderWidth: 1,
        paddingBottom: 15,
        borderRadius: 20,
    },
    buttonGradientBorder: {
        borderRadius: 100,
        width: '48%',
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        fontWeight: '500',
    },
    algobox: {
        backgroundColor: '#12121c',
        padding: 15,
        borderRadius: 20,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    backtextButton: {
        flexDirection: 'row',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#05FF93',
        flexGrow: 1,
        paddingVertical: 10,
    },
    strategyButton: {
        flexDirection: 'row',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0057FF',
        flexGrow: 1,
        paddingVertical: 10,
    },
    actionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionButtonText: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        fontWeight: 'bold',
    },
    detailsContainer: {
        padding: 15,
        backgroundColor: '#12121c',
        borderRadius: 20,
    },
    detailsTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'light',
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    inputGroup: {
        width: '48%',
    },
    label: {
        color: '#A9A9A9',
        fontSize: 14,
        marginBottom: 10,
        marginRight: 5,
    },
    inputText: {
        color: '#FFF',
        fontSize: 16,
        backgroundColor: '#1d1d26',
        padding: 10,
        borderRadius: 20,
        textAlign: 'center',
    },
    ruleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    addRuleButton: {
        backgroundColor: '#05FF93',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    addRuleButtonRed: {
        backgroundColor: '#ff0505',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    addRuleText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    exitRuleText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    ruleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginBottom: 10,
        // borderWidth: 1,
        // borderColor: 'white',
        backgroundColor: '#1d1d26',
        padding: 10,
        borderRadius: 20,
    },
    conditionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    deleteButton: {
        backgroundColor: '#ff0505',
        borderRadius: 10,
        padding: 5,
    },
    dropdownContainer: {
        width: 125,
    },
    picker: {
        backgroundColor: '#1d1d26',
        color: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    pickerItem: {
        color: '#FFF',
        fontSize: 14,
        // backgroundColor: '#1d1d26',
    },
});
