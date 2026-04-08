import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const MilkDonationItem = ({ donor, volume, priority, status }) => (
    <View style={styles.card}>
        <View style={styles.row}>
            <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🍼</Text>
            </View>
            <View>
                <Text style={styles.donorName}>{donor}</Text>
                <Text style={styles.volumeText}>Volume: {volume}ml</Text>
            </View>
        </View>
        <View style={styles.statusCol}>
            <View style={[styles.priorityBadge, priority === 'high' ? styles.bgRed : styles.bgBlue]}>
                <Text style={[styles.priorityText, priority === 'high' ? styles.textRed : styles.textBlue]}>
                    {priority.toUpperCase()} PRIORITY
                </Text>
            </View>
            <Text style={styles.statusText}>{status}</Text>
        </View>
    </View>
);

export default function MilkDonationScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Human Milk Bank</Text>
                <Text style={styles.subtitle}>Priority-based donation management</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
                <View style={[styles.statBox, styles.bgGradient]}>
                    <Text style={{fontSize: 24}}>💧</Text>
                    <Text style={styles.statLabelLight}>Total Volume</Text>
                    <Text style={styles.statValueLight}>12,450ml</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={{fontSize: 24}}>❤️</Text>
                    <Text style={styles.statLabel}>Active Donors</Text>
                    <Text style={styles.statValue}>48</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={{fontSize: 24}}>🛡️</Text>
                    <Text style={styles.statLabel}>Screened</Text>
                    <Text style={styles.statValue}>156</Text>
                </View>
            </ScrollView>

            <View style={styles.listSection}>
                <Text style={styles.listTitle}>Pending Donations</Text>
                <MilkDonationItem donor="Sarah Wilson" volume={250} priority="high" status="In testing" />
                <MilkDonationItem donor="Emma Thompson" volume={500} priority="normal" status="Waiting pickup" />
                <MilkDonationItem donor="Maria Garcia" volume={300} priority="high" status="Screening" />
            </View>
            
            <View style={{height: 40}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, paddingTop: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 5 },
    statsScroll: { paddingHorizontal: 20, paddingBottom: 20 },
    statBox: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginRight: 15, width: 140, elevation: 2, shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity:0.1, shadowRadius:3, borderWidth: 1, borderColor: '#f1f5f9' },
    bgGradient: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
    statLabel: { color: '#64748b', fontSize: 12, marginTop: 10 },
    statValue: { color: '#1e293b', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
    statLabelLight: { color: '#fbcfe8', fontSize: 12, marginTop: 10 },
    statValueLight: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
    listSection: { padding: 20 },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#fdf2f8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    iconText: { fontSize: 20 },
    donorName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    volumeText: { fontSize: 12, color: '#64748b', marginTop: 3 },
    statusCol: { alignItems: 'flex-end' },
    priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 5 },
    bgRed: { backgroundColor: '#fee2e2' },
    textRed: { color: '#ef4444', fontSize: 10, fontWeight: 'bold' },
    bgBlue: { backgroundColor: '#dbeafe' },
    textBlue: { color: '#3b82f6', fontSize: 10, fontWeight: 'bold' },
    statusText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' }
});
