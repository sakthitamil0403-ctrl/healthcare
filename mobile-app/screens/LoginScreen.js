import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../utils/api';

const { width } = Dimensions.get('window');

const FeatureCard = ({ icon, label }) => (
    <View style={styles.featCard}>
        <MaterialCommunityIcons name={icon} size={22} color="#2dd4bf" />
        <Text style={styles.featLabel}>{label}</Text>
    </View>
);

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            const { token, user } = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            navigation.navigate('Dashboard', { user });
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient 
            colors={['#0f172a', '#1e1b4b', '#0f172a']} 
            style={styles.container}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Branding Section */}
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoPill}>
                                <MaterialCommunityIcons name="heart-pulse" size={32} color="#fff" />
                            </View>
                            <Text style={styles.brandTitle}>HealthHub<Text style={{color: '#2dd4bf'}}>AI</Text></Text>
                        </View>
                        
                        <Text style={styles.headline}>The future of{'\n'}
                            <Text style={styles.headlineGradient}>Clinical Intelligence.</Text>
                        </Text>
                        
                        <Text style={styles.subheadline}>
                            Experience AI-driven triage, predictive analytics, and real-time clinical monitoring.
                        </Text>
                    </View>

                    {/* Features Grid */}
                    <View style={styles.grid}>
                        <FeatureCard icon="shield-check" label="Secure AI" />
                        <FeatureCard icon="heart-pulse" label="Live Triage" />
                        <FeatureCard icon="stethoscope" label="Doctor Sync" />
                        <FeatureCard icon="chart-timeline-variant" label="Predictive" />
                    </View>

                    {/* Login Card (Glassmorphism) */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Welcome Back</Text>
                            <Text style={styles.cardSubtitle}>Log in to manage your clinical network.</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#64748b"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#64748b"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity disabled={isLoading} onPress={handleLogin}>
                            <LinearGradient
                                colors={['#0d9488', '#4f46e5']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 0}}
                                style={styles.loginBtn}
                            >
                                <Text style={styles.loginBtnText}>{isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}</Text>
                                {!isLoading && <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerText}>
                                Don't have an account? <Text style={styles.registerHighlight}>Create one now</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 25, paddingTop: 60, paddingBottom: 50 },
    header: { marginBottom: 30 },
    logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    logoPill: { 
        backgroundColor: '#0d9488', 
        padding: 10, 
        borderRadius: 15, 
        marginRight: 15,
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 4px 10px rgba(45, 212, 191, 0.3)' } 
            : { shadowColor: '#2dd4bf', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 })
    },
    brandTitle: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
    headline: { fontSize: 36, fontWeight: '900', color: '#fff', lineHeight: 42, letterSpacing: -1 },
    headlineGradient: { color: '#2dd4bf' },
    subheadline: { color: '#94a3b8', fontSize: 16, marginTop: 15, lineHeight: 24, fontWeight: '500' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 35 },
    featCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    featLabel: { color: '#cbd5e1', fontSize: 13, fontWeight: 'bold', marginLeft: 10 },
    card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 35, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardHeader: { marginBottom: 25 },
    cardTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    cardSubtitle: { color: '#94a3b8', fontSize: 14, marginTop: 5, fontWeight: '500' },
    inputGroup: { marginBottom: 25 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15, paddingHorizontal: 15 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 55, color: '#fff', fontSize: 15, fontWeight: '500' },
    loginBtn: { 
        height: 55, 
        borderRadius: 16, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 5px 10px rgba(13, 148, 136, 0.2)' } 
            : { shadowColor: '#0d9488', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 })
    },
    loginBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1.5, marginRight: 8 },
    registerLink: { marginTop: 25, alignItems: 'center' },
    registerText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
    registerHighlight: { color: '#2dd4bf', fontWeight: 'bold' }
});
