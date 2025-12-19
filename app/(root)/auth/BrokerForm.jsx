// app/broker/ConnectBrokerForm.jsx
import HomeHeader from '@/components/HomeHeader';
import images from '@/constants/images';
import { useBroker } from '@/contexts/broker/BrokerProvider';
import { useUser } from '@/contexts/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

const BASE_URL = __DEV__
    ? 'https://johnson-prevertebral-irradiatingly.ngrok-free.dev'
    : 'https://api.yourapp.com';
const BROKER_CONFIG = {
    dhan: {
        name: 'Dhan',
        logo: images.dhanimg,
        fields: ['clientId', 'apiKey', 'apiSecret'],
        placeholders: {
            clientId: 'DH123456',
            apiKey: 'Your API Key (app_id)',
            apiSecret: 'Your API Secret (app_secret)',
        },
        instructions: [
            'Login to https://web.dhan.co',
            'Go to Profile → API',
            'Click “Generate API Key”',
            'Copy Client ID, API Key & API Secret',
            'Enable “Trading” & “Holdings” permissions',
        ],
        helpUrl: 'https://dhanhq.co/docs/v2/authentication/',
    },
};

export default function ConnectBrokerForm() {
    const { broker } = useLocalSearchParams();
    const router = useRouter();
    const { appToken } = useUser();
    const {
        broker: connectedBroker = null,
        isLive = false,
        refreshPortfolio,
        disconnectBroker,
    } = useBroker() || {};
    // console.log('connectedBroker', connectedBroker);
    const config = broker === 'dhan' ? BROKER_CONFIG.dhan : null;
    const isConnected = connectedBroker === 'dhan';

    const [formData, setFormData] = useState({});
    const [showSecrets, setShowSecrets] = useState({});
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // RBSheet control
    const sheetRef = useRef(null);
    const [sheetContent, setSheetContent] = useState(null);
    const [disconnecting, setDisconnecting] = useState(false);
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        if (isConnected && refreshPortfolio) {
            refreshPortfolio?.();
            startPulse();
        }

        const loadSaved = async () => {
            const saved = {};
            for (const field of config.fields) {
                const val = await SecureStore.getItemAsync(`dhan_${field}`);
                if (val) saved[field] = val;
            }
            if (Object.keys(saved).length === 3) {
                setFormData(saved);
                setSaved(true);
            }
        };
        loadSaved();
    }, [isConnected, refreshPortfolio]);

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 800,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const updateField = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const toggleSecret = (key) =>
        setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));

    const openSheet = (content) => {
        // console.log('Opening sheet with content:', content.title); // For debugging
        setSheetContent(content);
        sheetRef.current?.open();
    };


    const closeSheet = () => sheetRef.current?.close();

    const handleSaveAndConnect = async () => {
        const missing = config.fields.filter((f) => !formData[f]?.trim());
        if (missing.length > 0) {
            const missingLabels = missing
                .map((m) =>
                    m === 'clientId'
                        ? 'Client ID'
                        : m === 'apiKey'
                            ? 'API Key'
                            : 'API Secret'
                )
                .join(', ');

            openSheet({
                title: 'Missing Fields',
                message: `Please fill in: ${missingLabels}`,
                buttons: [{ text: 'OK', onPress: closeSheet, primary: true }],
            });
            return;
        }

        setLoading(true);
        try {
            // Save locally
            for (const key of config.fields) {
                await SecureStore.setItemAsync(`dhan_${key}`, formData[key].trim());
            }
            // console.log('formData.clientId:', formData.clientId.trim())
            // console.log('formData.apiKey:', formData.apiKey.trim())
            // console.log('formData.apiSecret:', formData.apiSecret.trim())
            // Save to backend
            const res = await fetch(
                'https://johnson-prevertebral-irradiatingly.ngrok-free.dev/api/BrokerConnections/save-credentials',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${appToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        clientId: formData.clientId.trim(),
                        apiKey: formData.apiKey.trim(),
                        apiSecret: formData.apiSecret.trim(),
                    }),
                }
            );
            // console.log('res', res);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(
                    text.includes('already')
                        ? 'Credentials already saved'
                        : text || 'Server error'
                );
            }

            setSaved(true);

            openSheet({
                title: 'Saved!',
                message: 'Credentials saved securely. Now login to authorize access.',
                buttons: [
                    {
                        text: 'Login to Dhan',
                        onPress: () => {
                            closeSheet();
                            router.push('/auth/DhanOAuth');
                        },
                        primary: true,
                    },
                    {
                        text: 'Later',
                        onPress: () => {
                            closeSheet();
                            router.back();
                        },
                    },
                ],
            });
        } catch (err) {
            openSheet({
                title: 'Save Failed',
                message: err.message || 'Please try again later.',
                buttons: [{ text: 'OK', onPress: closeSheet, primary: true }],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = () => {
        // console.log('Disconnect button pressed - opening confirmation');
        // console.log('sheetRef.current:', sheetRef.current); // Should not be null
        openSheet({  // ← Use regular openSheet, not openSheetSafe
            title: 'Disconnect Dhan?',
            message: 'This will remove access to your portfolio.',
            buttons: [
                {
                    text: 'Cancel',
                    onPress: () => {
                        setDisconnecting(false);  // Reset if somehow set
                        // console.log('Cancel pressed');
                        closeSheet();
                    },
                },
                {
                    text: 'Disconnect',
                    destructive: true,
                    onPress: async () => {
                        // console.log('User confirmed disconnect');
                        closeSheet();

                        setTimeout(async () => {
                            setDisconnecting(true);  // ← Only now show "Disconnecting..."
                            try {
                                setLoading(true);
                                // console.log('Sending disconnect request to backend...');

                                const res = await fetch(`${BASE_URL}/api/BrokerConnections/disconnect`, {
                                    method: 'POST',
                                    headers: {
                                        Authorization: `Bearer ${appToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({}),
                                });

                                // console.log('Backend response status:', res.status);

                                if (!res.ok) {
                                    const text = await res.text();
                                    console.error('Disconnect failed:', text);
                                    throw new Error(text || 'Failed to disconnect');
                                }

                                // console.log('Backend disconnect successful - clearing local data');

                                await Promise.all([
                                    SecureStore.deleteItemAsync('dhan_clientId'),
                                    SecureStore.deleteItemAsync('dhan_apiKey'),
                                    SecureStore.deleteItemAsync('dhan_apiSecret'),
                                    AsyncStorage.removeItem('brokerToken'),
                                ]);

                                await disconnectBroker();  // Clears context state → should switch to form view

                                // console.log('Local cleanup complete');

                                openSheet({
                                    title: 'Disconnected',
                                    message: 'Dhan account disconnected successfully.',
                                    buttons: [{ text: 'OK', onPress: () => router.back() }],
                                });
                            } catch (err) {
                                console.error('Disconnect error:', err);
                                openSheet({
                                    title: 'Disconnect Failed',
                                    message: err.message || 'Please try again later.',
                                    buttons: [{ text: 'OK', onPress: closeSheet }],
                                });
                            } finally {
                                setLoading(false);
                                setDisconnecting(false);
                            }
                        }, 300);  // Small delay for smooth close → open transition
                    },
                },
            ],
        });
    };


    const handleReauthenticate = async () => {
        try {
            const clientId = await SecureStore.getItemAsync('dhan_clientId');
            if (!clientId) {
                openSheet({
                    title: 'Credentials Missing',
                    message: 'Please save your API keys first before re-authenticating.',
                    buttons: [{ text: 'OK', onPress: closeSheet, primary: true }],
                });
                return;
            }

            router.push('/auth/DhanOAuth');
        } catch (err) {
            openSheet({
                title: 'Error',
                message: 'Failed to prepare for re-authentication.',
                buttons: [{ text: 'OK', onPress: closeSheet }],
            });
        }
    };

    // Connection Form
    return (
        <View style={styles.container}>
            <View className="px-3">
                <HomeHeader page="chatbot" title="Connect Broker" />
            </View>

            {/* Connected Success Screen */}
            {isConnected ? (
                <View style={styles.successContainer}>
                    <Animated.View
                        style={[styles.logoPulse, { transform: [{ scale: pulseAnim }] }]}
                    >
                        <View style={styles.successIcon}>
                            <MaterialIcons name="check-circle" size={90} color="#00D09C" />
                        </View>
                    </Animated.View>

                    <Text style={styles.successTitle}>Connected Successfully!</Text>
                    {/* <Text style={styles.statusText}>
                        Env: {connectedBroker.environment}
                    </Text> */}
                    <Text style={styles.clientId}>
                        Client ID: {connectedBroker.clientId}
                    </Text>

                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                isLive ? styles.liveDot : styles.connectedDot,
                            ]}
                        />
                        <Text style={styles.statusText}>
                            {isLive ? 'LIVE • Real-time Updates' : 'Connected • Syncing'}
                        </Text>
                    </View>

                    <Text style={styles.successDesc}>
                        Your holdings, positions & funds are now live in the app.
                    </Text>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={styles.reconnectBtn}
                            onPress={handleReauthenticate}
                        >
                            <MaterialIcons name="sync" size={20} color="#00D09C" />
                            <Text style={styles.reconnectText}>Re-Authenticate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.disconnectBtn}
                            onPress={handleDisconnect}
                        >
                            <MaterialIcons name="link-off" size={20} color="#FF6B6B" />
                            {disconnecting ? (
                                <Text style={styles.disconnectText}>Disconnecting...</Text>
                            ) : (
                                <Text style={styles.disconnectText}>Disconnect</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Connect Your Dhan Account</Text>
                        <Text style={styles.subtitle}>Enter your API credentials securely</Text>
                    </View>

                    <View style={styles.form}>
                        {config.fields.map((field) => (
                            <View key={field} style={styles.field}>
                                <View className="flex-row gap-3">
                                    <Text style={styles.label}>
                                        {field === 'clientId'
                                            ? 'Client ID'
                                            : field === 'apiKey'
                                                ? 'API Key'
                                                : 'API Secret'}
                                    </Text>
                                    {saved && formData[field] && (
                                        <Text style={styles.savedText}>Saved securely</Text>
                                    )}
                                </View>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        value={formData[field] || ''}
                                        onChangeText={(v) => updateField(field, v)}
                                        placeholder={config.placeholders[field]}
                                        placeholderTextColor="#666"
                                        secureTextEntry={field.includes('Secret') && !showSecrets[field]}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    {field.includes('Secret') && (
                                        <TouchableOpacity
                                            onPress={() => toggleSecret(field)}
                                            style={styles.eyeIcon}
                                        >
                                            <MaterialIcons
                                                name={showSecrets[field] ? 'visibility' : 'visibility-off'}
                                                size={22}
                                                color="#888"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.connectBtn, loading && styles.disabledBtn]}
                        onPress={handleSaveAndConnect}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.connectText}>Saving Credentials...</Text>
                        ) : (
                            <>
                                <Text style={styles.connectText}>Save & Login</Text>
                                <MaterialIcons
                                    name="arrow-forward"
                                    size={22}
                                    color="#000"
                                    style={{ marginLeft: 10 }}
                                />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.guideCard}>
                        <Text style={styles.guideTitle}>How to Generate API Keys?</Text>
                        {config.instructions.map((step, i) => (
                            <View key={i} style={styles.step}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumText}>{i + 1}</Text>
                                </View>
                                <Text style={styles.stepDesc}>{step}</Text>
                            </View>
                        ))}
                        <TouchableOpacity
                            style={styles.helpLink}
                            onPress={() => Linking.openURL(config.helpUrl)}
                        >
                            <MaterialIcons name="open-in-new" size={18} color="#00D09C" />
                            <Text style={styles.helpText}>Open Dhan API Documentation</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.footerNote}>
                        Your credentials are encrypted and never leave your device.
                    </Text>
                </ScrollView>
            )}
            {/* Reusable Professional Bottom Sheet */}
            <RBSheet
                ref={sheetRef}
                height={sheetContent?.buttons?.length > 1 ? 370 : 280}
                // onOpen={() => console.log('Sheet opened successfully')}
                // onClose={() => console.log('Sheet closed')}
                closeOnDragDown
                closeOnPressMask
                customStyles={{
                    wrapper: { backgroundColor: 'rgba(0,0,0,0.6)' },
                    draggableIcon: { backgroundColor: '#444' },
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        backgroundColor: '#111',
                        padding: 24,
                    },
                }}
            >
                {sheetContent && (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.sheetTitle}>{sheetContent.title}</Text>
                        <Text style={styles.sheetMessage}>{sheetContent.message}</Text>

                        <View style={styles.sheetButtonContainer}>
                            {sheetContent.buttons.map((btn, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.sheetButton,
                                        btn.primary && styles.sheetPrimaryButton,
                                        btn.destructive && styles.sheetDestructiveButton,
                                    ]}
                                    onPress={btn.onPress}
                                >
                                    <Text
                                        style={[
                                            styles.sheetButtonText,
                                            btn.primary && styles.sheetPrimaryText,
                                            btn.destructive && styles.sheetDestructiveText,
                                        ]}
                                    >
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </RBSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    // Success Screen
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    logoPulse: { marginBottom: 30 },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,208,156,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successTitle: {
        color: '#00D09C',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
    },
    clientId: { color: '#AAA', fontSize: 16, marginBottom: 16, fontWeight: '600' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    liveDot: {
        backgroundColor: '#00D09C',
        shadowColor: '#00D09C',
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    connectedDot: { backgroundColor: '#00D09C' },
    statusText: { color: '#00D09C', fontSize: 16, fontWeight: '600' },
    successDesc: {
        color: '#888',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    buttonGroup: { flexDirection: 'row', gap: 16, marginBottom: 30 },
    reconnectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00D09C33',
    },
    reconnectText: { color: '#00D09C', marginLeft: 8, fontWeight: '600' },
    disconnectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF6B6B33',
    },
    disconnectText: { color: '#FF6B6B', marginLeft: 8, fontWeight: '600' },
    doneBtn: {
        backgroundColor: '#00D09C',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 16,
        width: '80%',
    },
    doneText: { color: '#000', fontSize: 18, fontWeight: '700', textAlign: 'center' },

    // Form
    header: { alignItems: 'center', marginBottom: 32 },
    title: { color: '#FFF', fontSize: 28, fontWeight: '800' },
    subtitle: { color: '#AAA', fontSize: 16, marginTop: 8 },
    form: { marginBottom: 5 },
    field: { marginBottom: 20 },
    label: { color: '#FFF', fontSize: 15, marginBottom: 8, fontWeight: '600' },
    inputWrapper: {
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: '#FFF',
        paddingVertical: 16,
        paddingHorizontal: 18,
        fontSize: 16,
    },
    eyeIcon: { padding: 16 },
    savedText: { color: '#00D09C', fontSize: 12, marginTop: 3, fontWeight: '500' },
    connectBtn: {
        backgroundColor: '#00D09C',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        marginBottom: 30,
    },
    disabledBtn: { opacity: 0.7 },
    connectText: { color: '#000', fontSize: 18, fontWeight: '700' },

    guideCard: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    guideTitle: { color: '#00D09C', fontSize: 18, fontWeight: '700', marginBottom: 16 },
    step: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#00D09C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    stepNumText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
    stepDesc: { color: '#DDD', fontSize: 15, flex: 1, lineHeight: 22 },
    helpLink: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    helpText: { color: '#00D09C', marginLeft: 8, fontWeight: '600' },
    footerNote: {
        color: '#666',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 30,
        fontStyle: 'italic',
    },

    // RBSheet Styles
    sheetTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    sheetMessage: {
        color: '#CCC',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    sheetButtonContainer: {
        width: '100%',
        gap: 12,
    },
    sheetButton: {
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#1A1A2E',
        alignItems: 'center',
    },
    sheetPrimaryButton: {
        backgroundColor: '#00D09C',
    },
    sheetDestructiveButton: {
        backgroundColor: '#FF6B6B33',
        borderWidth: 1,
        borderColor: '#FF6B6B66',
    },
    sheetButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '600',
    },
    sheetPrimaryText: {
        color: '#000',
        fontWeight: '700',
    },
    sheetDestructiveText: {
        color: '#FF6B6B',
    },
});