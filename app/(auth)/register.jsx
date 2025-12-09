import images from '@/constants/images';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const Register = () => {
    const API_BASE_URL = 'http://192.168.1.18:3000/api';
    const insets = useSafeAreaInsets();

    // State management
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        referralCode: '',
    });
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        referral: '',
        otp: '',
    });
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [newOtp, setNewOtp] = useState('');
    const [modal, setModal] = useState({ visible: false, title: '', content: '', isError: true });
    const [isLoading, setIsLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [otpSentCount, setOtpSentCount] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const rbSheetRef = useRef(null);
    const otpRefs = useRef([]);

    // Fade-in animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Resend countdown timer
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

    // Button animation handlers
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

    // Validation functions
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^\d{10,15}$/.test(phone);

    // Form validation
    const validateForm = () => {
        const newErrors = { name: '', email: '', phone: '', referral: '', otp: '' };
        let valid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            valid = false;
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
            valid = false;
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
            valid = false;
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // API calls
    const checkUserExists = async () => {
        setIsLoading(true);
        try {
            const filter = {
                where: {
                    or: [{ email: formData.email }, { phone: formData.phone }],
                    isTemporary: false,
                }
            };
            const response = await axios.get(`${API_BASE_URL}/TdUsers`, {
                params: { filter: JSON.stringify(filter) },
                timeout: 10000,
            });
            // console.log('checkUserExists response:', JSON.stringify(response.data, null, 2));
            return response.data.length > 0;
        } catch (error) {
            console.error('Error checking user existence:', JSON.stringify(error.response?.data || error.message, null, 2));
            let errorMessage = 'Unable to connect to the server. Please check your network and try again.';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please check your network connection.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = `Network error. Please ensure the server is reachable at ${API_BASE_URL}`;
            } else if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            }
            setModal({
                visible: true,
                title: 'Error',
                content: errorMessage,
                isError: true,
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const generateOtp = async () => {
        setIsLoading(true);
        const payload = {
            phone: formData.phone,
            name: formData.name,
            email: formData.email,
            referralCode: formData.referralCode || null,
        };
        // console.log('Sending register payload:', JSON.stringify(payload, null, 2));
        try {
            const response = await axios.post(
                `${API_BASE_URL}/TdUsers/generateOtp`,
                payload,
                { timeout: 10000 }
            );
            // console.log('Register response:', JSON.stringify(response.data, null, 2));
            if (response.status === 200 && response.data?.result?.success && response.data?.result?.otp) {
                setIsOtpSent(true);
                setNewOtp(response.data.result.otp);
                setOtpDigits(Array(6).fill(''));
                setOtpSentCount((prev) => prev + 1);
                rbSheetRef.current?.open();
            } else {
                throw new Error(response.data?.result?.message || 'Unexpected response from server');
            }
        } catch (error) {
            console.error('Error registering user:', JSON.stringify(error.response?.data || error.message, null, 2));
            let errorMessage = error.response?.data?.error?.message || 'Failed to register. Please try again.';
            if (error.code === 'ERR_NETWORK') {
                errorMessage = `Network error. Please ensure the server is reachable at ${API_BASE_URL}`;
            }
            setModal({
                visible: true,
                title: 'Error',
                content: errorMessage,
                isError: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtpAndRegister = async (otp) => {
        setIsLoading(true);
        const payload = {
            phone: formData.phone,
            otp,
            name: formData.name,
            email: formData.email,
            referralCode: formData.referralCode || null,
        };
        // console.log('Sending verifyOTP payload:', JSON.stringify(payload, null, 2));
        try {
            const response = await axios.post(
                `${API_BASE_URL}/TdUsers/verifyOTP`,
                payload,
                { timeout: 10000 }
            );
            // console.log('verifyOTP response:', JSON.stringify(response.data, null, 2));
            if (response.status === 200 && response.data) {
                rbSheetRef.current?.close();
                setModal({
                    visible: true,
                    title: 'Success',
                    content: 'Registered successfully! You can now log in.',
                    isError: false,
                });
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            console.error('Error verifying OTP:', JSON.stringify(error.response?.data || error.message, null, 2));
            let errorMessage = error.response?.data?.error?.message || 'Invalid OTP. Please try again.';
            if (error.response?.data?.error?.name === 'ValidationError') {
                errorMessage = 'Email or phone already registered. Please use a different email or phone number.';
            }
            setErrors((prev) => ({ ...prev, otp: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleOtpChange = (text, index) => {
        const newDigits = [...otpDigits];
        newDigits[index] = text;
        setOtpDigits(newDigits);
        setErrors((prev) => ({ ...prev, otp: '' }));

        if (text && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = ({ nativeEvent }, index) => {
        if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleRegister = async () => {
        if (isLoading) return;
        if (!isOtpSent) {
            if (!validateForm()) return;
            if (await checkUserExists()) {
                setModal({
                    visible: true,
                    title: 'Error',
                    content: 'Email or phone already registered. Please use a different email or phone number.',
                    isError: true,
                });
                return;
            }
            await generateOtp();
        } else {
            rbSheetRef.current?.open();
        }
    };

    const handleVerify = async () => {
        if (isLoading) return;
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            setErrors((prev) => ({ ...prev, otp: 'Please enter a valid 6-digit OTP' }));
            return;
        }
        await verifyOtpAndRegister(otp);
    };

    const handleResend = async () => {
        if (isLoading || !canResend) return;
        await generateOtp();
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                    <View style={styles.logoContainer}>
                        <Image source={images.mainlogo} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.title}>Register Now</Text>
                    </View>

                    {['name', 'email', 'phone', 'referralCode'].map((field) => (
                        <View key={field} style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, { borderColor: errors[field] ? '#EF4444' : '#4B5563' }]}>
                                <Ionicons
                                    name={
                                        field === 'name' ? 'person-outline' :
                                            field === 'email' ? 'mail-outline' :
                                                field === 'phone' ? 'call-outline' : 'code-outline'
                                    }
                                    size={moderateScale(20)}
                                    color="#9CA3AF"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder={
                                        field === 'name' ? 'Enter Your Name' :
                                            field === 'email' ? 'Email' :
                                                field === 'phone' ? 'Phone Number' : 'Referral Code (optional)'
                                    }
                                    placeholderTextColor="#9CA3AF"
                                    value={formData[field]}
                                    onChangeText={(text) => handleInputChange(field, text)}
                                    keyboardType={
                                        field === 'email' ? 'email-address' :
                                            field === 'phone' ? 'phone-pad' : 'default'
                                    }
                                    autoCapitalize={field === 'name' ? 'words' : 'none'}
                                    editable={!isLoading}
                                />
                                {errors[field] ? (
                                    <MaterialIcons name="error-outline" size={24} color="#EF4444" style={styles.errorIcon} />
                                ) : null}
                            </View>
                            {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
                        </View>
                    ))}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={handleRegister}
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
                                    <Text style={styles.buttonText}>{isOtpSent ? 'Enter OTP' : 'Register'}</Text>
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
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => router.push('./login')}
                            disabled={isLoading}
                        >
                            <Text style={styles.socialButtonText}>Already registered? Login here!</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>

            <RBSheet
                ref={rbSheetRef}
                height={verticalScale(350) + insets.bottom}
                openDuration={250}
                customStyles={{ container: styles.rbSheetContainer }}
            >
                <View style={styles.rbSheetContent}>
                    <Text style={styles.rbSheetTitle}>Enter OTP</Text>
                    <Text style={styles.rbSheetSubtitle}>Enter the 6-digit code sent to {formData.phone}</Text>
                    <Text style={styles.rbSheetSubtitle}>OTP: {newOtp}</Text>
                    <View style={styles.otpContainer}>
                        {otpDigits.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => (otpRefs.current[index] = el)}
                                style={[styles.otpInput, { borderColor: errors.otp ? '#EF4444' : '#4B5563' }]}
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
                    {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
                    <View style={styles.resendContainer}>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                                <Text style={styles.resendText}>Resend OTP</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.resendTextDisabled}>Resend OTP in {resendCountdown} seconds</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleVerify}
                        style={styles.rbSheetButton}
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
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </RBSheet>

            <Modal
                animationType="fade"
                transparent
                visible={modal.visible}
                onRequestClose={() => setModal((prev) => ({ ...prev, visible: false }))}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: modal.isError ? '#EF4444' : '#3B82F6' }]}>
                            {modal.title}
                        </Text>
                        <Text style={styles.modalText}>{modal.content}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setModal((prev) => ({ ...prev, visible: false }));
                                if (!modal.isError && modal.title === 'Success') {
                                    router.replace('/login');
                                }
                            }}
                        >
                            <Text style={styles.modalButton}>OK</Text>
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
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: verticalScale(20),
    },
    formContainer: {
        width: '90%',
        minWidth: moderateScale(370),
        padding: scale(20),
        borderRadius: moderateScale(24),
        backgroundColor: '#000000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(32),
    },
    logo: {
        width: moderateScale(75),
        height: moderateScale(75),
        borderRadius: moderateScale(40),
        marginBottom: verticalScale(5),
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#F3F4F6',
        textAlign: 'center',
        fontFamily: 'Questrial-Regular',
    },
    inputContainer: {
        marginBottom: verticalScale(10),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: moderateScale(12),
        backgroundColor: '#28282B',
    },
    inputIcon: {
        marginLeft: scale(16),
    },
    input: {
        flex: 1,
        height: verticalScale(56),
        paddingHorizontal: scale(16),
        fontSize: moderateScale(16),
        color: '#F3F4F6',
        fontFamily: 'Questrial-Regular',
    },
    errorIcon: {
        marginRight: scale(8),
    },
    errorText: {
        color: '#EF4444',
        fontSize: moderateScale(12),
        marginTop: verticalScale(6),
        fontFamily: 'Questrial-Regular',
    },
    button: {
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        marginTop: verticalScale(5),
    },
    buttonGradient: {
        paddingVertical: verticalScale(16),
        paddingHorizontal: scale(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(18),
        fontWeight: '600',
        fontFamily: 'Questrial-Regular',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(24),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#4B5563',
    },
    dividerText: {
        color: '#9CA3AF',
        fontSize: moderateScale(14),
        marginHorizontal: scale(12),
        fontFamily: 'Questrial-Regular',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(2),
    },
    socialButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: scale(4),
    },
    socialButtonText: {
        color: '#F3F4F6',
        fontSize: moderateScale(16),
        fontWeight: '500',
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
        padding: scale(24),
        borderRadius: moderateScale(16),
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        marginBottom: verticalScale(12),
        fontFamily: 'Questrial-Regular',
    },
    modalText: {
        fontSize: moderateScale(16),
        marginBottom: verticalScale(24),
        textAlign: 'center',
        color: '#D1D5DB',
        fontFamily: 'Questrial-Regular',
    },
    modalButton: {
        color: '#3B82F6',
        fontSize: moderateScale(18),
        fontWeight: '600',
        fontFamily: 'Questrial-Regular',
    },
    rbSheetContainer: {
        backgroundColor: '#1F2937',
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        padding: scale(24),
    },
    rbSheetContent: {
        alignItems: 'center',
    },
    rbSheetTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#F3F4F6',
        marginBottom: verticalScale(8),
        fontFamily: 'Questrial-Regular',
    },
    rbSheetSubtitle: {
        fontSize: moderateScale(16),
        color: '#D1D5DB',
        marginBottom: verticalScale(24),
        fontFamily: 'Questrial-Regular',
    },
    rbSheetButton: {
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        width: '100%',
        marginTop: verticalScale(16),
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: verticalScale(20),
    },
    otpInput: {
        width: moderateScale(40),
        height: moderateScale(50),
        borderWidth: 1,
        borderRadius: moderateScale(8),
        backgroundColor: '#374151',
        textAlign: 'center',
        fontSize: moderateScale(20),
        color: '#F3F4F6',
        fontFamily: 'Questrial-Regular',
    },
    resendContainer: {
        marginBottom: verticalScale(16),
        alignItems: 'center',
    },
    resendText: {
        color: '#3B82F6',
        fontSize: moderateScale(16),
        fontFamily: 'Questrial-Regular',
    },
    resendTextDisabled: {
        color: '#9CA3AF',
        fontSize: moderateScale(16),
        fontFamily: 'Questrial-Regular',
    },
});

export default Register;