import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { donorService } from '../utils/api';
import * as Location from 'expo-location';

const MilkDonationItem = ({ item, onInquire }) => (
    <View style={styles.card}>
        <View style={styles.row}>
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="baby-bottle" size={24} color="#ec4899" />
            </View>
            <View>
                <Text style={styles.donorName}>{item.user?.name || item.name || 'Anonymous'}</Text>
                <Text style={styles.volumeText}>Location: {item.location?.type === 'Point' ? 'SmartMatch Found' : 'Nearby Center'}</Text>
            </View>
        </View>
        <View style={styles.statusCol}>
            <TouchableOpacity 
                style={[styles.contactBtn, { backgroundColor: '#fdf2f8' }]}
                onPress={() => onInquire(item.donorId || item._id)}
            >
                <MaterialCommunityIcons name="message-text-outline" size={16} color="#ec4899" />
                <Text style={[styles.contactBtnText, { color: '#ec4899' }]}>Inquire</Text>
            </TouchableOpacity>
            <Text style={styles.statusText}>Priority Match</Text>
        </View>
    </View>
);

export default function MilkDonationScreen() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radius, setRadius] = useState(50);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        fetchDonors();
    }, [radius]);

    const fetchDonors = async () => {
        setLoading(true);
        try {
            let lat, lng;
            if (!coords) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    lat = loc.coords.latitude;
                    lng = loc.coords.longitude;
                    setCoords({ lat, lng });
                }
            } else {
                lat = coords.lat;
                lng = coords.lng;
            }

            const { data } = await donorService.getDonors({ radius, lat, lng });
            const milkDonors = (data || []).filter(d => d.donationType === 'milk' || d.donationType === 'both');
            setDonors(milkDonors);
        } catch (error) {
            console.log('Error fetching milk donors', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInquire = async (donorId) => {
        try {
            await donorService.inquireMilk({ donorId, message: "Interested in donation/pickup." });
            Alert.alert("Success 🍼", "Secure inquiry handshake sent! The donor/bank has been notified.");
        } catch (error) {
            Alert.alert("Inquiry Failed", "Could not establish a secure connection at this time.");
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <Text style={styles.title}>Human Milk Bank</Text>
                            <Text style={styles.subtitle}>Priority-based donation management</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
                            <View style={[styles.statBox, styles.bgGradient]}>
                                <MaterialCommunityIcons name="water" size={32} color="#fff" />
                                <Text style={styles.statLabelLight}>Total Volume</Text>
                                <Text style={styles.statValueLight}>12,450ml</Text>
                            </View>
                            <View style={styles.statBox}>
                                <MaterialCommunityIcons name="heart" size={32} color="#ec4899" />
                                <Text style={styles.statLabel}>Active Donors</Text>
                                <Text style={styles.statValue}>{donors.length}</Text>
                            </View>
                        </ScrollView>

                        <View style={styles.radiusContainer}>
                            <Text style={styles.radiusLabel}>SmartMatch Radius:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.radiusScroll}>
                                {[5, 10, 50, 100].map(r => (
                                    <TouchableOpacity 
                                        key={r} 
                                        style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]} 
                                        onPress={() => setRadius(r)}
                                    >
                                        <Text style={[styles.radiusBtnText, radius === r && styles.radiusBtnTextActive]}>{r}km</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <Text style={styles.listTitle}>Available Donors Near You</Text>
                    </>
                }
                data={donors}
                keyExtractor={item => item._id}
                renderItem={({ item }) => <MilkDonationItem item={item} onInquire={handleInquire} />}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color="#ec4899" style={{marginTop: 50}} />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="baby-bottle-outline" size={48} color="#cbd5e1" style={{ marginBottom: 10 }} />
                            <Text style={styles.emptyText}>No milk donors found in this radius.</Text>
                        </View>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, paddingTop: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 5 },
    statsScroll: { paddingHorizontal: 20, paddingBottom: 20 },
    statBox: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 16, 
        marginRight: 15, 
        width: 140, 
        borderWidth: 1, 
        borderColor: '#f1f5f9',
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } 
            : { elevation: 2, shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity:0.1, shadowRadius:3 })
    },
    bgGradient: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
    statLabel: { color: '#64748b', fontSize: 12, marginTop: 10 },
    statValue: { color: '#1e293b', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
    statLabelLight: { color: '#fbcfe8', fontSize: 12, marginTop: 10 },
    statValueLight: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
    radiusContainer: { paddingHorizontal: 20, marginBottom: 20, marginTop: 10 },
    radiusLabel: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
    radiusScroll: { flexDirection: 'row' },
    radiusBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    radiusBtnActive: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
    radiusBtnText: { fontSize: 13, color: '#475569', fontWeight: 'bold' },
    radiusBtnTextActive: { color: '#fff' },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#fdf2f8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    donorName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    volumeText: { fontSize: 12, color: '#64748b', marginTop: 3 },
    statusText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    contactBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 8, 
        marginBottom: 8,
        gap: 5
    },
    contactBtnText: { fontSize: 11, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#94a3b8', fontSize: 14, marginTop: 10 }
});
