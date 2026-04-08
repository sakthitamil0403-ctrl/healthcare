import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { appointmentService } from '../utils/api';

const STATUS_COLORS = {
    pending: { label: 'Pending', bg: '#dbeafe', text: '#1d4ed8' },
    approved: { label: 'Approved', bg: '#dcfce7', text: '#15803d' },
    completed: { label: 'Completed', bg: '#f3e8ff', text: '#7e22ce' },
    rejected: { label: 'Rejected', bg: '#fee2e2', text: '#b91c1c' },
    cancelled: { label: 'Cancelled', bg: '#f1f5f9', text: '#64748b' }
};

export default function AppointmentsScreen({ route }) {
    const { user } = route.params || {};
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Feature Parity specific states
    const [activeTab, setActiveTab] = useState('upcoming');
    const [rescheduleData, setRescheduleData] = useState(null);
    const [profileModal, setProfileModal] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await appointmentService.getAppointments();
            setAppointments(res.data || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not fetch appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            if (status === 'cancelled') {
                await appointmentService.cancelAppointment(id);
            } else {
                await appointmentService.updateAppointmentStatus(id, status);
            }
            Alert.alert("Success", `Appointment marked as ${status}`);
            fetchAppointments();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not update appointment status");
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleData.date) { Alert.alert('Error', 'Please pick a date.'); return; }
        try {
            await appointmentService.rescheduleAppointment(rescheduleData.appointmentId, {
                date: rescheduleData.date,
                time: rescheduleData.time || '09:00'
            });
            Alert.alert('Success', 'Rescheduled successfully');
            setRescheduleData(null);
            fetchAppointments();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not reschedule appointment");
        }
    };

    const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status));
    const past = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status));
    const displayed = activeTab === 'upcoming' ? upcoming : past;

    const renderItem = ({ item }) => {
        const isDoctor = user?.role === 'doctor';
        const personName = isDoctor ? item.patient?.name : item.doctor?.name;
        const personEmail = isDoctor ? item.patient?.email : item.doctor?.email;
        const statusCfg = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
        
        const isHighRisk = item.riskLevel === 'high' || item.reliabilityScore < 60;
        
        const dateObj = new Date(item.date);
        
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeMonth}>{dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
                        <Text style={styles.dateBadgeDay}>{dateObj.getDate()}</Text>
                    </View>
                    <View style={styles.personInfo}>
                        <Text style={styles.name}>{personName || 'Unknown'}</Text>
                        <Text style={styles.email}>{personEmail || 'No email'}</Text>
                        <Text style={styles.dateText}>{dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                    </View>
                </View>

                {/* AI Reliability Badge */}
                <View style={styles.aiBadgeRow}>
                    <View style={[styles.scoreBadge, item.reliabilityScore >= 80 ? styles.scoreGreen : item.reliabilityScore >= 60 ? styles.scoreYellow : styles.scoreRed]}>
                        <Text style={styles.scoreText}>AI Rel: {item.reliabilityScore ?? '--'}%</Text>
                    </View>
                    <View style={[styles.riskBadge, isHighRisk ? styles.riskHigh : styles.riskLow]}>
                        <Text style={[styles.riskText, isHighRisk ? styles.riskHighText : styles.riskLowText]}>
                            {isHighRisk ? '⚠ High Risk' : '✔ Low Risk'}
                        </Text>
                    </View>
                </View>

                {item.reason && (
                    <View style={styles.reasonBox}>
                        <Text style={styles.reasonText}><Text style={{fontWeight: 'bold'}}>Reason:</Text> {item.reason}</Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    {!isDoctor && item.status === 'pending' && (
                        <>
                            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => setRescheduleData({ appointmentId: item._id, date: '', time: '' })}>
                                <Text style={styles.btnOutlineText}>Reschedule</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnRejectFade]} onPress={() => {
                                Alert.alert("Cancel Appointment", "Are you sure you want to cancel?", [
                                    { text: "No", style: "cancel" },
                                    { text: "Yes", onPress: () => handleStatusUpdate(item._id, 'cancelled'), style: 'destructive' }
                                ]);
                            }}>
                                <Text style={styles.btnRejectFadeText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {isDoctor && item.status === 'pending' && (
                        <>
                            <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleStatusUpdate(item._id, 'approved')}>
                                <Text style={styles.btnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleStatusUpdate(item._id, 'rejected')}>
                                <Text style={styles.btnText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => setProfileModal(item.patientClinical || { user: item.patient })}>
                                <Text style={styles.btnOutlineText}>Profile</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {isDoctor && item.status === 'approved' && (
                        <>
                            <TouchableOpacity style={[styles.btn, styles.btnComplete]} onPress={() => handleStatusUpdate(item._id, 'completed')}>
                                <Text style={styles.btnText}>Mark Completed</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => setProfileModal(item.patientClinical || { user: item.patient })}>
                                <Text style={styles.btnOutlineText}>Profile</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {isDoctor && ['completed', 'rejected', 'cancelled'].includes(item.status) && (
                         <TouchableOpacity style={[styles.btn, styles.btnOutline, { flex: undefined, paddingHorizontal: 20 }]} onPress={() => setProfileModal(item.patientClinical || { user: item.patient })}>
                            <Text style={styles.btnOutlineText}>View Historical Profile</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]} onPress={() => setActiveTab('upcoming')}>
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming ({upcoming.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'past' && styles.tabActive]} onPress={() => setActiveTab('past')}>
                    <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>Past ({past.length})</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No {activeTab} appointments found.</Text>}
                />
            )}

            {/* Reschedule Modal */}
            <Modal visible={!!rescheduleData} transparent={true} animationType="slide">
                <View style={styles.modalSubContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reschedule Appointment</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="YYYY-MM-DD" 
                            value={rescheduleData?.date} 
                            onChangeText={(t) => setRescheduleData({...rescheduleData, date: t})}
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="HH:MM (24-hour)" 
                            value={rescheduleData?.time} 
                            onChangeText={(t) => setRescheduleData({...rescheduleData, time: t})}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => setRescheduleData(null)}>
                                <Text style={styles.btnOutlineText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={handleReschedule}>
                                <Text style={styles.btnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Patient Profile Modal */}
            <Modal visible={!!profileModal} transparent={true} animationType="slide">
                <View style={styles.modalSubContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{profileModal?.user?.name || 'Patient Profile'}</Text>
                        <Text style={styles.personEmail}>{profileModal?.user?.email}</Text>
                        
                        <View style={styles.clinicalBox}>
                            <View style={styles.clinicalRow}>
                                <Text style={styles.clinicalLabel}>Age/Gender:</Text>
                                <Text style={styles.clinicalValue}>{profileModal?.age || '--'} / {profileModal?.gender || '--'}</Text>
                            </View>
                            <View style={styles.clinicalRow}>
                                <Text style={styles.clinicalLabel}>Blood Group:</Text>
                                <Text style={[styles.clinicalValue, { color: '#ef4444' }]}>{profileModal?.bloodGroup || '--'}</Text>
                            </View>
                            <Text style={[styles.clinicalLabel, { marginTop: 10 }]}>Medical History:</Text>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 5}}>
                                {profileModal?.medicalHistory?.length ? profileModal.medicalHistory.map((h, i) => (
                                    <View key={i} style={styles.historyPill}><Text style={styles.historyText}>{h}</Text></View>
                                )) : <Text style={styles.emptyTextSm}>No history</Text>}
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.btn, styles.btnCloseModal, {marginTop: 15}]} onPress={() => setProfileModal(null)}>
                            <Text style={styles.btnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
    tabText: { color: '#64748b', fontWeight: 'bold' },
    tabTextActive: { color: '#3b82f6' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: '#f1f5f9' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    dateBadge: { backgroundColor: '#eff6ff', borderRadius: 10, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    dateBadgeMonth: { fontSize: 10, fontWeight: 'bold', color: '#60a5fa' },
    dateBadgeDay: { fontSize: 18, fontWeight: '900', color: '#1d4ed8' },
    personInfo: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    email: { fontSize: 12, color: '#94a3b8' },
    dateText: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '500' },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    aiBadgeRow: { flexDirection: 'row', marginVertical: 8, gap: 10 },
    scoreBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
    scoreGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    scoreYellow: { backgroundColor: '#fefce8', borderColor: '#fef08a' },
    scoreRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    scoreText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
    riskBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    riskHigh: { backgroundColor: '#fef2f2' },
    riskLow: { backgroundColor: '#f0fdf4' },
    riskHighText: { fontSize: 12, fontWeight: 'bold', color: '#ef4444' },
    riskLowText: { fontSize: 12, fontWeight: 'bold', color: '#10b981' },
    reasonBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginTop: 8 },
    reasonText: { fontSize: 13, color: '#475569' },
    actionRow: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15, gap: 8 },
    btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnApprove: { backgroundColor: '#10b981' },
    btnComplete: { backgroundColor: '#3b82f6' },
    btnReject: { backgroundColor: '#ef4444' },
    btnRejectFade: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
    btnRejectFadeText: { color: '#ef4444', fontWeight: 'bold' },
    btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#cbd5e1' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    btnOutlineText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
    emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 15, fontWeight: '500' },
    emptyTextSm: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
    modalSubContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginBottom: 15, backgroundColor: '#f8fafc' },
    modalActions: { flexDirection: 'row', gap: 10 },
    personEmail: { fontSize: 14, color: '#64748b', marginBottom: 15 },
    clinicalBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    clinicalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    clinicalLabel: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
    clinicalValue: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
    historyPill: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#dbeafe' },
    historyText: { fontSize: 11, color: '#1d4ed8', fontWeight: '600' },
    btnCloseModal: { backgroundColor: '#1e293b' }
});
