import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Platform, Image } from 'react-native';
import { donorService } from '../utils/api';

// For Web Demo compatibility, we mock the map view since react-native-maps requires ejected bare workflows
export default function BloodDonationScreen({ navigation, route }) {
    const { user } = route.params || {};
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            const { data } = await donorService.getDonors();
            setDonors(data || []);
        } catch (error) {
            console.log('Error fetching donors', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDonors = donors.filter(d => 
        (d.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.bloodGroup || d.bloodType || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    const formatDonationDate = (dateString) => {
        if (!dateString) return 'Never donated';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Never donated';
        return `Last: ${date.toLocaleDateString()}`;
    };

    const renderDonor = ({ item }) => {
        const bgType = item.bloodGroup || item.bloodType || 'Unknown';
        
        return (
            <View style={styles.donorCard}>
                <View style={styles.cardContent}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(item.user?.name)}</Text>
                    </View>
                    
                    <View style={styles.infoCol}>
                        <Text style={styles.donorName}>{item.user?.name || 'Unknown User'}</Text>
                        
                        <View style={styles.detailsRow}>
                            <View style={styles.locationBadge}>
                                <Text style={styles.locationText}>📍 {item.location?.type === 'Point' ? 'Near You' : 'Unknown Area'}</Text>
                            </View>
                            {item.availability !== false && (
                                <Text style={styles.availableText}>● Available</Text>
                            )}
                        </View>
                        
                        <Text style={styles.donationDate}>{formatDonationDate(item.lastDonationDate)}</Text>
                    </View>
                </View>
                
                <View style={styles.actionCol}>
                    <View style={styles.bloodBadgeHolder}>
                        <View style={styles.bloodBadge}>
                            <Text style={styles.bloodText}>{bgType}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.contactBtn}>
                        <Text style={styles.contactBtnText}>Contact</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Blood Donation Network</Text>
                <Text style={styles.subtitle}>Find available donors instantly</Text>
                
                {/* View Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]} 
                        onPress={() => setViewMode('list')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, viewMode === 'map' && styles.toggleActive]} 
                        onPress={() => setViewMode('map')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map View</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.searchContainer}>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search by name or blood group..."
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : viewMode === 'map' ? (
                <View style={styles.mapContainer}>
                <View style={styles.mapContainer}>
                    <View style={styles.webMapFallback}>
                        <Text style={styles.fallbackIcon}>🗺️</Text>
                        <Text style={styles.fallbackTitle}>Interactive Native Map</Text>
                        <Text style={styles.fallbackDesc}>The Live Donor Map relies on native device Map APIs (Apple Maps / Google Maps) and cannot be loaded in this exact sandbox without a real device.</Text>
                        <TouchableOpacity style={styles.fallbackBtn} onPress={() => setViewMode('list')}>
                            <Text style={styles.fallbackBtnText}>Return to List View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </View>
            ) : (
                <FlatList
                    data={filteredDonors}
                    keyExtractor={item => item._id}
                    renderItem={renderDonor}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🩸</Text>
                            <Text style={styles.emptyTitle}>No Donors Found</Text>
                            <Text style={styles.emptyText}>Try adjusting your search filters.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 30, paddingBottom: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 3, marginBottom: 15 },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    toggleText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    toggleTextActive: { color: '#0f172a', fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, color: '#1e293b', elevation: 1 },
    listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
    donorCard: { backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 45, height: 45, borderRadius: 14, backgroundColor: '#fdf2f8', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#fce7f3' },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: '#db2777' },
    infoCol: { flex: 1 },
    donorName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    detailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
    locationBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
    locationText: { fontSize: 10, color: '#475569', fontWeight: '600' },
    availableText: { fontSize: 10, color: '#10b981', fontWeight: 'bold' },
    donationDate: { fontSize: 10, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' },
    actionCol: { alignItems: 'flex-end', marginLeft: 5 },
    bloodBadgeHolder: { marginBottom: 8 },
    bloodBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 40, alignItems: 'center' },
    bloodText: { color: '#ef4444', fontWeight: '900', fontSize: 12 },
    contactBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    contactBtnText: { color: '#334155', fontSize: 10, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 40, backgroundColor: '#fff', padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
    emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center' },
    
    // Map Styles
    mapContainer: { flex: 1, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    map: { width: '100%', height: '100%' },
    webMapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f8fafc' },
    fallbackIcon: { fontSize: 60, marginBottom: 20 },
    fallbackTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
    fallbackDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
    fallbackBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    fallbackBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
