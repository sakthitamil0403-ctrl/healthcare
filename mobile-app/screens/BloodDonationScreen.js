import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Platform, ScrollView, Linking, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { donorService } from '../utils/api';
import * as Location from 'expo-location';

// For Web Demo compatibility, we mock the map view since react-native-maps requires ejected bare workflows
export default function BloodDonationScreen({ navigation, route }) {
    const { user } = route.params || {};
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [radius, setRadius] = useState(50); // Default 50km
    const [coords, setCoords] = useState(null);

    // Emergency Alert State
    const [showEmergency, setShowEmergency] = useState(false);
    const [alertBloodType, setAlertBloodType] = useState('O+');
    const [alertRadius, setAlertRadius] = useState(5000);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSending, setAlertSending] = useState(false);

    // Contact Modal State
    const [contactDonor, setContactDonor] = useState(null);

    useEffect(() => {
        fetchDonors();
    }, [radius]); // Refresh when radius changes

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

            const params = { radius };
            if (lat && lng) {
                params.lat = lat;
                params.lng = lng;
            }

            const { data } = await donorService.getDonors(params);
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

    const handleSendEmergencyAlert = async () => {
        if (!coords) {
            Alert.alert('Location Required', 'Please allow location access so we can find nearby donors.');
            return;
        }
        setAlertSending(true);
        try {
            const { data } = await donorService.sendEmergencyAlert({
                bloodType: alertBloodType,
                latitude: coords.lat,
                longitude: coords.lng,
                radius: alertRadius,
                message: alertMessage || `Urgent: ${alertBloodType} blood needed immediately. Please report to nearest hospital.`
            });
            setShowEmergency(false);
            setAlertMessage('');
            Alert.alert(
                '🚨 Alert Broadcasted!',
                `Emergency alert sent to ${data.count} donor(s) nearby via Email & SMS.`,
                [{ text: 'OK' }]
            );
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send alert. Try again.';
            Alert.alert('Alert Failed', msg);
        } finally {
            setAlertSending(false);
        }
    };

    // A phone is 'masked' if it contains '*'
    const isPhoneMasked = (phone) => !phone || phone.includes('*');

    const handleContactDonor = (donor) => {
        const email = donor.user?.email;
        const phone = donor.user?.phone;
        if (!email && isPhoneMasked(phone)) {
            Alert.alert('No Contact Info', 'This donor has not provided contact information.');
            return;
        }
        setContactDonor(donor);
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
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <MaterialCommunityIcons name="map-marker" size={12} color="#475569" style={{marginRight: 2}} />
                                    <Text style={styles.locationText}>{item.location?.type === 'Point' ? 'Near You' : 'Unknown Area'}</Text>
                                </View>
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
                    <TouchableOpacity 
                        style={styles.contactBtn}
                        onPress={() => handleContactDonor(item)}
                    >
                        <Text style={styles.contactBtnText}>Contact</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>

            {/* Emergency Alert Modal */}
            <Modal visible={showEmergency} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={styles.alertIconBox}>
                                <Text style={styles.alertIconText}>🚨</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Emergency Alert</Text>
                                <Text style={styles.modalSubtitle}>Broadcast to all nearby matching donors</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowEmergency(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>BLOOD TYPE NEEDED</Text>
                        <View style={styles.alertBloodGrid}>
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                                <TouchableOpacity
                                    key={bt}
                                    style={[styles.alertBloodChip, alertBloodType === bt && styles.alertBloodChipActive]}
                                    onPress={() => setAlertBloodType(bt)}
                                >
                                    <Text style={[styles.alertBloodText, alertBloodType === bt && styles.alertBloodTextActive]}>{bt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>SEARCH RADIUS</Text>
                        <View style={styles.alertRadiusRow}>
                            {[1000, 5000, 10000, 20000].map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.alertRadiusBtn, alertRadius === r && styles.alertRadiusBtnActive]}
                                    onPress={() => setAlertRadius(r)}
                                >
                                    <Text style={[styles.alertRadiusText, alertRadius === r && styles.alertRadiusTextActive]}>{r/1000}km</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>CUSTOM MESSAGE (optional)</Text>
                        <TextInput
                            style={styles.alertMsgInput}
                            placeholder={`Urgent: ${alertBloodType} blood needed immediately...`}
                            placeholderTextColor="#94a3b8"
                            value={alertMessage}
                            onChangeText={setAlertMessage}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            style={[styles.broadcastBtn, alertSending && { opacity: 0.6 }]}
                            onPress={handleSendEmergencyAlert}
                            disabled={alertSending}
                        >
                            {alertSending
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.broadcastBtnText}>🚨 BROADCAST EMERGENCY ALERT</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Contact Donor Modal */}
            <Modal visible={!!contactDonor} animationType="slide" transparent onRequestClose={() => setContactDonor(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.contactAvatarLg}>
                                <Text style={styles.contactAvatarTextLg}>{getInitials(contactDonor?.user?.name)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>{contactDonor?.user?.name || 'Donor'}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <View style={styles.contactBloodBadge}>
                                        <Text style={styles.contactBloodText}>{contactDonor?.bloodType || contactDonor?.bloodGroup || '?'}</Text>
                                    </View>
                                    <Text style={styles.contactAvailText}>● Available</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setContactDonor(null)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>CONTACT OPTIONS</Text>

                        {/* Email Button */}
                        {contactDonor?.user?.email ? (
                            <TouchableOpacity
                                style={styles.contactOptionBtn}
                                onPress={() => {
                                    Linking.openURL(`mailto:${contactDonor.user.email}`);
                                    setContactDonor(null);
                                }}
                            >
                                <View style={styles.contactOptionIcon}>
                                    <MaterialCommunityIcons name="email-outline" size={22} color="#3b82f6" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.contactOptionTitle}>Send Email</Text>
                                    <Text style={styles.contactOptionValue}>{contactDonor.user.email}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
                            </TouchableOpacity>
                        ) : null}

                        {/* Phone Button — only if not masked */}
                        {!isPhoneMasked(contactDonor?.user?.phone) ? (
                            <TouchableOpacity
                                style={styles.contactOptionBtn}
                                onPress={() => {
                                    Linking.openURL(`tel:${contactDonor.user.phone}`);
                                    setContactDonor(null);
                                }}
                            >
                                <View style={[styles.contactOptionIcon, { backgroundColor: '#f0fdf4' }]}>
                                    <MaterialCommunityIcons name="phone-outline" size={22} color="#10b981" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.contactOptionTitle}>Call Phone</Text>
                                    <Text style={styles.contactOptionValue}>{contactDonor?.user?.phone}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.maskedPhoneNote}>
                                <MaterialCommunityIcons name="shield-lock-outline" size={16} color="#94a3b8" />
                                <Text style={styles.maskedPhoneText}>Phone number is private. Use email or emergency alert to reach this donor.</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.cancelContactBtn} onPress={() => setContactDonor(null)}>
                            <Text style={styles.cancelContactText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.title}>Blood Donation Network</Text>
                        <Text style={styles.subtitle}>Find available donors instantly</Text>
                    </View>
                    <TouchableOpacity style={styles.emergencyFab} onPress={() => setShowEmergency(true)}>
                        <Text style={styles.emergencyFabText}>🚨 SOS</Text>
                    </TouchableOpacity>
                </View>
                
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

            {/* SmartMatch Radius Filter */}
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

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : viewMode === 'map' ? (
                <View style={styles.mapContainer}>
                    <View style={styles.webMapFallback}>
                        <MaterialCommunityIcons name="map-outline" size={64} color="#94a3b8" style={{ marginBottom: 20 }} />
                        <Text style={styles.fallbackTitle}>Interactive Native Map</Text>
                        <Text style={styles.fallbackDesc}>The Live Donor Map relies on native device Map APIs (Apple Maps / Google Maps) and cannot be loaded in this exact sandbox without a real device.</Text>
                        <TouchableOpacity style={styles.fallbackBtn} onPress={() => setViewMode('list')}>
                            <Text style={styles.fallbackBtnText}>Return to List View</Text>
                        </TouchableOpacity>
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
                            <MaterialCommunityIcons name="blood-bag" size={48} color="#cbd5e1" style={{ marginBottom: 10 }} />
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

    // Emergency Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 28, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 14 },
    alertIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
    alertIconText: { fontSize: 22 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
    modalSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
    closeBtn: { fontSize: 18, color: '#94a3b8', fontWeight: 'bold', padding: 4 },
    modalLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 10, marginTop: 6 },
    alertBloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
    alertBloodChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', minWidth: 58, alignItems: 'center' },
    alertBloodChipActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    alertBloodText: { color: '#ef4444', fontWeight: '800', fontSize: 14 },
    alertBloodTextActive: { color: '#fff' },
    alertRadiusRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    alertRadiusBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    alertRadiusBtnActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    alertRadiusText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
    alertRadiusTextActive: { color: '#fff' },
    alertMsgInput: { backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', padding: 14, fontSize: 14, color: '#1e293b', marginBottom: 22, minHeight: 80, textAlignVertical: 'top' },
    broadcastBtn: { backgroundColor: '#ef4444', borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    broadcastBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

    // SOS FAB
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    emergencyFab: { backgroundColor: '#ef4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    emergencyFabText: { color: '#fff', fontWeight: '900', fontSize: 13 },
    header: { padding: 20, paddingTop: 30, paddingBottom: 15 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 3 },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    toggleActive: { 
        backgroundColor: '#fff', 
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' } 
            : { shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 })
    },
    toggleText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    toggleTextActive: { color: '#0f172a', fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, color: '#1e293b', elevation: 1 },
    radiusContainer: { paddingHorizontal: 20, marginBottom: 20 },
    radiusLabel: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
    radiusScroll: { flexDirection: 'row' },
    radiusBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    radiusBtnActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    radiusBtnText: { fontSize: 13, color: '#475569', fontWeight: 'bold' },
    radiusBtnTextActive: { color: '#fff' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
    donorCard: { 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 16, 
        marginBottom: 12, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#f1f5f9',
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } 
            : { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 })
    },
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
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
    emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center' },
    
    // Map Styles
    mapContainer: { flex: 1, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    webMapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f8fafc' },
    fallbackTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
    fallbackDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
    fallbackBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    fallbackBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    // Contact Modal
    contactAvatarLg: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#fdf2f8', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fce7f3' },
    contactAvatarTextLg: { fontSize: 20, fontWeight: 'bold', color: '#db2777' },
    contactBloodBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    contactBloodText: { color: '#ef4444', fontWeight: '900', fontSize: 13 },
    contactAvailText: { fontSize: 12, color: '#10b981', fontWeight: 'bold' },
    contactOptionBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    contactOptionIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    contactOptionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    contactOptionValue: { fontSize: 12, color: '#64748b', marginTop: 2 },
    maskedPhoneNote: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    maskedPhoneText: { flex: 1, fontSize: 12, color: '#94a3b8', lineHeight: 18 },
    cancelContactBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
    cancelContactText: { color: '#64748b', fontWeight: '700', fontSize: 15 }
});
