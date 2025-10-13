import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import { UserContext } from '@/contexts/UserContext';
import { PackageContext } from '@/contexts/PackageContext';
import HomeHeader from '@/components/HomeHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

const GradientCard = ({ children, style }) => (
    <LinearGradient
        colors={['#000', '#AEAED4']}
        start={{ x: 0.3, y: 0.6 }}
        end={{ x: 0, y: 0 }}
        style={[styles.gradientBoxBorder, style]}
    >
        <View style={[styles.card, { backgroundColor: '#000' }]}>{children}</View>
    </LinearGradient>
);

const Package = () => {
    const insets = useSafeAreaInsets();
    const { user, setUser } = useContext(UserContext);
    const { plans, loading, error, fetchPlans, subscribeToPlan } = useContext(PackageContext);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [isError, setIsError] = useState(true);
    const rbSheetRef = useRef(null);

    const handleSubscribe = async (planId) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');
            if (!userId || !token) {
                throw new Error('Please log in to subscribe.');
            }
            console.log('user: ', userId, 'user: ', token);
            const response = await subscribeToPlan(userId, planId, token);
            if (response.success) {
                setUser({ ...user, planId, expiryDate: response.expiryDate });
                setModalTitle('Success');
                setModalContent(`Subscribed to ${response.plan.planName} successfully!`);
                setIsError(false);
                setModalVisible(true);
                rbSheetRef.current?.close();
            }
        } catch (err) {
            console.error('Error subscribing to plan:', err);
            setModalTitle('Error');
            setModalContent(err.message || 'Failed to subscribe to plan');
            setIsError(true);
            setModalVisible(true);
        }
    };

    const renderPlan = ({ item }) => (
        <GradientCard style={styles.planCard}>
            <View style={styles.planHeader}>
                <Text style={styles.planName}>{item.planName}</Text>
                <Text style={styles.planPrice}>₹{item.pricing}</Text>
            </View>
            <Text style={styles.planDuration}>
                {item.durationValue} {item.Duration}
            </Text>
            <View style={styles.featuresContainer}>
                {item.fetures.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <Feather
                            name={feature.enabled ? 'check-circle' : 'x-circle'}
                            size={16}
                            color={feature.enabled ? 'green' : '#EF4444'}
                        />
                        <Text style={styles.featureText}>{feature.title}</Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => {
                    setSelectedPlan(item);
                    rbSheetRef.current?.open();
                }}
            >
                <LinearGradient
                    colors={['#3B82F6', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                >
                    <Text style={styles.buttonText}>
                        {user?.planId === item.id ? 'Active Plan' : 'Subscribe'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </GradientCard>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <HomeHeader page="packages" title="Loading..." action="refresh" onAction={fetchPlans} />
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <HomeHeader page="packages" title="Error" action="refresh" onAction={fetchPlans} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchPlans} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HomeHeader page="packages" title="Subscription Plans" action="refresh" onAction={fetchPlans} />
            <FlatList
                data={plans}
                renderItem={renderPlan}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />
            <RBSheet
                ref={rbSheetRef}
                height={300 + insets.bottom}
                openDuration={300}
                closeOnDragDown={true}
                closeOnPressMask={false}
                customStyles={{
                    container: {
                        backgroundColor: '#1F2937',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                    },
                    draggableIcon: {
                        backgroundColor: '#4B5563',
                    },
                }}
            >
                <View style={styles.rbSheetContainer}>
                    <Text style={styles.rbSheetTitle}>Confirm Subscription</Text>
                    <Text style={styles.rbSheetSubtitle}>
                        Subscribe to {selectedPlan?.planName} for ₹{selectedPlan?.pricing}?
                    </Text>
                    <Text style={styles.rbSheetSubtitle}>
                        Duration: {selectedPlan?.durationValue} {selectedPlan?.Duration}
                    </Text>
                    <TouchableOpacity
                        onPress={() => selectedPlan && handleSubscribe(selectedPlan.id)}
                        disabled={user?.planId === selectedPlan?.id}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#1D4ED8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>
                                {user?.planId === selectedPlan?.id ? 'Already Subscribed' : 'Confirm'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </RBSheet>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: isError ? '#EF4444' : '#3B82F6' }]}>
                            {modalTitle}
                        </Text>
                        <Text style={styles.modalText}>{modalContent}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false);
                                if (!isError) {
                                    // Optionally navigate to home or profile
                                } else if (modalContent.includes('log in again')) {
                                    // Clear AsyncStorage and redirect to login
                                    AsyncStorage.multiRemove(['userId', 'userToken']);
                                    setUser(null);
                                    // Adjust navigation based on your app's router
                                }
                            }}
                        >
                            <Text style={styles.modalButton}>
                                {modalContent.includes('log in again') ? 'Go to Login' : 'OK'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    text: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Questrial-Regular',
    },
    errorText: {
        color: '#FF0505',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Questrial-Regular',
    },
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    card: {
        borderRadius: 25,
        padding: 15,
    },
    planCard: {
        flex: 1,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    planName: {
        color: '#FFF',
        fontSize: 22,
        fontFamily: 'Sora-Bold',
    },
    planPrice: {
        color: '#3B82F6',
        fontSize: 20,
        fontFamily: 'Sora',
    },
    planDuration: {
        color: '#D1D5DB',
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'Questrial-Regular',
    },
    featuresContainer: {
        marginBottom: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        color: '#D1D5DB',
        fontSize: 14,
        marginLeft: 8,
        fontFamily: 'Questrial-Regular',
    },
    subscribeButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Questrial-Regular',
    },
    scrollContent: {
        paddingBottom: 50,
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
    rbSheetContainer: {
        flex: 1,
        padding: 24,
    },
    rbSheetTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F3F4F6',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Sora-Bold',
    },
    rbSheetSubtitle: {
        fontSize: 16,
        color: '#D1D5DB',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: 'Questrial-Regular',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        backgroundColor: '#1F2937',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        fontFamily: 'Sora-Bold',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        color: '#D1D5DB',
        fontFamily: 'Questrial-Regular',
    },
    modalButton: {
        color: '#3B82F6',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Questrial-Regular',
    },
});

export default Package;