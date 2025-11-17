import HomeHeader from '@/components/HomeHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = Math.min(width * 0.9, 400);
const API_BASE_URL = 'http://192.168.1.37:3000/api';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        contactName: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Validate token
    const validateToken = async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/TdUsers/validateToken`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
            });
            return response.data.valid;
        } catch (error) {
            console.error('Token validation error:', JSON.stringify(error.response?.data || error.message, null, 2));
            return false;
        }
    };

    // Fetch user details
    const fetchUser = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');
            if (!token || !userId) {
                Alert.alert('Error', 'Not logged in. Please log in to continue.');
                router.replace('/(auth)/login');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/TdUsers/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            });

            // console.log('Fetch user response:', JSON.stringify(response.data, null, 2));
            setUser(response.data);
            setFormData({
                contactName: response.data.contactName || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
            });
        } catch (error) {
            console.error('Fetch user error:', JSON.stringify(error.response?.data || error.message, null, 2));
            let errorMessage = 'Failed to fetch user details';
            if (error.response?.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
                router.replace('/(auth)/login?expired=true');
            } else if (error.response?.status === 404) {
                errorMessage = 'User not found.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = `Network error. Please ensure the server is reachable at ${API_BASE_URL}`;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUser();
    };

    // Fetch user details on mount
    useEffect(() => {
        fetchUser();
    }, []);

    // Handle user update with retry
    const handleUpdateUser = async () => {
        if (!user) {
            Alert.alert('Error', 'No user data available');
            return;
        }
        setUpdating(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const isValid = await validateToken(token);
            if (!isValid) {
                throw new Error('Session expired or unauthorized');
            }

            let attempts = 0;
            const maxAttempts = 2;
            let lastError;
            while (attempts < maxAttempts) {
                try {
                    const response = await axios.patch(
                        `${API_BASE_URL}/TdUsers/${user.id}`,
                        {
                            contactName: formData.contactName.trim(),
                            email: formData.email.trim(),
                        },
                        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
                    );
                    setUser(response.data);
                    Alert.alert('Success', 'Profile updated successfully!');
                    return;
                } catch (error) {
                    lastError = error;
                    attempts++;
                    console.error(`Update attempt ${attempts} failed:`, JSON.stringify(error.response?.data || error.message, null, 2));
                    if (error.response?.status !== 401 || attempts >= maxAttempts) {
                        throw error;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
            throw lastError;
        } catch (error) {
            console.error('Update user error:', JSON.stringify(error.response?.data || error.message, null, 2));
            let errorMessage = 'Failed to update profile';
            if (error.response?.status === 401 || error.message === 'Session expired or unauthorized') {
                errorMessage = 'Session expired or unauthorized. Please log in again.';
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
                router.replace('/(auth)/login?expired=true');
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.error?.message || 'Invalid data provided.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = `Network error. Please ensure the server is reachable at ${API_BASE_URL}`;
            }
            setError(errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Update Profile'} />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                    />
                }
            >
                <View style={styles.formContainer}>
                    <Text style={styles.userType}>User Type: {user?.userType}</Text>
                    <Text style={styles.userType}>Active Plan: {user?.planId}</Text>
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, { borderColor: error ? '#EF4444' : '#4B5563' }]}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                placeholderTextColor="#9CA3AF"
                                value={formData.contactName}
                                onChangeText={(text) => setFormData({ ...formData, contactName: text })}
                                editable={!updating}
                            />
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, { borderColor: error ? '#EF4444' : '#4B5563' }]}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#9CA3AF"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                editable={!updating}
                            />
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, { borderColor: '#4B5563' }]}>
                            <MaterialCommunityIcons name="phone-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone"
                                placeholderTextColor="#9CA3AF"
                                value={formData.phone}
                                editable={false} // Phone updates require OTP
                            />
                        </View>
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TouchableOpacity
                        style={[styles.button, updating && styles.disabledButton]}
                        onPress={handleUpdateUser}
                        disabled={updating}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#1D4ED8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Update Profile</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 10,
    },
    content: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    formContainer: {
        width: '90%',
        maxWidth: BUTTON_WIDTH,
        padding: 24,
        backgroundColor: '#1F2937',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    userType: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Questrial-Regular',
    },
    inputContainer: {
        marginBottom: 16,
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
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 6,
        marginBottom: 10,
        fontFamily: 'Questrial-Regular',
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 16,
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
    disabledButton: {
        opacity: 0.6,
    },
});

export default Settings;