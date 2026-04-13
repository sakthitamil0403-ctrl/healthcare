import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../utils/api';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [isLoading, setIsLoading] = useState(false);
    
    const [bloodType, setBloodType] = useState('O+');
    const [donationType, setDonationType] = useState('blood');
    const [location, setLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    const handleGetLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to register as a donor.');
                setIsLocating(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                type: 'Point',
                coordinates: [loc.coords.longitude, loc.coords.latitude]
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not detect location. Please try again.');
        } finally {
            setIsLocating(false);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setIsLoading(true);
        try {
            const payload = { name, email, phone, password, role };
            if (role === 'donor') {
                if (!location) {
                    Alert.alert('Location Required', 'Please secure your location to continue as a donor.');
                    setIsLoading(false);
                    return;
                }
                payload.bloodType = bloodType;
                payload.donationType = donationType;
                payload.location = location;
            }
            
            await authService.register(payload);
            Alert.alert('Success', 'Account created successfully');
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const FeatureCard = ({ icon, title, desc }) => (
        <View style={styles.featCard}>
            <View style={styles.featIconBox}>
                <MaterialCommunityIcons name={icon} size={24} color="#2dd4bf" />
            </View>
            <View style={styles.featContent}>
                <Text style={styles.featTitle}>{title}</Text>
                <Text style={styles.featDesc}>{desc}</Text>
            </View>
        </View>
    );

    const RoleCard = ({ type, icon, label, selected, isRequired }) => (
        <TouchableOpacity 
            style={[styles.roleCard, selected && styles.roleCardActive]} 
            onPress={() => setRole(type)}
        >
            <MaterialCommunityIcons name={icon} size={28} color={selected ? "#fff" : "#94a3b8"} />
            <Text style={[styles.roleLabel, selected && styles.roleLabelActive]}>{label}</Text>
            {isRequired && (
                <View style={styles.reqBadge}>
                    <Text style={styles.reqText}>↑ Required</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Onboarding Section */}
                    <View style={styles.onboarding}>
                        <View style={styles.brandRow}>
                            <View style={styles.logoPill}>
                                <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
                            </View>
                            <Text style={styles.brandTitle}>HealthHub<Text style={{color: '#2dd4bf'}}>AI</Text></Text>
                        </View>

                        <Text style={styles.heroText}>Join the</Text>
                        <Text style={styles.heroGradient}>Next Gen Network.</Text>

                        <View style={styles.featContainer}>
                            <FeatureCard icon="check-circle-outline" title="Real-time Triage" desc="Get AI assessment in seconds." />
                            <FeatureCard icon="map-marker-radius-outline" title="Geospatial Discovery" desc="Find donors and doctors near you." />
                            <FeatureCard icon="shield-check-outline" title="Blockchain Security" desc="Secure medical data encryption." />
                        </View>
                    </View>

                    {/* Identity Form */}
                    <View style={styles.formPanel}>
                        <Text style={styles.formTitle}>Create Identity</Text>
                        <Text style={styles.formSubtitle}>Join 12,000+ clinical users worldwide.</Text>

                        <View style={styles.inputGroup}>
                            <View style={styles.identityInput}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#64748b" />
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="Full Name" 
                                    placeholderTextColor="#475569"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.identityInput}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" />
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="Email Address" 
                                    placeholderTextColor="#475569"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.identityInput}>
                                <MaterialCommunityIcons name="phone-outline" size={20} color="#64748b" />
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="Phone Number" 
                                    placeholderTextColor="#475569"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.identityInput}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" />
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="Password" 
                                    placeholderTextColor="#475569"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <Text style={styles.groupLabel}>SYSTEM ROLE</Text>
                        <View style={styles.roleContainer}>
                            <RoleCard type="patient" icon="heart-pulse" label="Patient" selected={role === 'patient'} />
                            <RoleCard type="donor" icon="water-outline" label="Donor" selected={role === 'donor'} />
                        </View>

                        {role === 'donor' && (
                            <View style={styles.donorExtended}>
                                <View style={styles.locationWarning}>
                                    <MaterialCommunityIcons name="navigation-variant" size={16} color="#fbbf24" />
                                    <Text style={styles.warningText}>Location is required — enables nearby donor matching</Text>
                                </View>
                                
                                {!location ? (
                                    <TouchableOpacity style={styles.locBtn} onPress={handleGetLocation} disabled={isLocating}>
                                        {isLocating ? (
                                            <ActivityIndicator color="#2dd4bf" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#2dd4bf" />
                                                <Text style={styles.locBtnText}>Use Current Location</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.locSecured}>
                                        <View style={styles.locSecuredLeft}>
                                            <View style={styles.checkCircle}>
                                               <MaterialCommunityIcons name="check" size={14} color="#10b981" />
                                            </View>
                                            <Text style={styles.locSecuredText}>Location secured</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setLocation(null)}>
                                            <Text style={styles.resetText}>⚙ Reset</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View style={styles.typeToggle}>
                                    <TouchableOpacity 
                                        style={[styles.typeBtn, donationType === 'blood' && styles.typeBtnActive]}
                                        onPress={() => setDonationType('blood')}
                                    >
                                        <MaterialCommunityIcons name="water" size={18} color={donationType === 'blood' ? '#fff' : '#ef4444'} />
                                        <Text style={[styles.typeBtnText, donationType === 'blood' && styles.typeBtnTextActive]}>Blood</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.typeBtn, donationType === 'milk' && styles.typeBtnActive]}
                                        onPress={() => setDonationType('milk')}
                                    >
                                        <MaterialCommunityIcons name="baby-bottle" size={18} color={donationType === 'milk' ? '#fff' : '#94a3b8'} />
                                        <Text style={[styles.typeBtnText, donationType === 'milk' && styles.typeBtnTextActive]}>Human Milk</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity disabled={isLoading} onPress={handleRegister} style={{ marginTop: 25 }}>
                            <LinearGradient
                                colors={['#0d9488', '#4f46e5']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 0}}
                                style={styles.submitBtn}
                            >
                                <Text style={styles.submitBtnText}>
                                    {isLoading ? 'CREATING IDENTITY...' : (role === 'donor' && !location) ? 'ENABLE LOCATION TO CONTINUE' : 'REGISTER ACCOUNT'}
                                </Text>
                                {!isLoading && <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerText}>
                                ALREADY HAVE AN IDENTITY? <Text style={styles.footerHighlight}>SIGN IN SYSTEM</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 30, paddingTop: 60 },
    
    // Onboarding
    onboarding: { marginBottom: 50 },
    brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
    logoPill: { backgroundColor: '#3b82f6', width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    brandTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -1 },
    heroText: { color: '#fff', fontSize: 48, fontWeight: '800' },
    heroGradient: { color: '#2dd4bf', fontSize: 48, fontWeight: '800', marginTop: -10 },
    
    featContainer: { marginTop: 40, gap: 15 },
    featCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    featIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(45, 212, 191, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    featTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
    featDesc: { color: '#94a3b8', fontSize: 13, marginTop: 2 },

    // Form
    formPanel: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 40, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    formTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
    formSubtitle: { color: '#94a3b8', fontSize: 14, marginTop: 5, marginBottom: 30 },
    
    inputGroup: { gap: 12, marginBottom: 30 },
    identityInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 15, height: 60 },
    input: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500', marginLeft: 10 },
    
    groupLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 15 },
    roleContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    roleCard: { flex: 1, height: 120, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    roleCardActive: { backgroundColor: '#0d9488', borderColor: '#2dd4bf' },
    roleLabel: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginTop: 10 },
    roleLabelActive: { color: '#fff' },
    reqBadge: { position: 'absolute', bottom: 15, backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    reqText: { color: '#ef4444', fontSize: 8, fontWeight: 'bold' },

    // Donor Extras
    donorExtended: { gap: 15, marginBottom: 20 },
    locationWarning: { flexDirection: 'row', backgroundColor: 'rgba(251, 191, 36, 0.05)', padding: 12, borderRadius: 12, alignItems: 'center', gap: 10 },
    warningText: { color: '#fbbf24', fontSize: 9, fontWeight: 'bold', flex: 1 },
    locBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', height: 60, borderRadius: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    locBtnText: { color: '#f8fafc', fontSize: 14, fontWeight: '700' },
    
    locSecured: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(16, 185, 129, 0.05)', height: 60, borderRadius: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
    locSecuredLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
    locSecuredText: { color: '#10b981', fontSize: 14, fontWeight: '700' },
    resetText: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
    
    typeToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.02)', padding: 6, borderRadius: 16, gap: 8 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 45, borderRadius: 12, gap: 8 },
    typeBtnActive: { backgroundColor: '#ef4444' },
    typeBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
    typeBtnTextActive: { color: '#fff' },

    submitBtn: { height: 65, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    
    footerLink: { marginTop: 30, alignItems: 'center' },
    footerText: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    footerHighlight: { color: '#2dd4bf' }
});

