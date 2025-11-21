// components/AlgoCard.jsx
import React, { useMemo, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, Alert, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ActionSheet from './ActionSheet';
import { useStrategies } from '@/contexts/StrategyContext';

const COLORS = ['#8B8BCC', '#FA8B5C', '#93EFFF', '#93C4EC'];

const AlgoCard = ({ id, name, subtitle, date, status, onPressView, onUpdate }) => {
    const { pauseExecution, resumeExecution, cancelExecution } = useStrategies();
    const isRunning = status === 'running';
    const isQueued = status === 'queued';
    const isPaused = status === 'paused';
    const isCancelled = status === 'cancelled';
    // console.log('status', status);

    const [loading, setLoading] = useState(false);
    const [sheetType, setSheetType] = useState(null); // 'pause' | 'resume' | 'delete'

    const sheetRef = useRef(null);

    const randomColor = useMemo(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);

    const handlePauseResume = async () => {
        setLoading(true);
        try {
            if (isRunning) {
                // running → paused
                await pauseExecution(id);
            } else if (isQueued || isPaused) {
                // queued/paused → running
                await resumeExecution(id);
            }
            onUpdate?.(); // Trigger parent refresh
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
            sheetRef.current?.close();
        }
    };




    const handleCancel = async () => {
        setLoading(true);
        try {
            await cancelExecution(id);
            onUpdate?.();
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
            sheetRef.current?.close();
        }
    };

    const openSheet = (type) => {
        setSheetType(type);
        sheetRef.current?.open();
    };

    return (
        <>
            <TouchableOpacity activeOpacity={0.9}>
                <LinearGradient colors={['#D2BDFF', '#0C0C1800']} start={{ x: 0, y: 0 }} end={{ x: 0.3, y: 0.3 }} style={{ borderRadius: 25, padding: 1, margin: 5 }}>
                    <LinearGradient colors={[randomColor, '#000']} start={{ x: 0, y: 3 }} end={{ x: 0, y: 0 }} style={{ borderRadius: 25 }}>
                        <View className="rounded-[25px] px-4 py-4 w-[45vw]">
                            <Text className="text-white font-questrial text-lg mb-3">{name}</Text>

                            <View className="flex-row justify-between">
                                <View className="flex-1">
                                    <Text className="text-[#AEAED4] font-sora-light text-base">{subtitle}</Text>
                                    <Text className="text-[#AEAED4] font-sora-light text-base">{date}</Text>
                                </View>
                            </View>

                            <View className="flex-row mt-2 items-center justify-between">
                                <View className="flex-row">
                                    <Feather name="arrow-up-right" size={24} color="#05FF93" />
                                    <Text className="text-[#05FF93] text-xl ml-1">5.2%</Text>
                                </View>
                                <View
                                    className={`py-1 px-2 rounded-lg mt-2 ${status === 'running'
                                        ? 'bg-[#05FF93CC]'
                                        : status === 'queued'
                                            ? 'bg-yellow-500'
                                            : status === 'paused'
                                                ? 'bg-gray-500'
                                                : status === 'cancelled'
                                                    ? 'bg-red-500'
                                                    : 'bg-yellow-500'
                                        }`}
                                >
                                    <Text className="text-xs px-1 font-sora font-bold text-black">
                                        {status === 'running'
                                            ? 'Running'
                                            : status === 'queued'
                                                ? 'Queued'
                                                : status === 'paused'
                                                    ? 'Paused'
                                                    : status === 'cancelled'
                                                        ? 'Cancelled'
                                                        : status}
                                    </Text>
                                </View>

                            </View>

                            <View className="flex-row mt-3 justify-around items-center py-3 border-t border-[#8B8BCC4D] rounded-full">
                                <TouchableOpacity onPress={onPressView}>
                                    <Feather name="settings" size={24} color={randomColor} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => openSheet(isRunning ? 'pause' : 'resume')}
                                    disabled={loading || isCancelled}
                                >
                                    {isRunning ? (
                                        <Feather name="pause-circle" size={24} color={randomColor} />
                                    ) : (
                                        <Feather name="play-circle" size={24} color={randomColor} />
                                    )}
                                </TouchableOpacity>



                                <TouchableOpacity onPress={() => openSheet('delete')}>
                                    <Feather name="trash-2" size={24} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </TouchableOpacity>

            {/* RBSheet */}
            <ActionSheet
                refRBSheet={sheetRef}
                title={
                    sheetType === 'pause'
                        ? 'Pause Algorithm'
                        : sheetType === 'resume'
                            ? (isQueued ? 'Start Queued Algorithm' : 'Resume Algorithm')
                            : 'Cancel & Exit'
                }
                message={
                    sheetType === 'pause'
                        ? 'Are you sure you want to pause this running algorithm?'
                        : sheetType === 'resume'
                            ? (isQueued
                                ? 'Start this queued algorithm now? It will begin running immediately.'
                                : 'Resume this paused algorithm? It will start running again.')
                            : 'This will exit the position and cancel the algorithm permanently.'
                }
                confirmText={
                    sheetType === 'delete'
                        ? 'Yes, Cancel'
                        : sheetType === 'pause'
                            ? 'Pause'
                            : (isQueued ? 'Start' : 'Resume')
                }
                onConfirm={() => {
                    if (sheetType === 'delete') {
                        handleCancel();
                    } else {
                        handlePauseResume();
                    }
                }}
                loading={loading}
            />


        </>
    );
};

export default AlgoCard;
