import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Alert, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';

import images from '@/constants/images';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;

    // Fade-in animation on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    // Handle button press animation
    const handleButtonPressIn = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 0.95,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // Basic email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle login submission
    const handleLogin = () => {
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

        if (valid) {
            console.log('Login credentials:', { email, password });
            Alert.alert('Success', 'Login attempted! Check console for credentials.');
        }
    };

    return (
        <LinearGradient
            colors={['#25242F', '#151718']}
            style={styles.container}
        >
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                    <Image
                        source={images.mainlogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>
                    Welcome Back
                </Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: '#33333D', // Fallback for missing inputBackground
                                color: 'white',
                                borderColor: '#4A4A55', // Fallback for missing border
                            },
                        ]}
                        placeholder="Email"
                        placeholderTextColor='gray'
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: '#33333D', // Fallback for missing inputBackground
                                color: 'white',
                                borderColor: '#4A4A55', // Fallback for missing border
                            },
                        ]}
                        placeholder="Password"
                        placeholderTextColor='gray'
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleLogin}
                >
                    <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                        <LinearGradient
                            colors={['#723CDF', '#FAC1EC']}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Login</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => Alert.alert('Info', 'Forgot Password feature coming soon!')}
                >
                    <Text style={styles.forgotPassword}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
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
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#25242F',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: 'white',
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
    },
    errorText: {
        color: '#FF4D4F',
        fontSize: 12,
        marginTop: 5,
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    forgotPassword: {
        marginTop: 15,
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
        color: 'white',
    },
});