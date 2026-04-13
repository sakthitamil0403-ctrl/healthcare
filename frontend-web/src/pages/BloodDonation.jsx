import React, { useEffect, useState } from 'react';
import { donorService } from '../services/api';
import DonorMap from '../components/DonorMap';
import { Droplet, Search, Filter, MapPin, Loader2, Navigation, ShieldAlert, Send, X, CheckCircle } from 'lucide-react';

export default function BloodDonation() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(5000); // 5km default
    const [isSearchingNearby, setIsSearchingNearby] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertBloodType, setAlertBloodType] = useState('O+');
    const [alertMessage, setAlertMessage] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState(null);

    const fetchDonors = async () => {
        setLoading(true);
        try {
            const { data } = await donorService.getDonors();
            setDonors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonors();
    }, []);

    const handleSearchNearby = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsSearchingNearby(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { longitude, latitude } = position.coords;
                const { data } = await donorService.getNearbyDonors({ longitude, latitude, radius });
                setDonors(data);
            } catch (err) {
                console.error(err);
                alert('Failed to fetch nearby donors');
            } finally {
                setIsSearchingNearby(false);
            }
        }, (err) => {
            console.error(err);
            alert('Error getting location: ' + err.message);
            setIsSearchingNearby(false);
        });
    };

    const handleEmergencyAlert = async (e) => {
        e.preventDefault();
        if (!navigator.geolocation) {
            alert('Geolocation is not supported');
            return;
        }

        setBroadcasting(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { longitude, latitude } = position.coords;
                const { data } = await donorService.sendEmergencyAlert({
                    bloodType: alertBloodType,
                    latitude,
                    longitude,
                    radius,
                    message: alertMessage
                });
                setBroadcastResult(data);
                setTimeout(() => {
                    setShowAlertModal(false);
                    setBroadcastResult(null);
                    setAlertMessage('');
                }, 3000);
            } catch (err) {
                console.error(err);
                alert(err?.response?.data?.message || 'Failed to send alert');
            } finally {
                setBroadcasting(false);
            }
        }, (err) => {
            alert('Location access is required for emergency alerts');
            setBroadcasting(false);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Droplet className="text-red-500 fill-red-500" size={28} />
                        Blood Donation Network
                    </h2>
                    <p className="text-gray-500 font-medium">Find compatible donors in your area</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col px-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Radius (meters)</label>
                        <input 
                            type="number" 
                            value={radius} 
                            onChange={(e) => setRadius(e.target.value)}
                            className="text-sm font-bold text-teal-600 focus:outline-none w-24"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAlertModal(true)}
                        className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100 shadow-sm"
                    >
                        <ShieldAlert size={18} />
                        Emergency Alert
                    </button>
                    <button 
                        onClick={handleSearchNearby}
                        disabled={isSearchingNearby}
                        className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-100"
                    >
                        {isSearchingNearby ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
                        Search Nearby
                    </button>
                    <button 
                        onClick={fetchDonors}
                        className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    >
                        <Navigation size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                    <DonorMap donors={donors} />
                </div>
                
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2">
                            <Filter size={20} className="text-teal-600" />
                            Active Donors ({donors.length})
                        </h3>
                        
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {loading ? (
                                <div className="py-20 text-center flex flex-col items-center gap-3 text-gray-400">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p className="font-medium">Fetching donors...</p>
                                </div>
                            ) : donors.length > 0 ? (
                                donors.map(donor => (
                                    <div key={donor._id} className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 flex justify-between items-center hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-all">
                                                {donor.bloodType}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-gray-800">{donor.user?.name}</p>
                                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <MapPin size={10} />
                                                    {donor.location?.coordinates?.join(', ') || 'Remote'}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-gray-300 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                                            <Navigation size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-gray-400">
                                    <Droplet className="mx-auto mb-4 opacity-20" size={48} />
                                    <p className="font-medium">No donors found in this area</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Emergency Alert Modal */}
            {showAlertModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-inner">
                                    <ShieldAlert size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Broadcast Emergency</h3>
                                    <p className="text-sm text-gray-500 font-medium">Alert nearby donors immediately</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAlertModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        {broadcastResult ? (
                            <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100 ring-8 ring-green-50">
                                    <CheckCircle size={40} />
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-2">Alert Broadcasted!</h4>
                                <p className="text-gray-500 font-medium">Notifications sent to {broadcastResult.count} matching donors.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEmergencyAlert} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Blood Type Required</label>
                                        <select 
                                            value={alertBloodType}
                                            onChange={(e) => setAlertBloodType(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        >
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Alert Radius (m)</label>
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            {radius}m
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Emergency Message</label>
                                    <textarea 
                                        placeholder="e.g. Critical support needed at City Hospital Central Wing. Contact ICU desk."
                                        value={alertMessage}
                                        onChange={(e) => setAlertMessage(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[120px] resize-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAlertModal(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl font-black text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={broadcasting}
                                        className="flex-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-red-100 grow"
                                    >
                                        {broadcasting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                BROADCASTING...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                SEND BROADCAST
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tighter">
                                    Warning: This will send real-time SMS/Email alerts to all matching active donors.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
