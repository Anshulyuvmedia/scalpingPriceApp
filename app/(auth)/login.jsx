import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Image, Modal } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import images from '@/constants/images';

const Login = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [isError, setIsError] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;

    // Fade-in animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Handle button press animation
    const handleButtonPressIn = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 0.97,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
        }).start();
    };

    const showModal = (title, content, error = true) => {
        setModalTitle(title);
        setModalContent(content);
        setIsError(error);
        setModalVisible(true);
    };

    // Basic email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Basic phone validation
    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10,15}$/;
        return phoneRegex.test(phone);
    };

    const getRegisteredUsers = async () => {
        try {
            const usersJson = await AsyncStorage.getItem('registeredUsers');
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (e) {
            console.error('Error getting users:', e);
            return [];
        }
    };

    // Save session to AsyncStorage
    const saveSession = async (email, phone, provider = 'otp') => {
        try {
            const token = `dummy-token-${provider}-` + Math.random().toString(36).slice(2);
            const userData = { id: `user-${email}-${provider}`, email, phone, provider };
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('lastRoute', '(root)/(tabs)');
        } catch (error) {
            console.error('Error saving session:', error);
            showModal('Error', 'Failed to save session. Please try again.');
        }
    };

    const handleSendOtp = async () => {
        let valid = true;
        setEmailError('');
        setPhoneError('');

        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        }

        if (!phone) {
            setPhoneError('Phone number is required');
            valid = false;
        } else if (!validatePhone(phone)) {
            setPhoneError('Please enter a valid phone number (10-15 digits)');
            valid = false;
        }

        if (valid) {
            const users = await getRegisteredUsers();
            const user = users.find((u) => u.email === email && u.phone === phone);
            if (!user) {
                showModal('Error', 'No account found with this email and phone');
                return;
            }
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            console.log(`OTP sent to phone: ${newOtp}`);
            setIsOtpSent(true);
            showModal('Info', 'OTP sent to your phone', false);
        }
    };

    const handleVerify = async () => {
        setOtpError('');
        if (!otp || otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }
        if (otp === generatedOtp) {
            await saveSession(email, phone);
            showModal('Success', 'Logged in successfully', false);
        } else {
            setOtpError('Invalid OTP');
        }
    };

    const handleSubmit = () => {
        if (isOtpSent) {
            handleVerify();
        } else {
            handleSendOtp();
        }
    };

    return (
        <LinearGradient colors={['#0D1117', '#1F2937']} style={styles.container}>
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                    <Image source={images.mainlogo} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Welcome Back</Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor="#9CA3AF"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                        />
                    </View>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </View>

                {isOtpSent && (
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="key-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 6-digit OTP"
                                placeholderTextColor="#9CA3AF"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                                maxLength={6}
                            />
                        </View>
                        {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                    </View>
                )}

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleSubmit}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: buttonScaleAnim }] }]}>
                        <LinearGradient
                            colors={['#3B82F6', '#1D4ED8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>{isOtpSent ? 'Verify' : 'Send OTP'}</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity style={styles.socialButton} onPress={() => router.push('./register')}>
                        <Text style={styles.socialButtonText}>Don&apos;t have an account? Register Now!</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: isError ? '#EF4444' : '#3B82F6' }]}>{modalTitle}</Text>
                        <Text style={styles.modalText}>{modalContent}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false);
                                if (!isError && modalTitle === 'Success') {
                                    router.replace('/(root)/(tabs)');
                                }
                            }}
                        >
                            <Text style={styles.modalButton}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D1117',
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 32,
        borderRadius: 24,
        backgroundColor: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 40,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#F3F4F6',
        textAlign: 'center',
        fontFamily: 'Questrial-Regular',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4B5563',
        borderRadius: 12,
        backgroundColor: '#374151',
    },
    inputIcon: {
        marginLeft: 16,
    },
    input: {
        flex: 1,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#F3F4F6',
        fontFamily: 'Questrial-Regular',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 6,
        fontFamily: 'Questrial-Regular',
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 24,
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#4B5563',
    },
    dividerText: {
        color: '#9CA3AF',
        fontSize: 14,
        marginHorizontal: 12,
        fontFamily: 'Questrial-Regular',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    socialButtonText: {
        color: '#F3F4F6',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
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
        color: '#F3F4F6',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        color: '#D1D5DB',
    },
    modalButton: {
        color: '#3B82F6',
        fontSize: 18,
        fontWeight: '600',
    },
});