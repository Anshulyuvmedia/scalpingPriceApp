import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Image, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RBSheet from 'react-native-raw-bottom-sheet';
import images from '@/constants/images';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [referralError, setReferralError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [isError, setIsError] = useState(true);
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

    // const saveRegisteredUsers = async (users) => {
    //     try {
    //         await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
    //     } catch (e) {
    //         console.error('Error saving users:', e);
    //     }
    // };

    // Save session to AsyncStorage
    // const saveSession = async (email, phone, provider = 'otp') => {
    //     try {
    //         const token = `dummy-token-${provider}-` + Math.random().toString(36).slice(2);
    //         const userData = { id: `user-${email}-${provider}`, email, phone, provider };
    //         await AsyncStorage.setItem('userToken', token);
    //         await AsyncStorage.setItem('userData', JSON.stringify(userData));
    //         await AsyncStorage.setItem('lastRoute', '(root)/(tabs)');
    //     } catch (error) {
    //         console.error('Error saving session:', error);
    //         showModal('Error', 'Failed to save session. Please try again.');
    //     }
    // };

    const handleSendOtp = async () => {
        let valid = true;
        setNameError('');
        setEmailError('');
        setPhoneError('');
        setReferralError('');

        if (!name.trim()) {
            setNameError('Name is required');
            valid = false;
        }

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
            const existingEmail = users.find((u) => u.email === email);
            const existingPhone = users.find((u) => u.phone === phone);
            if (existingEmail || existingPhone) {
                showModal('Error', 'Email or phone already registered');
                return;
            }
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            console.log(`OTP sent to phone: ${newOtp}`);
            setIsOtpSent(true);
            rbSheetRef.current.open();
        }
    };

    const handleOtpChange = (text, index) => {
        const newDigits = [...otpDigits];
        newDigits[index] = text;
        setOtpDigits(newDigits);

        if (text && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyPress = ({ nativeEvent }, index) => {
        if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        setOtpError('');
        const otp = otpDigits.join('');
        if (!otp || otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }
        if (otp === generatedOtp) {
            const users = await getRegisteredUsers();
            const newUser = { name, email, phone, referralCode: referralCode || null };
            users.push(newUser);
            // await saveRegisteredUsers(users);
            // await saveSession(email, phone);
            rbSheetRef.current.close();
            showModal('Success', 'Registered successfully', false);
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

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Your Name"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={setName}
                                // keyboardType="default"
                                autoCapitalize="words"
                            />
                        </View>
                        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
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
                            <Ionicons name="call-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
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

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="code-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Referral Code (optional)"
                                placeholderTextColor="#9CA3AF"
                                value={referralCode}
                                onChangeText={setReferralCode}
                                keyboardType="default"
                                autoCapitalize="none"
                            />
                        </View>
                        {referralError ? <Text style={styles.errorText}>{referralError}</Text> : null}
                    </View>

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
                        <TouchableOpacity style={styles.socialButton} onPress={() => router.push('./login')}>
                            <Text style={styles.socialButtonText}>Already registered? Login here!</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>

            <RBSheet
                ref={rbSheetRef}
                height={verticalScale(300)}
                openDuration={250}
                customStyles={{
                    container: styles.rbSheetContainer,
                }}
            >
                <View style={styles.rbSheetContent}>
                    <Text style={styles.rbSheetTitle}>Enter OTP</Text>
                    <Text style={styles.rbSheetSubtitle}>We&apos;ve sent a 6-digit code to your phone</Text>
                    <View style={styles.otpContainer}>
                        {otpDigits.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => (otpRefs.current[index] = el)}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                autoFocus={index === 0}
                                textAlign="center"
                            />
                        ))}
                    </View>
                    {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleVerify}
                        style={styles.rbSheetButton}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#1D4ED8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Verify OTP</Text>
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
        </View>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',

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
        borderColor: '#4B5563',
        borderRadius: moderateScale(12),
        backgroundColor: '#374151',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: scale(4),
    },
    socialButtonText: {
        color: '#F3F4F6',
        fontSize: moderateScale(16),
        fontWeight: '500',
        marginLeft: scale(8),
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
        color: '#F3F4F6',
    },
    modalText: {
        fontSize: moderateScale(16),
        marginBottom: verticalScale(24),
        textAlign: 'center',
        color: '#D1D5DB',
    },
    modalButton: {
        color: '#3B82F6',
        fontSize: moderateScale(18),
        fontWeight: '600',
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
    },
    rbSheetSubtitle: {
        fontSize: moderateScale(16),
        color: '#D1D5DB',
        marginBottom: verticalScale(24),
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
        borderColor: '#4B5563',
        borderRadius: moderateScale(8),
        backgroundColor: '#374151',
        textAlign: 'center',
        fontSize: moderateScale(24),
        color: '#F3F4F6',
        fontFamily: 'Questrial-Regular',
    },
});
