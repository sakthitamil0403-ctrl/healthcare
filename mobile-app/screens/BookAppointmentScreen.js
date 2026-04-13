import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import api from '../utils/api';
import { appointmentService } from '../utils/api';

export default function BookAppointmentScreen({ navigation, route }) {
    const { user } = route.params || {};
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/doctors');
                setDoctors(res.data);
            } catch (error) {
                console.error("Failed to fetch doctors", error);
                Alert.alert("Error", "Could not load doctors list");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleBook = async () => {
        if (!selectedDoctor || !date || !time || !reason) {
            Alert.alert("Validation Error", "Please fill out all fields.");
            return;
        }

        try {
            // Primitive JS Date combination (for demo simplicity without installing additional DateTimePicker libraries)
            const dateTimeString = `${date}T${time}:00`;
            const appointmentDate = new Date(dateTimeString);

            if (isNaN(appointmentDate.getTime())) {
                Alert.alert("Validation Error", "Invalid Date/Time format. Use YYYY-MM-DD and HH:MM");
                return;
            }

            setSubmitting(true);
            await appointmentService.bookAppointment({
                doctorId: selectedDoctor._id,
                date: appointmentDate.toISOString(),
                reason
            });
            Alert.alert("Success", "Appointment Request Submitted Successfully!");
            navigation.navigate('Dashboard', { user });
        } catch (error) {
            console.error(error);
            Alert.alert("Booking Failed", error.response?.data?.message || "Could not book appointment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Book Appointment</Text>

            <View style={styles.section}>
                <Text style={styles.label}>1. Select Doctor</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorScroll}>
                    {doctors.map(doc => (
                        <TouchableOpacity 
                            key={doc._id} 
                            style={[styles.doctorCard, selectedDoctor?._id === doc._id && styles.doctorCardSelected]}
                            onPress={() => setSelectedDoctor(doc)}
                        >
                            <Text style={[styles.docName, selectedDoctor?._id === doc._id && styles.docNameSelected]}>Dr. {doc.user?.name}</Text>
                            <Text style={[styles.docSpec, selectedDoctor?._id === doc._id && styles.docSpecSelected]}>{doc.specialization}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>2. Date & Time</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="YYYY-MM-DD (e.g. 2026-04-10)" 
                    value={date} 
                    onChangeText={setDate} 
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="HH:MM (e.g. 14:30 for 2:30 PM)" 
                    value={time} 
                    onChangeText={setTime} 
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>3. Reason for Visit</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Describe your symptoms or reason for visit..." 
                    value={reason} 
                    onChangeText={setReason} 
                    multiline
                    numberOfLines={4}
                />
            </View>

            <TouchableOpacity 
                style={[styles.bookBtn, (!selectedDoctor || !date || !time || !reason || submitting) && styles.bookBtnDisabled]} 
                onPress={handleBook}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.bookBtnText}>Confirm Booking</Text>
                )}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
    section: { marginBottom: 25 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginBottom: 10 },
    doctorScroll: { flexDirection: 'row' },
    doctorCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginRight: 15, borderWidth: 2, borderColor: '#e2e8f0', width: 150 },
    doctorCardSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
    docName: { fontWeight: 'bold', color: '#1e293b', fontSize: 16 },
    docNameSelected: { color: '#2563eb' },
    docSpec: { color: '#64748b', fontSize: 12, marginTop: 4 },
    docSpecSelected: { color: '#3b82f6' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    bookBtn: { 
        backgroundColor: '#3b82f6', 
        padding: 18, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: 10,
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } 
            : { elevation: 2 })
    },
    bookBtnDisabled: { backgroundColor: '#93c5fd' },
    bookBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
