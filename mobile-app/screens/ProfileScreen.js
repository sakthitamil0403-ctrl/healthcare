import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { patientService, authService } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ route, navigation }) {
    const { user } = route.params || {};
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Auth profile data
    const [name, setName] = useState(user?.name || '');
    const [image, setImage] = useState(user?.image || '');
    
    // Patient clinical data
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');

    useEffect(() => {
        if (user?.role === 'patient') {
            fetchPatientProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPatientProfile = async () => {
        try {
            const res = await patientService.getProfile(user.id);
            const data = res.data;
            if (data) {
                setAge(data.age ? data.age.toString() : '');
                setGender(data.gender || '');
                setBloodGroup(data.bloodGroup || '');
                setMedicalHistory(data.medicalHistory ? data.medicalHistory.join(', ') : '');
            }
        } catch (error) {
            console.log('No clinical profile found yet or error parsing.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        // Only request permissions if we are natively executing
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to update your avatar!');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await authService.updateProfile({ name, image });
            
            if (user?.role === 'patient') {
                const historyArray = medicalHistory.split(',').map(item => item.trim()).filter(item => item !== '');
                await patientService.updateProfile({
                    age: age ? parseInt(age) : null,
                    gender,
                    bloodGroup,
                    medicalHistory: historyArray
                });
            }
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error('Update error', error);
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerBackground}>
                <Text style={styles.headerTitle}>Account Settings</Text>
            </View>

            <View style={styles.formContainer}>
                
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarTextIcon}>👤</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Text style={styles.editBadgeIcon}>📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarSubtitle}>Tap to change avatar</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />
                    
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput style={[styles.input, styles.readOnly]} value={user?.email || ''} editable={false} />
                    <Text style={styles.hintText}>Emails cannot be changed directly for security reasons.</Text>
                </View>

                {user?.role === 'patient' && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Clinical Data</Text>
                        
                        <View style={styles.row}>
                            <View style={{flex: 1, marginRight: 10}}>
                                <Text style={styles.label}>Age</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} placeholder="e.g. 30" />
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={styles.label}>Blood Group</Text>
                                <TextInput style={styles.input} value={bloodGroup} onChangeText={setBloodGroup} placeholder="e.g. O+" />
                            </View>
                        </View>
                        
                        <Text style={styles.label}>Gender</Text>
                        <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Male, Female, Other" />
                        
                        <Text style={styles.label}>Medical History</Text>
                        <TextInput 
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                            multiline 
                            value={medicalHistory} 
                            onChangeText={setMedicalHistory} 
                            placeholder="Asthma, Diabetes (comma separated)" 
                        />
                    </View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Log Out Securely</Text>
                </TouchableOpacity>

            </View>
            <View style={{height: 40}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerBackground: { backgroundColor: '#1e3a8a', padding: 30, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    formContainer: { padding: 20, marginTop: -40 },
    avatarSection: { alignItems: 'center', marginBottom: 25 },
    avatarContainer: { position: 'relative' },
    avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#fff' },
    avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#bfdbfe', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' },
    avatarTextIcon: { fontSize: 40 },
    editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
    editBadgeIcon: { fontSize: 14 },
    avatarSubtitle: { marginTop: 8, fontSize: 12, color: '#64748b', fontWeight: '500' },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
    row: { flexDirection: 'row' },
    label: { fontSize: 13, color: '#64748b', marginBottom: 6, fontWeight: '600' },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 15, color: '#1e293b' },
    readOnly: { backgroundColor: '#f1f5f9', color: '#94a3b8' },
    hintText: { fontSize: 11, color: '#94a3b8', marginTop: -10, marginBottom: 15, fontStyle: 'italic' },
    saveButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    logoutButton: { backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#fecaca' },
    logoutButtonText: { color: '#ef4444', fontSize: 14, fontWeight: 'bold' }
});
