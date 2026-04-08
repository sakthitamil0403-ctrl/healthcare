import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appointmentService } from '../utils/api';

export default function DashboardScreen({ route, navigation }) {
    const { user } = route.params || { user: { name: 'User', role: 'patient' } };
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user.role === 'doctor' || user.role === 'patient') {
            fetchStats();
        }
    }, [user.role]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await appointmentService.getAppointments();
            setAppointments(res.data || []);
        } catch (error) {
            console.log('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.navigate('Login');
    };

    const renderQuickLinks = () => {
        const links = [];

        if (user.role === 'doctor') {
            links.push({ title: 'My Schedule', icon: '🗓️', nav: 'Appointments' });
            links.push({ title: 'My Profile', icon: '👨‍⚕️', nav: 'Profile' });
        } else if (user.role === 'patient') {
            links.push({ title: 'Appointments', icon: '📅', nav: 'Appointments' });
            links.push({ title: 'Book Now', icon: '🏥', nav: 'BookAppointment' });
            links.push({ title: 'Find Donors', icon: '🩸', nav: 'BloodDonation' });
            links.push({ title: 'Milk Bank', icon: '🍼', nav: 'MilkDonation' });
            links.push({ title: 'My Profile', icon: '👤', nav: 'Profile' });
        } else if (user.role === 'admin') {
            links.push({ title: 'Analytics', icon: '📊', nav: 'AdminDashboard' });
            links.push({ title: 'System Setup', icon: '⚙️', nav: 'Profile' });
        } else {
            links.push({ title: 'Donation Requests', icon: '🩸', nav: 'BloodDonation' });
            links.push({ title: 'Milk Bank', icon: '🍼', nav: 'MilkDonation' });
            links.push({ title: 'My Profile', icon: '👤', nav: 'Profile' });
        }

        return (
            <View style={styles.gridContainer}>
                {links.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.gridItem} 
                        onPress={() => navigation.navigate(item.nav, { user })}
                    >
                        <Text style={styles.gridIcon}>{item.icon}</Text>
                        <Text style={styles.gridText}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status)).slice(0, 3);
    const past = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status)).slice(0, 3);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Welcome back,</Text>
                <Text style={styles.name}>{user.name}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
            </View>

            {user.role === 'doctor' && (
                <View style={styles.statsContainer}>
                    <View style={[styles.statBox, { borderLeftColor: '#3b82f6', width: '47%' }]}>
                        <Text style={styles.statLabel}>Total Appts</Text>
                        <Text style={styles.statValue}>{appointments.length}</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftColor: '#f59e0b', width: '47%' }]}>
                        <Text style={styles.statLabel}>Pending</Text>
                        <Text style={styles.statValue}>{appointments.filter(a => a.status === 'pending').length}</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftColor: '#ef4444', width: '100%', marginTop: 15 }]}>
                        <Text style={styles.statLabel}>High Risk Alerts</Text>
                        <Text style={[styles.statValue, {color: '#ef4444'}]}>{appointments.filter(a => a.reliabilityScore < 60).length}</Text>
                    </View>
                </View>
            )}

            {user.role !== 'doctor' && (
                <View style={[styles.statsContainer, { justifyContent: 'space-between' }]}>
                    <View style={[styles.statBox, { borderLeftColor: '#10b981', width: '47%' }]}>
                        <Text style={styles.statLabel}>Sync Status</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                            <View style={[styles.dot, {backgroundColor: '#10b981'}]} />
                            <Text style={styles.statValueSm}>Online</Text>
                        </View>
                    </View>
                    <View style={[styles.statBox, { borderLeftColor: '#3b82f6', width: '47%' }]}>
                        <Text style={styles.statLabel}>AI Reliability</Text>
                        <Text style={styles.statValueSm}>95%</Text>
                    </View>
                </View>
            )}

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Quick Links</Text>
                {renderQuickLinks()}
            </View>

            {user.role === 'patient' && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Health Journey</Text>
                    {appointments.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No appointments yet.</Text>
                        </View>
                    ) : (
                        <>
                            {upcoming.length > 0 && (
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={styles.journeySub}>Upcoming Action Required</Text>
                                    {upcoming.map(a => (
                                        <View key={a._id} style={styles.journeyCard}>
                                            <View style={styles.journeyHeaderRow}>
                                                <Text style={styles.journeyDoc}>Dr. {a.doctor?.name || 'Unknown'}</Text>
                                                <View style={[styles.miniBadge, {backgroundColor: a.status === 'pending' ? '#fef08a' : '#bbf7d0'}]}>
                                                    <Text style={[styles.miniBadgeText, {color: a.status === 'pending' ? '#854d0e' : '#166534'}]}>{a.status.toUpperCase()}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.journeyDate}>
                                                {new Date(a.date).toLocaleDateString()} at {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </View>
            )}

            <View style={{ paddingHorizontal: 20, paddingBottom: 40, marginTop: 10 }}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>Secure Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { backgroundColor: '#1e3a8a', padding: 30, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    welcome: { color: '#bfdbfe', fontSize: 14, fontWeight: '600' },
    name: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginTop: 4 },
    roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
    roleText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    statsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: -25, justifyContent: 'space-between' },
    statBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, borderLeftWidth: 4, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    statLabel: { color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    statValue: { color: '#1e293b', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
    statValueSm: { color: '#1e293b', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    sectionContainer: { paddingHorizontal: 20, marginTop: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    gridIcon: { fontSize: 28, marginBottom: 10 },
    gridText: { fontSize: 13, fontWeight: 'bold', color: '#334155' },
    journeySub: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    emptyCard: { backgroundColor: '#fff', padding: 25, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
    emptyText: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
    journeyCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2 },
    journeyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    journeyDoc: { fontWeight: 'bold', color: '#1e293b', fontSize: 15 },
    miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    miniBadgeText: { fontSize: 10, fontWeight: 'bold' },
    journeyDate: { fontSize: 12, color: '#64748b', marginTop: 5 },
    logoutBtn: { backgroundColor: '#fef2f2', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },
    logoutBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 }
});
