import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const StatCard = ({ label, value, icon, color, bgLabel, trend }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: bgLabel }]}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            {trend !== undefined && (
                <View style={styles.trendBox}>
                    <Text style={[styles.trendText, { color: trend > 0 ? '#10b981' : '#ef4444' }]}>
                        {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                    </Text>
                </View>
            )}
        </View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

export default function AdminDashboardScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>System Overview</Text>
                <Text style={styles.subtitle}>Platform-wide analytics and control</Text>
            </View>

            <View style={styles.grid}>
                <StatCard 
                    label="Total Users" 
                    value="1,284" 
                    icon="👥" 
                    bgLabel="#dbeafe" 
                    trend={12} 
                />
                <StatCard 
                    label="Appointments" 
                    value="456" 
                    icon="📅" 
                    bgLabel="#f3e8ff" 
                    trend={-5} 
                />
                <StatCard 
                    label="System Health" 
                    value="98.2%" 
                    icon="⚡" 
                    bgLabel="#dcfce7" 
                    trend={2} 
                />
                <StatCard 
                    label="Data Sync" 
                    value="Live" 
                    icon="💾" 
                    bgLabel="#ffedd5" 
                />
            </View>

            <View style={styles.logsBox}>
                <Text style={styles.logsTitle}>Recent Server Logs</Text>
                <View style={styles.logsContainer}>
                    {[
                        { log: 'User authentication successful', time: '2 mins ago', type: 'info' },
                        { log: 'New donor registered from Bangalore', time: '15 mins ago', type: 'success' },
                        { log: 'AI sync process completed', time: '1 hour ago', type: 'info' },
                        { log: 'Database backup successful', time: '4 hours ago', type: 'info' }
                    ].map((item, i) => (
                        <View key={i} style={styles.logItem}>
                            <View style={styles.logRow}>
                                <View style={[styles.logDot, { backgroundColor: item.type === 'success' ? '#10b981' : '#3b82f6' }]} />
                                <Text style={styles.logText}>{item.log}</Text>
                            </View>
                            <Text style={styles.logTime}>{item.time}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.maintenanceBox}>
                <View style={styles.maintenanceIconHolder}>
                    <Text style={styles.maintenanceIcon}>⚠️</Text>
                </View>
                <Text style={styles.maintenanceTitle}>System Maintenance</Text>
                <Text style={styles.maintenanceDesc}>Scheduled database optimization is set for Sunday at 02:00 AM UTC. No downtime expected.</Text>
                
                <TouchableOpacity style={styles.maintenanceBtn}>
                    <Text style={styles.maintenanceBtnText}>View Schedule</Text>
                </TouchableOpacity>
            </View>
            
            <View style={{height: 40}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, paddingTop: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 5 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between' },
    card: { backgroundColor: '#fff', padding: 20, width: '47%', borderRadius: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity:0.05, shadowRadius:4, borderWidth: 1, borderColor: '#f1f5f9' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    icon: { fontSize: 20 },
    trendBox: { flexDirection: 'row', alignItems: 'center' },
    trendText: { fontSize: 12, fontWeight: 'bold' },
    label: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    value: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginTop: 4 },
    logsBox: { marginHorizontal: 15, marginTop: 10, backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
    logsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
    logsContainer: { gap: 12 },
    logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
    logRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    logDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    logText: { color: '#334155', fontSize: 13, fontWeight: '500', flexShrink: 1 },
    logTime: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
    maintenanceBox: { margin: 15, marginTop: 25, backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' },
    maintenanceIconHolder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    maintenanceIcon: { fontSize: 30 },
    maintenanceTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
    maintenanceDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20, paddingHorizontal: 10 },
    maintenanceBtn: { backgroundColor: '#0f172a', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12 },
    maintenanceBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
