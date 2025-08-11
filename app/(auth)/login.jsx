import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Alert, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // For social login icons
import images from '@/constants/images';

const Login = () => {
    const DUMMY_EMAIL = 'user@example.com';
    const DUMMY_PASSWORD = 'password123';
    const [email, setEmail] = useState(DUMMY_EMAIL);
    const [password, setPassword] = useState(DUMMY_PASSWORD);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
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

    // Basic email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Save session to AsyncStorage
    const saveSession = async (email, provider = 'email') => {
        try {
            const token = `dummy-token-${provider}-` + Math.random().toString(36).slice(2);
            const userData = { id: `user-${email}-${provider}`, email, provider };
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('lastRoute', '(root)/(tabs)');
        } catch (error) {
            console.error('Error saving session:', error);
            Alert.alert('Error', 'Failed to save session. Please try again.');
        }
    };

    // Handle login submission
    const handleLogin = async () => {
        let valid = true;
        setEmailError('');
        setPasswordError('');

        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        }

        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }

        if (valid && email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
            await saveSession(email);
            router.replace('/(root)/(tabs)');
        } else if (valid) {
            Alert.alert('Error', 'Invalid email or password. Please use the credentials shown above.');
        }
    };

    // Handle social login (placeholder for Upstox, Zerodha, Angel One)
    const handleSocialLogin = async (provider) => {
        try {
            // Placeholder for actual OAuth flow
            await saveSession(`${provider.toLowerCase()}@example.com`, provider.toLowerCase());
            router.replace('/(root)/(tabs)');
            Alert.alert('Success', `Logged in with ${provider} successfully!`);
        } catch (error) {
            console.error(`Error with ${provider} login:`, error);
            Alert.alert('Error', `Failed to login with ${provider}. Please try again.`);
        }
    };

    return (
        <LinearGradient
            colors={['#1A1E2E', '#2E3A59']}
            style={styles.container}
        >
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                    <Image
                        source={images.mainlogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Welcome Back</Text>
                </View>

                {/* <View style={styles.credentialsContainer}>
                    <Text style={styles.credentialsText}>
                        Use these credentials to login:
                    </Text>
                    <Text style={styles.credentialsText}>
                        Email: {DUMMY_EMAIL}
                    </Text>
                    <Text style={styles.credentialsText}>
                        Password: {DUMMY_PASSWORD}
                    </Text>
                </View> */}

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#A0AEC0"
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
                        <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#A0AEC0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleLogin}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: buttonScaleAnim }] }]}>
                        <LinearGradient
                            colors={['#2B6BFD', '#1E4ED8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Sign In</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or sign in with</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Upstox')}
                    >
                        <Ionicons name="rocket-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.socialButtonText}>Upstox</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Zerodha')}
                    >
                        <Ionicons name="leaf-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.socialButtonText}>Zerodha</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('AngelOne')}
                    >
                        <Ionicons name="star-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.socialButtonText}>Angel One</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </LinearGradient>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1E2E',
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 32,
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1E2E',
        textAlign: 'center',
        fontFamily: 'Questrial-Regular',
    },
    credentialsContainer: {
        marginBottom: 24,
        padding: 12,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
    },
    credentialsText: {
        color: '#4A5568',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Questrial-Regular',
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        backgroundColor: '#F7FAFC',
    },
    inputIcon: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1A1E2E',
        fontFamily: 'Questrial-Regular',
    },
    errorText: {
        color: '#E53E3E',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Questrial-Regular',
    },
    button: {
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 16,
    },
    buttonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Questrial-Regular',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        color: '#4A5568',
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
        backgroundColor: '#2D3748',
        borderRadius: 8,
        paddingVertical: 10,
        marginHorizontal: 4,
    },
    socialButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        fontFamily: 'Questrial-Regular',
    },
});