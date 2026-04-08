import React, { useEffect, useState } from 'react';
import { donorService } from '../services/api';
import DonorMap from '../components/DonorMap';
import { Droplet, Search, Filter, MapPin, Loader2, Navigation } from 'lucide-react';

export default function BloodDonation() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(5000); // 5km default
    const [isSearchingNearby, setIsSearchingNearby] = useState(false);

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
                            className="text-sm font-bold text-blue-600 focus:outline-none w-24"
                        />
                    </div>
                    <button 
                        onClick={handleSearchNearby}
                        disabled={isSearchingNearby}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-100"
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
                            <Filter size={20} className="text-blue-600" />
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
                                        <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
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
        </div>
    );
}
