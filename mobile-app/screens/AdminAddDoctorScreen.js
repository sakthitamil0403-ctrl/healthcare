import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { adminService } from '../utils/api';

export default function AdminAddDoctorScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: ''
    });

    const handleOnboard = async () => {
        if (!form.name || !form.email || !form.password || !form.specialization || !form.experience) {
            Alert.alert('Incomplete Signal', 'Ensure all identity parameters are populated before onboarding.');
            return;
        }

        setLoading(true);
        try {
            await adminService.addDoctor(form);
            Alert.alert('Onboarding Success', `${form.name} has been successfully added to the clinical network.`, [
                { text: 'Finalize', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Onboarding Failed', err.response?.data?.message || 'The system was unable to verify this identity signal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Header Card */}
                <LinearGradient colors={['#4f46e5', '#3730a3']} style={styles.headerCard}>
                    <View style={styles.headerIconBox}>
                        <MaterialCommunityIcons name="stethoscope" size={32} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Onboard Doctor</Text>
                        <View style={styles.authTag}>
                            <MaterialCommunityIcons name="shield-check" size={14} color="#4ade80" />
                            <Text style={styles.authText}>ADMIN AUTHORIZATION ENABLED</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.formBox}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>FULL NAME</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#94a3b8" />
                            <TextInput 
                                style={styles.input}
                                placeholder="Dr. John Doe"
                                placeholderTextColor="#94a3b8"
                                value={form.name}
                                onChangeText={(t) => setForm({...form, name: t})}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#94a3b8" />
                            <TextInput 
                                style={styles.input}
                                placeholder="doctor@healthhub.ai"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={form.email}
                                onChangeText={(t) => setForm({...form, email: t})}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>INITIAL PASSWORD</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color="#94a3b8" />
                            <TextInput 
                                style={styles.input}
                                placeholder="Secure password"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                value={form.password}
                                onChangeText={(t) => setForm({...form, password: t})}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>SPECIALIZATION</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Cardiology"
                                    placeholderTextColor="#94a3b8"
                                    value={form.specialization}
                                    onChangeText={(t) => setForm({...form, specialization: t})}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { width: 100 }]}>
                            <Text style={styles.label}>YRS EXP</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="5"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={form.experience}
                                    onChangeText={(t) => setForm({...form, experience: t})}
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
                        onPress={handleOnboard}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>CREATE DOCTOR ACCOUNT</Text>
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 30 },
    headerCard: { padding: 30, borderRadius: 40, flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
    headerIconBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
    authTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    authText: { fontSize: 9, fontWeight: '900', color: '#818cf8', letterSpacing: 1.5 },

    formBox: { gap: 25 },
    inputGroup: { gap: 8 },
    label: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1.5, marginLeft: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingVertical: 18, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    input: { flex: 1, fontSize: 14, fontWeight: '900', color: '#1e293b' },
    row: { flexDirection: 'row', gap: 15 },
    
    submitBtn: { backgroundColor: '#4f46e5', paddingVertical: 20, alignItems: 'center', borderRadius: 24, marginTop: 10, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 2 }
});
