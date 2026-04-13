import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { appointmentService } from '../utils/api';

export default function VoiceBookingModal({ visible, onClose, user }) {
    const [recording, setRecording] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, recording, processing, success, error
    const [result, setResult] = useState(null);
    const [language, setLanguage] = useState('en-US');

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync().catch(() => {});
            }
        };
    }, [recording]);

    async function startRecording() {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                Alert.alert('Permission Required', 'Microphone access is needed for voice booking.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setStatus('recording');
        } catch (err) {
            console.error('Failed to start recording', err);
            setStatus('error');
        }
    }

    async function stopRecording() {
        if (!recording) return;
        const _recording = recording;
        setRecording(null); // Clear early to prevent redundant unloads
        setStatus('processing');
        
        try {
            try {
                await _recording.stopAndUnloadAsync();
            } catch (e) {
                // Already stopped
            }
            
            const uri = _recording.getURI();
            const formData = new FormData();
            
            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                formData.append('audio', blob, 'recording.wav');
            } else {
                formData.append('audio', {
                    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                    type: 'audio/wav',
                    name: 'recording.wav',
                });
            }
            formData.append('language', language);

            const res = await appointmentService.bookVoiceAppointment(formData);
            setResult(res.data);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            Alert.alert("Execution Error", "Could not process voice. Check if the AI Service is running.");
        }
    }

    const reset = () => {
        setStatus('idle');
        setResult(null);
        setRecording(null);
    };

    const renderContent = () => {
        if (status === 'idle') {
            return (
                <>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="microphone-outline" size={48} color="#10b981" />
                    </View>
                    <Text style={styles.title}>Ready to listen</Text>
                    <Text style={styles.desc}>Tap the microphone to book your appointment using natural voice.</Text>
                    
                    <View style={styles.langToggle}>
                        <TouchableOpacity 
                            style={[styles.langBtn, language === 'en-US' && styles.langBtnActive]} 
                            onPress={() => setLanguage('en-US')}
                        >
                            <Text style={[styles.langBtnText, language === 'en-US' && styles.langBtnTextActive]}>English</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.langBtn, language === 'ta-IN' && styles.langBtnActive]} 
                            onPress={() => setLanguage('ta-IN')}
                        >
                            <Text style={[styles.langBtnText, language === 'ta-IN' && styles.langBtnTextActive]}>தமிழ்</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                        <View style={styles.recordInner}>
                            <MaterialCommunityIcons name="microphone" size={48} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </>
            );
        }

        if (status === 'recording') {
            return (
                <>
                    <View style={styles.waveContainer}>
                        <ActivityIndicator size="large" color="#ef4444" />
                    </View>
                    <Text style={styles.title}>Listening...</Text>
                    <Text style={styles.desc}>Speak clearly now. Tap stop when finished.</Text>
                    <TouchableOpacity style={[styles.recordButton, styles.stopButton]} onPress={stopRecording}>
                        <View style={styles.stopInner} />
                    </TouchableOpacity>
                </>
            );
        }

        if (status === 'processing') {
            return (
                <>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.title}>Processing Voice</Text>
                    <Text style={styles.desc}>Our AI is transcribing and extracting your appointment details...</Text>
                </>
            );
        }

        if (status === 'success' && result) {
            return (
                <View style={{ width: '100%' }}>
                    <View style={styles.successHeader}>
                        <MaterialCommunityIcons name="check-circle" size={60} color="#059669" />
                        <Text style={styles.successTitle}>Booking Confirmed!</Text>
                    </View>
                    
                    <View style={styles.resultBox}>
                        <Text style={styles.resultLabel}>TRANSCRIPT</Text>
                        <Text style={styles.transcriptText}>"{result.transcript}"</Text>
                        
                        {result.translated && (
                            <>
                                <Text style={[styles.resultLabel, {marginTop: 15}]}>TRANSLATION</Text>
                                <Text style={styles.translatedText}>"{result.translated}"</Text>
                            </>
                        )}

                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>DOCTOR</Text>
                                <Text style={styles.detailValue}>Dr. {result.appointment?.doctor?.name || 'Assigned'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>SCHEDULE</Text>
                                <Text style={styles.detailValue}>
                                    {result.appointment?.date ? new Date(result.appointment.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Flexible'}
                                    {" @ "}
                                    {result.appointment?.date ? new Date(result.appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.doneBtn} onPress={() => { reset(); onClose(); }}>
                        <Text style={styles.doneBtnText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <>
                <Text style={styles.title}>Something went wrong</Text>
                <TouchableOpacity style={styles.doneBtn} onPress={reset}>
                    <Text style={styles.doneBtnText}>Try Again</Text>
                </TouchableOpacity>
            </>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {renderContent()}
                    <TouchableOpacity 
                        style={styles.closeBtn} 
                        onPress={() => {
                            reset();
                            onClose();
                        }}
                    >
                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { 
        width: '100%', 
        backgroundColor: '#fff', 
        borderRadius: 30, 
        padding: 30, 
        alignItems: 'center',
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } 
            : { elevation: 20 })
    },
    closeBtn: { 
        position: 'absolute', 
        right: 20, 
        top: 20, 
        width: 35, 
        height: 35, 
        borderRadius: 18, 
        backgroundColor: '#f1f5f9', 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 10
    },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
    desc: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
    langToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 30 },
    langBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    langBtnActive: { 
        backgroundColor: '#fff', 
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' } 
            : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 })
    },
    langBtnText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    langBtnTextActive: { color: '#0f172a', fontWeight: 'bold' },
    recordButton: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        backgroundColor: '#10b981', 
        padding: 10, 
        justifyContent: 'center', 
        alignItems: 'center',
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 2px 5px rgba(0,0,0,0.2)' } 
            : { elevation: 5 })
    },
    recordInner: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    waveContainer: { height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    stopButton: { backgroundColor: '#ef4444' },
    stopInner: { width: 30, height: 30, borderRadius: 6, backgroundColor: '#fff' },
    successHeader: { alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: '#059669' },
    resultBox: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 20, width: '100%', borderWidth: 1, borderColor: '#e2e8f0' },
    resultLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 8 },
    transcriptText: { fontSize: 16, color: '#1e293b', fontStyle: 'italic', lineHeight: 24 },
    translatedText: { fontSize: 16, color: '#2563eb', fontStyle: 'italic', fontWeight: '500' },
    detailsRow: { flexDirection: 'row', marginTop: 25, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 20, gap: 15 },
    detailItem: { flex: 1 },
    detailLabel: { fontSize: 9, fontWeight: '900', color: '#64748b', letterSpacing: 1, marginBottom: 4 },
    detailValue: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    doneBtn: { backgroundColor: '#1e293b', width: '100%', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 25 },
    doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
