import images from '@/constants/images';
import { UserContext } from '@/contexts/UserContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://192.168.1.37:3000/api'; // Confirm this IP; use your machine's IP if different

const Login = () => {
    const insets = useSafeAreaInsets();
    const { login } = useContext(UserContext);
    const { expired } = useLocalSearchParams();
    const [phone, setPhone] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [phoneError, setPhoneError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [newOtp, setNewOtp] = useState(false);
    const [otpExpiry, setOtpExpiry] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [isError, setIsError] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [otpSentCount, setOtpSentCount] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const otpRefs = useRef([]);
    const rbSheetRef = useRef(null);

    useEffect(() => {
        if (expired === 'true') {
            Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        }
    }, [expired]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    useEffect(() => {
        if (otpSentCount > 0) {
            setCanResend(false);
            setResendCountdown(60);
            const timer = setInterval(() => {
                setResendCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [otpSentCount]);

    useEffect(() => {
        if (isOtpSent && rbSheetRef.current) {
            rbSheetRef.current.open();
        }
    }, [isOtpSent]);

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

    const validatePhone = (phone) => /^\d{10,15}$/.test(phone);

    const normalizePhoneNumber = (phone) => phone.replace(/[^0-9]/g, '');

    const generateOtp = async () => {
        setIsLoading(true);
        const payload = {
            phone: normalizePhoneNumber(phone),
        };
        try {
            const response = await axios.post(
                `${API_BASE_URL}/TdUsers/loginGenerateOtp`,
                payload,
                { timeout: 10000 }
            );
            // console.log('generateOtp response:', JSON.stringify(response.data, null, 2)); // Keep for debugging
            if (response.status === 200 && response.data?.success) {
                setIsOtpSent(true);
                setOtpExpiry(response.data.expiry);
                setOtpDigits(Array(6).fill(''));
                setOtpSentCount((prev) => prev + 1);
                setNewOtp(response.data.otp);
            } else {
                console.log('Unexpected response structure:', JSON.stringify(response.data, null, 2));
                throw new Error(response.data?.message || response.data?.error?.message || 'Unexpected response from server');
            }
        } catch (error) {
            console.error('Error generating OTP:', JSON.stringify(error.response?.data || error.message, null, 2));
            let errorMessage = 'Failed to generate OTP. Please try again.';
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = error.response.data?.error?.message || 'Invalid phone number.';
                } else if (error.response.status === 404) {
                    errorMessage = error.response.data?.error?.message || 'User not found.';
                } else if (error.response.status === 422) {
                    errorMessage = error.response.data?.error?.message || 'Validation error on server.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = error.response.data?.error?.message || 'Unexpected server response.';
                }
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = `Network error. Please check if server is running at ${API_BASE_URL} and your device is on the same network.`;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            }
            showModal('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (otp) => {
        setIsLoading(true);
        const payload = {
            phone: normalizePhoneNumber(phone),
            otp,
        };
        try {
            const response = await axios.post(
                `${API_BASE_URL}/TdUsers/loginVerifyOtp`,
                payload,
                { timeout: 10000 }
            );
            // console.log('verifyOtp response:', JSON.stringify(response.data, null, 2)); // Keep for debugging
            if (response.status === 200 && response.data?.user && response.data?.token) {
                // Store userToken and userId in AsyncStorage
                await AsyncStorage.setItem('userToken', response.data.token.id);
                await AsyncStorage.setItem('userId', response.data.user.id);
                // Call login from UserContext
                await login(response.data.user, response.data.token.id);
                showModal('Success', 'Logged in successfully', false);
                rbSheetRef.current?.close();
            } else {
                console.log('Unexpected verifyOtp response:', JSON.stringify(response.data, null, 2));
                throw new Error(response.data?.message || response.data?.error?.message || 'Unexpected response from server');
            }
        } catch (error) {
            console.error('Error verifying OTP:', JSON.stringify(error.response?.data || error.message, null, 2));
            let errorMessage = 'Invalid OTP. Please try again.';
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = error.response.data?.error?.message || 'Invalid OTP.';
                } else if (error.response.status === 404) {
                    errorMessage = error.response.data?.error?.message || 'User not found.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = error.response.data?.error?.message || 'Unexpected server response.';
                }
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = `Network error. Please ensure the server is reachable at ${API_BASE_URL}`;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.message.includes('expired')) {
                errorMessage = 'OTP expired. Please request a new one.';
            }
            setOtpError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (text, index) => {
        const newDigits = [...otpDigits];
        newDigits[index] = text;
        setOtpDigits(newDigits);
        setOtpError('');

        if (text && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = ({ nativeEvent }, index) => {
        if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleSendOtp = async () => {
        let valid = true;
        setPhoneError('');

        if (!phone) {
            setPhoneError('Phone number is required');
            valid = false;
        } else if (!validatePhone(phone)) {
            setPhoneError('Please enter a valid phone number (10-15 digits)');
            valid = false;
        }

        if (valid) {
            await generateOtp();
        }
    };

    const handleVerify = async () => {
        setOtpError('');
        if (otpExpiry && new Date() > new Date(otpExpiry)) {
            setOtpError('OTP expired. Please request a new one.');
            return;
        }
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }
        await verifyOtp(otp);
    };

    const handleResend = async () => {
        if (isLoading || !canResend) return;
        if (otpExpiry && new Date() < new Date(otpExpiry)) {
            setOtpError('Current OTP is still valid. Wait for expiry to resend.');
            return;
        }
        setOtpDigits(Array(6).fill(''));
        await generateOtp();
    };

    const handleSubmit = () => {
        if (isOtpSent) {
            handleVerify();
        } else {
            handleSendOtp();
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                    <Image source={images.mainlogo} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Welcome Back</Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, { borderColor: phoneError ? '#EF4444' : '#4B5563' }]}>
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor="#9CA3AF"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                        {phoneError ? (
                            <MaterialIcons name="error-outline" size={24} color="#EF4444" style={styles.errorIcon} />
                        ) : null}
                    </View>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: buttonScaleAnim }] }]}>
                        <LinearGradient
                            colors={['#3B82F6', '#1D4ED8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>{isOtpSent ? 'Verify' : 'Send OTP'}</Text>
                            )}
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
                                if (!isError) {
                                    router.replace('/(tabs)/home');
                                }
                            }}
                        >
                            <Text style={styles.modalButton}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <RBSheet
                ref={rbSheetRef}
                height={350 + insets.bottom}
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
                    <Text style={styles.rbSheetTitle}>Verify OTP</Text>
                    <Text style={styles.rbSheetSubtitle}>
                        Enter the 6-digit OTP displayed below for {phone}
                    </Text>
                    <Text style={styles.rbSheetSubtitle}>OTP: {newOtp}</Text>
                    <View style={styles.otpContainer}>
                        {otpDigits.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => (otpRefs.current[index] = el)}
                                style={[styles.otpInput, { borderColor: otpError ? '#EF4444' : '#4B5563' }]}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                autoFocus={index === 0}
                                textAlign="center"
                                editable={!isLoading}
                            />
                        ))}
                    </View>
                    {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                    <View style={styles.resendContainer}>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                                <Text style={styles.resendText}>Request New OTP</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.resendTextDisabled}>Request New OTP in {resendCountdown} seconds</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#1D4ED8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Verify</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

// Styles remain unchanged
export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
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
    errorIcon: {
        marginRight: 8,
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
    },
    rbSheetSubtitle: {
        fontSize: 16,
        color: '#D1D5DB',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: 'Questrial-Regular',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    otpInput: {
        width: 40,
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#374151',
        textAlign: 'center',
        fontSize: 20,
        color: '#F3F4F6',
        fontFamily: 'Questrial-Regular',
    },
    resendContainer: {
        marginBottom: 16,
        alignItems: 'center',
    },
    resendText: {
        color: '#3B82F6',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
    resendTextDisabled: {
        color: '#9CA3AF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
    },
});