// app/broker/ConnectBrokerForm.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useBroker } from '@/contexts/BrokerContext';

const BROKER_CONFIG = {
    dhan: {
        name: 'Dhan',
        fields: ['clientId', 'apiKey', 'apiSecret'],
        placeholders: {
            clientId: 'e.g. DH123456',
            apiKey: 'Your API Key',
            apiSecret: 'Your API Secret',
        },
        instructions: [
            'Login to https://web.dhan.co/',
            'Go to Profile → API',
            'Click “Generate API Key”',
            'Copy Client ID, API Key & API Secret',
        ],
        helpUrl: 'https://dhanhq.co/docs/v2/authentication/',
    },
};

export default function ConnectBrokerForm() {
    const { broker } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useUser();
    const { broker: connectedBroker, refreshPortfolio } = useBroker();

    const config = broker === 'dhan' ? BROKER_CONFIG.dhan : null;

    const [formData, setFormData] = useState({});
    const [showSecrets, setShowSecrets] = useState({});
    const [loading, setLoading] = useState(false);

    // Check if already connected
    const isConnected = connectedBroker?.broker === 'dhan';
    console.log('connectedBroker', connectedBroker);
    useEffect(() => {
        if (isConnected) {
            console.log("Already connected to Dhan as", connectedBroker.clientId);
            // Auto-refresh portfolio when opening this screen
            refreshPortfolio?.();
        }

        // Load saved credentials for editing
        const load = async () => {
            const saved = {};
            for (const field of config.fields) {
                const val = await SecureStore.getItemAsync(`dhan_${field}`);
                if (val) saved[field] = val;
            }
            if (Object.keys(saved).length > 0) setFormData(saved);
        };
        load();
    }, [isConnected, connectedBroker, refreshPortfolio]);

    const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
    const toggleSecret = (key) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSaveAndConnect = async () => {
        const missing = config.fields.filter(f => !formData[f]?.trim());
        if (missing.length > 0) {
            Alert.alert('Missing Fields', `Please fill: ${missing.join(', ')}`);
            return;
        }

        setLoading(true);
        try {
            // Save locally
            for (const key of config.fields) {
                await SecureStore.setItemAsync(`dhan_${key}`, formData[key].trim());
            }

            // Save to backend
            const res = await fetch('https://johnson-prevertebral-irradiatingly.ngrok-free.dev/api/BrokerConnections/save-credentials', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: formData.clientId.trim(),
                    apiKey: formData.apiKey.trim(),
                    apiSecret: formData.apiSecret.trim(),
                }),
            });

            if (!res.ok) throw new Error(await res.text() || 'Failed');

            Alert.alert(
                isConnected ? 'Updated!' : 'Saved!',
                isConnected
                    ? 'Your credentials have been updated. Re-login to apply changes.'
                    : 'Credentials saved! Now login to complete connection.',
                [
                    { text: 'Login Now', onPress: () => router.replace('/oauth/dhan') },
                    { text: 'Done', onPress: () => router.back() },
                ]
            );
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    // If already connected → show success state
    if (isConnected) {
        return (
            <View style={styles.container}>
                <HomeHeader page="settings" title="Dhan Connected" />

                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <MaterialIcons name="check-circle" size={80} color="#00D09C" />
                    </View>
                    <Text style={styles.successTitle}>Connected to Dhan!</Text>
                    <Text style={styles.successSubtitle}>
                        Client ID: {connectedBroker.clientId}
                    </Text>
                    <Text style={styles.successDesc}>
                        Your portfolio is synced automatically.
                    </Text>

                    <TouchableOpacity
                        style={styles.reconnectBtn}
                        onPress={() => router.replace('/oauth/dhan')}
                    >
                        <Text style={styles.reconnectText}>Re-connect Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Not connected → show form
    return (
        <View style={styles.container}>
            <HomeHeader page="settings" title="Connect Dhan" />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>Connect Dhan</Text>
                    <Text style={styles.subtitle}>Enter your personal API credentials</Text>
                </View>

                <View style={styles.form}>
                    {config.fields.map(field => (
                        <View key={field}>
                            <Text style={styles.label}>
                                {field === 'clientId' ? 'Client ID' : field === 'apiKey' ? 'API Key' : 'API Secret'}
                            </Text>
                            <View style={[styles.inputContainer, field.includes('Secret') && styles.passwordContainer]}>
                                <TextInput
                                    style={styles.input}
                                    value={formData[field] || ''}
                                    onChangeText={v => updateField(field, v)}
                                    placeholder={config.placeholders[field]}
                                    placeholderTextColor="#666"
                                    secureTextEntry={field.includes('Secret') && !showSecrets[field]}
                                    autoCapitalize={field === 'clientId' ? 'characters' : 'none'}
                                />
                                {field.includes('Secret') && (
                                    <TouchableOpacity onPress={() => toggleSecret(field)}>
                                        <MaterialIcons name={showSecrets[field] ? 'visibility' : 'visibility-off'} size={22} color="#888" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.connectBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSaveAndConnect}
                    disabled={loading}
                >
                    <Text style={styles.connectText}>
                        {loading ? 'Saving...' : 'Save & Connect Dhan'}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <View style={styles.guideCard}>
                    <Text style={styles.guideTitle}>How to get credentials?</Text>
                    {config.instructions.map((step, i) => (
                        <View key={i} style={styles.step}>
                            <View style={styles.stepNumber}><Text style={styles.stepText}>{i + 1}</Text></View>
                            <Text style={styles.stepDesc}>{step}</Text>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.helpLink} onPress={() => Linking.openURL(config.helpUrl)}>
                        <MaterialIcons name="help-outline" size={18} color="#00D09C" />
                        <Text style={styles.helpText}>Official Dhan API Docs</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 10 },
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    successIcon: { marginBottom: 24 },
    successTitle: { color: '#00D09C', fontSize: 28, fontWeight: '700', marginBottom: 8 },
    successSubtitle: { color: '#AAA', fontSize: 16, marginBottom: 8 },
    successDesc: { color: '#888', fontSize: 15, textAlign: 'center', marginBottom: 40 },
    reconnectBtn: { backgroundColor: '#1A1A2E', padding: 16, borderRadius: 12, marginBottom: 16 },
    reconnectText: { color: '#00D09C', fontSize: 16, fontWeight: '600' },
    doneBtn: { backgroundColor: '#00D09C', padding: 16, borderRadius: 12, width: '100%' },
    doneText: { color: '#000', fontSize: 16, fontWeight: '700', textAlign: 'center' },

    header: { alignItems: 'center', marginBottom: 30 },
    title: { color: '#FFF', fontSize: 26, fontWeight: '700' },
    subtitle: { color: '#AAA', fontSize: 15, marginTop: 8, textAlign: 'center' },
    form: { marginBottom: 20 },
    label: { color: '#FFF', fontSize: 15, marginBottom: 8, fontWeight: '500' },
    inputContainer: {
        backgroundColor: '#1A1A2E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordContainer: { paddingRight: 15 },
    input: { flex: 1, color: '#FFF', padding: 16, fontSize: 16 },
    connectBtn: {
        backgroundColor: '#00D09C',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        marginBottom: 30,
    },
    connectText: { color: '#000', fontSize: 17, fontWeight: '700' },
    guideCard: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#333',
    },
    guideTitle: { color: '#00D09C', fontSize: 17, fontWeight: '600', marginBottom: 16 },
    step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#00D09C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
    stepDesc: { color: '#DDD', fontSize: 15, flex: 1, lineHeight: 22 },
    helpLink: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    helpText: { color: '#00D09C', marginLeft: 6, fontSize: 14 },
});