import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { authService } from '../utils/api';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    
    // Donor specific fields
    const [bloodType, setBloodType] = useState('O+');
    const [donationType, setDonationType] = useState('blood');

    const handleRegister = async () => {
        try {
            const payload = { name, email, password, role };
            if (role === 'donor') {
                payload.bloodType = bloodType;
                payload.donationType = donationType;
                // Add fallback coordinates to satisfy 2dsphere index
                // In production, wire this to expo-location for real GPS
                payload.location = {
                    type: 'Point',
                    coordinates: [79.132, 10.985] // Generic fallback map coordinate
                };
            }
            
            await authService.register(payload);
            Alert.alert('Success', 'Account created successfully');
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        }
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <Text style={styles.sectionLabel}>Select Role:</Text>
            <View style={styles.roleContainer}>
                {['patient', 'doctor', 'donor'].map((r) => (
                    <TouchableOpacity 
                        key={r} 
                        style={[styles.roleButton, role === r && styles.roleButtonActive]} 
                        onPress={() => setRole(r)}
                    >
                        <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {role === 'donor' && (
                <View style={styles.donorSection}>
                    <Text style={styles.sectionLabel}>Donation Type:</Text>
                    <View style={styles.donationTypeContainer}>
                        <TouchableOpacity 
                            style={[styles.typeBtn, donationType === 'blood' && styles.typeBtnActive]} 
                            onPress={() => setDonationType('blood')}
                        >
                            <Text style={donationType === 'blood' ? styles.typeTextActive : styles.typeText}>Blood 🩸</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.typeBtn, donationType === 'milk' && styles.typeBtnActive]} 
                            onPress={() => setDonationType('milk')}
                        >
                            <Text style={donationType === 'milk' ? styles.typeTextActive : styles.typeText}>Milk 🍼</Text>
                        </TouchableOpacity>
                    </View>

                    {donationType === 'blood' && (
                        <>
                            <Text style={styles.sectionLabel}>Blood Group:</Text>
                            <View style={styles.bloodGrid}>
                                {bloodTypes.map(type => (
                                    <TouchableOpacity 
                                        key={type} 
                                        style={[styles.bloodBtn, bloodType === type && styles.bloodBtnActive]}
                                        onPress={() => setBloodType(type)}
                                    >
                                        <Text style={bloodType === type ? styles.bloodTextActive : styles.bloodText}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
            <View style={{height: 30}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#3b82f6' },
    sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 10 },
    inputContainer: { marginBottom: 15 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    roleButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#3b82f6', width: '31%', alignItems: 'center' },
    roleButtonActive: { backgroundColor: '#3b82f6' },
    roleText: { color: '#3b82f6', fontWeight: 'bold' },
    roleTextActive: { color: '#fff' },
    donorSection: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#e2e8f0' },
    donationTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    typeBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
    typeBtnActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    typeText: { color: '#475569', fontWeight: 'bold' },
    typeTextActive: { color: '#fff', fontWeight: 'bold' },
    bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    bloodBtn: { width: '22%', padding: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    bloodBtnActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    bloodText: { color: '#475569', fontWeight: 'bold' },
    bloodTextActive: { color: '#fff', fontWeight: 'bold' },
    button: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { textAlign: 'center', marginTop: 20, color: '#3b82f6', fontWeight: 'bold' }
});
