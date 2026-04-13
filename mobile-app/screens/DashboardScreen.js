import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { appointmentService } from '../utils/api';
import VoiceBookingModal from './VoiceBookingModal';

const { width } = Dimensions.get('window');

const RoleHero = ({ role, name }) => {
    const config = {
        patient: { colors: ['#0d9488', '#059669'], icon: 'heart-pulse', label: 'HEALTH JOURNEY' },
        doctor: { colors: ['#4f46e5', '#4338ca'], icon: 'stethoscope', label: 'CLINICAL QUEUE' },
        donor: { colors: ['#e11d48', '#be123c'], icon: 'water-outline', label: 'LIFE SAVER' },
        milk_donor: { colors: ['#db2777', '#be185d'], icon: 'baby-bottle-outline', label: 'PRECIOUS GIFT' },
        admin: { colors: ['#1e293b', '#0f172a'], icon: 'shield-check-outline', label: 'SYSTEM CORE' }
    };

    const cfg = config[role] || config.patient;

    return (
        <LinearGradient colors={cfg.colors} style={styles.hero}>
            <View style={styles.heroGlass}>
                <MaterialCommunityIcons 
                    name={cfg.icon} 
                    size={160} 
                    color="rgba(255,255,255,0.06)" 
                    style={styles.heroBgIcon} 
                />
                <View style={styles.heroTop}>
                    <View style={styles.heroLabelBox}>
                        <MaterialCommunityIcons name={cfg.icon} size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.heroLabel}>{cfg.label}</Text>
                    </View>
                    <View style={styles.neuralIndicator}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.neuralText}>NEURAL CORE ACTIVE</Text>
                    </View>
                </View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.nameText}>{name}</Text>
            </View>
        </LinearGradient>
    );
};

const ImpactCard = ({ label, value, icon, color }) => (
    <View style={styles.impactCard}>
        <View style={[styles.impactIconBox, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.impactValue}>{value}</Text>
        <Text style={styles.impactLabel}>{label}</Text>
    </View>
);

const ActionCard = ({ title, sub, icon, color, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.actionIconBox, { backgroundColor: color }]}>
            <MaterialCommunityIcons name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSub}>{sub}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
    </TouchableOpacity>
);

