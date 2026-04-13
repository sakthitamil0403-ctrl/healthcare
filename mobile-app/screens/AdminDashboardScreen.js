import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { io } from 'socket.io-client';
import { adminService, getHost } from '../utils/api';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, icon, color, trend }) => (
    <View style={styles.statCard}>
        <View style={styles.statTop}>
            <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={icon} size={22} color={color} />
            </View>
            {trend && (
                <View style={styles.trendBadge}>
                    <MaterialCommunityIcons name="trending-up" size={10} color="#10b981" />
                    <Text style={styles.trendBadgeText}>{trend}%</Text>
                </View>
            )}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const AdvisoryCard = ({ type, title, text, icon }) => {
    const colors = {
        critical: { bg: '#fee2e2', border: '#fecaca', text: '#ef4444', label: 'CRITICAL INSIGHT' },
        warning: { bg: '#ffedd5', border: '#fed7aa', text: '#f97316', label: 'WARNING INSIGHT' },
        info: { bg: '#ccfbf1', border: '#99f6e4', text: '#0d9488', label: 'INFO INSIGHT' },
        action: { bg: '#e0e7ff', border: '#c7d2fe', text: '#4f46e5', label: 'ACTION INSIGHT' },
        success: { bg: '#dcfce7', border: '#bbf7d0', text: '#10b981', label: 'SUCCESS INSIGHT' },
    };
    const cfg = colors[type] || colors.info;

    return (
        <View style={[styles.advCard, { backgroundColor: `${cfg.bg}40`, borderColor: cfg.border }]}>
            <View style={styles.advIconBox}>
                <MaterialCommunityIcons name={icon} size={20} color={cfg.text} />
            </View>
            <View style={styles.advContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={[styles.advLabel, { color: cfg.text }]}>{cfg.label}</Text>
                    <MaterialCommunityIcons name="zap" size={10} color={cfg.text} />
                </View>
                <Text style={styles.advTitle}>{title}</Text>
                <Text style={styles.advText}>{text}</Text>
            </View>
        </View>
    );
};

const RoleBadge = ({ role }) => {
    const roles = {
        admin: { bg: '#f1f5f9', text: '#475569', icon: 'shield-check-outline' },
        doctor: { bg: '#f3e8ff', text: '#7e22ce', icon: 'stethoscope' },
        patient: { bg: '#ccfbf1', text: '#0f766e', icon: 'heart-pulse' },
        donor: { bg: '#fee2e2', text: '#b91c1c', icon: 'water-outline' }
    };
    const cfg = roles[role] || roles.patient;
    return (
        <View style={[styles.roleBadge, { backgroundColor: cfg.bg }]}>
            <MaterialCommunityIcons name={cfg.icon} size={12} color={cfg.text} />
            <Text style={[styles.roleBadgeText, { color: cfg.text }]}>{role.toUpperCase()}</Text>
        </View>
    );
};

export default function AdminDashboardScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        const socket = io(`http://${getHost()}:5000`);
        
        socket.on('clinical-alert', (data) => {
            Alert.alert(
                'NEURAL SYSTEM ALERT',
                `${data.message}\n\nAI Urgency: EXTREME`,
                [{ text: 'Acknowledged', style: 'destructive' }]
            );
        });

        fetchData();
        return () => socket.disconnect();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, uRes, aRes, rRes] = await Promise.all([
                adminService.getStats(),
                adminService.getUsers(),
                adminService.getAppointments(),
                adminService.getRecommendations()
            ]);
            setStats(sRes.data);
            setUsers(uRes.data);
            setAppointments(aRes.data);
            setRecommendations(rRes.data);
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadContainer}>
                <ActivityIndicator size="large" color="#0d9488" />
                <Text style={styles.loadText}>Syncing Neural Core...</Text>
            </View>
        );
    }

    const renderOverview = () => (
        <View style={styles.pane}>
            <View style={styles.statGrid}>
                <StatCard label="Platform Users" value={stats?.users?.value || 0} icon="account-group" color="#0d9488" trend={stats?.users?.trend} />
                <StatCard label="Total Consults" value={stats?.appointments?.value || 0} icon="calendar-outline" color="#7e22ce" trend={stats?.appointments?.trend} />
                <StatCard label="Neural Health" value="98%" icon="zap" color="#10b981" trend={2} />
                <StatCard label="Active Fleet" value={stats?.donors?.value || 0} icon="database" color="#f97316" trend={stats?.donors?.trend} />
            </View>

            {/* Quick Actions */}
            <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('AdminAddDoctor')}
            >
                <LinearGradient colors={['#4f46e5', '#3730a3']} style={styles.actionGradient}>
                    <View style={styles.actionLeft}>
                        <View style={styles.actionIconHolder}>
                            <MaterialCommunityIcons name="stethoscope" size={24} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.actionTitle}>Onboard Medical Pro</Text>
                            <Text style={styles.actionSubTitle}>Create verified doctor identity</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}><MaterialCommunityIcons name="zap" color="#4f46e5" size={24} /> Smart Advisory</Text>
                    <Text style={styles.sectionSub}>PLATFORM INTELLIGENCE STREAM</Text>
                </View>
                <View style={[styles.pulsePill, { backgroundColor: '#eef2ff' }]}>
                    <Text style={styles.pulseText}>Active Signal</Text>
                </View>
            </View>

            <View style={styles.advisoryList}>
                {recommendations.map((rec, i) => (
                    <AdvisoryCard key={i} {...rec} />
                ))}
            </View>

            <View style={styles.matrixBox}>
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}><MaterialCommunityIcons name="chart-bell-curve-cumulative" color="#ef4444" size={24} /> Triage Analysis</Text>
                        <Text style={styles.sectionSub}>GLOBAL SEVERITY DISTRIBUTION</Text>
                    </View>
                </View>

                {['emergency', 'urgent', 'routine'].map((level) => {
                    const count = appointments.filter(a => a.urgency === level).length;
                    const total = appointments.length || 1;
                    const percent = (count / total) * 100;
                    const colors = { emergency: '#ef4444', urgent: '#f97316', routine: '#0d9488' };
                    
                    return (
                        <View key={level} style={styles.progressRow}>
                            <View style={styles.progressTop}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={[styles.progressDot, { backgroundColor: colors[level] }]} />
                                    <Text style={styles.progressLabel}>{level.toUpperCase()} SIGNATURE</Text>
                                </View>
                                <Text style={styles.progressStat}>{count} cases ({Math.round(percent)}%)</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: colors[level] }]} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );

    const renderIdentity = () => (
        <View style={styles.pane}>
            <View style={styles.searchBox}>
                <MaterialCommunityIcons name="magnify" size={24} color="#94a3b8" />
                <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search system identities..." 
                    placeholderTextColor="#94a3b8"
                    value={userSearch}
                    onChangeText={setUserSearch}
                />
            </View>

            {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                <View key={u._id} style={styles.userItem}>
                    <View style={styles.userLeft}>
                        <LinearGradient colors={['#0d9488', '#4f46e5']} style={styles.avatar}>
                            <Text style={styles.avatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                        <View>
                            <Text style={styles.userName}>{u.name}</Text>
                            <Text style={styles.userEmail}>{u.email.toUpperCase()}</Text>
                        </View>
                    </View>
                    <RoleBadge role={u.role} />
                </View>
            ))}
        </View>
    );

    const renderMatrix = () => (
        <View style={styles.pane}>
             {appointments.map(appt => (
                <View key={appt._id} style={styles.matrixItem}>
                    <View style={styles.matrixTop}>
                        <View>
                            <Text style={styles.matrixPatient}>{appt.patient?.name}</Text>
                            <Text style={styles.matrixDoctor}>Prac. Dr. {appt.doctor?.name}</Text>
                        </View>
                        <View style={[styles.urgencyTag, { backgroundColor: appt.urgency === 'emergency' ? '#ef4444' : appt.urgency === 'urgent' ? '#f59e0b' : '#0d9488' }]}>
                            <Text style={styles.urgencyTagText}>{appt.urgency.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.matrixBottom}>
                        <View style={styles.matrixMeta}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                            <Text style={styles.matrixMetaText}>{new Date(appt.date).toLocaleDateString()} at {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        <View style={styles.reliabilityIndex}>
                            <MaterialCommunityIcons name="zap" size={12} color="#f59e0b" />
                            <Text style={styles.reliabilityText}>{appt.reliabilityScore}% Index</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
                {/* Command Header */}
                <View style={styles.header}>
                    <View style={styles.opHeader}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.opText}>Operational Monitoring Enabled</Text>
                    </View>
                    <Text style={styles.title}>Intelligence Monitor</Text>
                    <Text style={styles.subtitle}>Central hub for clinical triage and platform governance.</Text>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabBar}>
                        {['overview', 'identity', 'matrix'].map(tab => (
                            <TouchableOpacity 
                                key={tab} 
                                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>{tab.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.content}>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'identity' && renderIdentity()}
                    {activeTab === 'matrix' && renderMatrix()}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loadText: { marginTop: 20, fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 4, textTransform: 'uppercase' },
    
    header: { padding: 30, paddingTop: 60, paddingBottom: 40 },
    opHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
    opText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' },
    title: { fontSize: 44, fontWeight: '900', color: '#0f172a', letterSpacing: -2 },
    subtitle: { fontSize: 18, color: '#64748b', fontWeight: 'bold', marginTop: 10 },

    tabContainer: { backgroundColor: '#fff', paddingHorizontal: 30, paddingBottom: 20 },
    tabBar: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 24, padding: 6 },
    tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 20 },
    tabBtnActive: { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    tabBtnText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5 },
    tabBtnTextActive: { color: '#0d9488' },

    pane: { padding: 30, gap: 30 },
    statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    statCard: { width: (width - 75) / 2, backgroundColor: '#fff', padding: 25, borderRadius: 40, borderCircle: 1, borderColor: '#f1f5f9', borderWidth: 1 },
    statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    statIconBox: { width: 45, height: 45, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    trendBadgeText: { fontSize: 10, fontWeight: '900', color: '#10b981' },
    statLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' },
    statValue: { fontSize: 32, fontWeight: '900', color: '#1e293b', marginTop: 5 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b', tracking: -1, gap: 10 },
    sectionSub: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, marginTop: 4 },
    pulsePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    pulseText: { fontSize: 9, fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase' },

    advisoryList: { gap: 15 },
    advCard: { borderRadius: 32, padding: 24, borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 4, flexDirection: 'row', gap: 20 },
    advIconBox: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
    advContent: { flex: 1 },
    advLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
    advTitle: { fontSize: 14, fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' },
    advText: { fontSize: 12, color: '#475569', fontWeight: 'bold', fontStyle: 'italic', marginTop: 4 },

    matrixBox: { backgroundColor: '#f8fafc', padding: 30, borderRadius: 40, borderWidth: 1, borderColor: '#f1f5f9' },
    
    actionCard: { borderRadius: 32, overflow: 'hidden', elevation: 8, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
    actionGradient: { padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    actionIconHolder: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    actionTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    actionSubTitle: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },

    progressRow: { marginBottom: 20 },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    progressDot: { width: 8, height: 8, borderRadius: 4 },
    progressLabel: { fontSize: 10, fontWeight: '900', color: '#475569', letterSpacing: 1.5 },
    progressStat: { fontSize: 11, fontWeight: '900', color: '#94a3b8' },
    progressBar: { height: 14, backgroundColor: '#e2e8f0', borderRadius: 7, padding: 3, borderWidth: 1, borderColor: '#fff' },
    progressFill: { height: '100%', borderRadius: 4 },

    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingVertical: 18, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 30 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    userLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    avatar: { width: 55, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 20, fontWeight: '900', color: '#fff' },
    userName: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
    userEmail: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginTop: 2 },
    roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    roleBadgeText: { fontSize: 9, fontWeight: '900' },

    matrixItem: { paddingVertical: 25, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    matrixTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    matrixPatient: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
    matrixDoctor: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
    urgencyTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    urgencyTagText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
    matrixBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    matrixMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    matrixMetaText: { fontSize: 11, fontWeight: '900', color: '#94a3b8' },
    reliabilityIndex: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a' },
    reliabilityText: { fontSize: 10, fontWeight: '900', color: '#b45309' }
});