export default function DashboardScreen({ route, navigation }) {
    const { user } = route.params || { user: { name: 'User', role: 'patient' } };
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [voiceModalVisible, setVoiceModalVisible] = useState(false);

    useEffect(() => {
        fetchStats();
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

    const renderActions = () => {
        const actions = [];
        if (user.role === 'doctor') {
            actions.push({ title: 'My Schedule', sub: 'Manage clinical queue', icon: 'calendar-account', color: '#4f46e5', nav: 'Appointments' });
            actions.push({ title: 'Clinical Network', sub: 'Find nearby life-savers', icon: 'water-outline', color: '#e11d48', nav: 'BloodDonation' });
            actions.push({ title: 'Risk Monitor', sub: 'Triage high-risk cases', icon: 'alert-decagram-outline', color: '#f59e0b', nav: 'Appointments' });
        } else if (user.role === 'patient') {
            actions.push({ title: 'Book AI Consult', sub: 'Schedule neural session', icon: 'robot-outline', color: '#0d9488', nav: 'BookAppointment' });
            actions.push({ title: 'Upcoming Appts', sub: 'Track your health journey', icon: 'calendar-check', color: '#4f46e5', nav: 'Appointments' });
            actions.push({ title: 'Find Donors', sub: 'Locate nearby fleet', icon: 'water-outline', color: '#e11d48', nav: 'BloodDonation' });
            actions.push({ title: 'Milk Bank', sub: 'Explore collection spots', icon: 'baby-bottle-outline', color: '#db2777', nav: 'MilkDonation' });
        } else if (user.role === 'admin') {
            actions.push({ title: 'Analytics monitor', sub: 'Triage and system core', icon: 'chart-bar', color: '#1e293b', nav: 'AdminDashboard' });
        } else if (user.role === 'donor') {
            const donationType = user.donationType === 'milk' ? 'Milk' : 'Blood';
            const icon = user.donationType === 'milk' ? 'baby-bottle-outline' : 'water-outline';
            const color = user.donationType === 'milk' ? '#db2777' : '#e11d48';
            actions.push({ title: `${donationType} Requests`, sub: 'View local requirements', icon: icon, color: color, nav: user.donationType === 'milk' ? 'MilkDonation' : 'BloodDonation' });
        }
        
        actions.push({ title: 'My Profile', sub: 'Identity verification', icon: 'account-circle-outline', color: '#64748b', nav: 'Profile' });

        return (
            <View style={styles.actionsGrid}>
                {actions.map((item, i) => (
                    <ActionCard 
                        key={i} 
                        {...item} 
                        onPress={() => navigation.navigate(item.nav, { user })} 
                    />
                ))}
            </View>
        );
    };

    const upcoming = appointments
        .filter(a => ['pending', 'approved'].includes(a.status))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <RoleHero role={user.role === 'donor' && user.donationType === 'milk' ? 'milk_donor' : user.role} name={user.name} />
                
                <View style={styles.content}>
                    {/* Impact Metrics */}
                    <View style={styles.impactGrid}>
                        {user.role === 'doctor' ? (
                            <>
                                <ImpactCard label="Total Appts" value={appointments.length} icon="calendar-check" color="#4f46e5" />
                                <ImpactCard label="Pending" value={appointments.filter(a => a.status === 'pending').length} icon="clock-outline" color="#f59e0b" />
                                <ImpactCard label="Risk Alerts" value={appointments.filter(a => a.reliabilityScore < 60).length} icon="alert-decagram" color="#ef4444" />
                            </>
                        ) : (
                            <>
                                <ImpactCard label="Sync Health" value="Active" icon="swap-vertical" color="#10b981" />
                                <ImpactCard label="AI Reliability" value="98%" icon="zap" color="#f59e0b" />
                                <ImpactCard label="Impact Score" value="840" icon="star-face" color="#4f46e5" />
                            </>
                        )}
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Neural Quick Actions</Text>
                        <MaterialCommunityIcons name="dots-horizontal" size={20} color="#94a3b8" />
                    </View>

                    {renderActions()}

                    {user.role === 'patient' && (
                        <View style={styles.timelineSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Upcoming Timeline</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
                                    <Text style={styles.viewAll}>VIEW ALL</Text>
                                </TouchableOpacity>
                            </View>

                            {upcoming.length === 0 ? (
                                <View style={styles.emptyTimeline}>
                                    <MaterialCommunityIcons name="calendar-blank" size={32} color="#e2e8f0" />
                                    <Text style={styles.emptyText}>No clinical activities scheduled.</Text>
                                </View>
                            ) : (
                                upcoming.map(a => (
                                    <View key={a._id} style={styles.timelineItem}>
                                        <View style={styles.timelineLeft}>
                                            <View style={styles.timelineDot} />
                                            <View style={styles.timelineLine} />
                                        </View>
                                        <View style={styles.timelineCard}>
                                            <View style={styles.timelineCardHeader}>
                                                <Text style={styles.timelineDoc}>Dr. {a.doctor?.name || 'Practitioner'}</Text>
                                                <View style={[styles.statusBadge, { backgroundColor: a.status === 'pending' ? '#fffbeb' : '#f0fdf4' }]}>
                                                    <Text style={[styles.statusText, { color: a.status === 'pending' ? '#92400e' : '#166534' }]}>{a.status.toUpperCase()}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.timelineMeta}>
                                                <MaterialCommunityIcons name="clock-outline" size={12} color="#94a3b8" />
                                                <Text style={styles.timelineDate}>
                                                    {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={20} color="#94a3b8" />
                        <Text style={styles.logoutText}>Secure Terminal Logout</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Voice AI FAB */}
            {user.role === 'patient' && (
                <View style={styles.fabWrapper}>
                    <TouchableOpacity 
                        style={styles.fab} 
                        onPress={() => setVoiceModalVisible(true)}
                    >
                        <LinearGradient colors={['#059669', '#10b981']} style={styles.fabGradient}>
                            <MaterialCommunityIcons name="microphone" size={32} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.fabLabel}>Neural Booking</Text>
                </View>
            )}

            <VoiceBookingModal 
                visible={voiceModalVisible}
                onClose={() => {
                    setVoiceModalVisible(false);
                    fetchStats(); 
                }}
                user={user}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    hero: { padding: 30, paddingTop: 60, paddingBottom: 50, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
    heroGlass: { width: '100%' },
    heroBgIcon: { position: 'absolute', right: -40, bottom: -40 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    heroLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    heroLabel: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
    neuralIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
    neuralText: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 'bold' },
    nameText: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: -1, marginTop: 4 },

    content: { paddingHorizontal: 25 },
    impactGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -30, marginBottom: 40 },
    impactCard: { width: (width - 70) / 3, backgroundColor: '#fff', padding: 15, borderRadius: 24, alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    impactIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    impactValue: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
    impactLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 },
    viewAll: { fontSize: 10, fontWeight: '900', color: '#4f46e5', letterSpacing: 1.5 },

    actionsGrid: { gap: 15 },
    actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    actionIconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    actionContent: { flex: 1, marginLeft: 15 },
    actionTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
    actionSub: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold', marginTop: 2 },

    timelineSection: { marginTop: 40 },
    emptyTimeline: { backgroundColor: '#f8fafc', padding: 40, borderRadius: 32, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0' },
    emptyText: { color: '#94a3b8', fontSize: 13, fontWeight: '900', marginTop: 15, textAlign: 'center' },
    timelineItem: { flexDirection: 'row', gap: 15, marginBottom: 10 },
    timelineLeft: { alignItems: 'center', width: 20 },
    timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4f46e5', borderWidth: 3, borderColor: '#fff', elevation: 2, zIndex: 10 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#f1f5f9', marginTop: -5 },
    timelineCard: { flex: 1, backgroundColor: '#fff', padding: 18, borderRadius: 24, borderTopRightRadius: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    timelineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    timelineDoc: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 9, fontWeight: '900' },
    timelineMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timelineDate: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },

    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40, padding: 20, borderRadius: 24, backgroundColor: '#f8fafc' },
    logoutText: { fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' },

    fabWrapper: { position: 'absolute', bottom: 30, right: 30, alignItems: 'center' },
    fab: { width: 70, height: 70, borderRadius: 35, overflow: 'hidden', elevation: 12, shadowColor: '#059669', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    fabGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    fabLabel: { fontSize: 9, fontWeight: '900', color: '#059669', letterSpacing: 1.5, marginTop: 8, textTransform: 'uppercase' }
});

