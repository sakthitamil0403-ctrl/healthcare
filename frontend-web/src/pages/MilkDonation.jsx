import React, { useState, useEffect } from 'react';
import { Baby, Droplets, Heart, ShieldCheck, MapPin, Navigation, Loader2, Filter, AlertCircle } from 'lucide-react';
import { milkService } from '../services/api';

const MilkDonationItem = ({ donor, volume, priorityScore, status }) => {
    const priority = priorityScore > 1000 ? 'high' : 'normal';
    return (
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
            <div className="flex items-center">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mr-5 group-hover:bg-pink-500 group-hover:text-white transition-all">
                    <Baby size={28} />
                </div>
                <div>
                    <p className="font-black text-gray-900 text-lg">{donor}</p>
                    <p className="text-xs text-gray-500 font-medium">Verified Milk Donor • {volume || 250}ml Available</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    priority === 'high' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                    {priority} priority
                </div>
                <button className="p-2.5 text-gray-300 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                    <Navigation size={20} />
                </button>
            </div>
        </div>
    );
};

export default function MilkDonation() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(5000);
    const [urgency, setUrgency] = useState('routine');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchNearby = () => {
        if (!navigator.geolocation) {
            alert('Geolocation not supported');
            return;
        }

        setIsSearching(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { longitude, latitude } = pos.coords;
                const { data } = await milkService.getNearbyDonors({ longitude, latitude, radius, urgency });
                setDonors(data);
            } catch (err) {
                console.error(err);
                alert('Search failed');
            } finally {
                setIsSearching(false);
            }
        }, (err) => {
            alert('Location error: ' + err.message);
            setIsSearching(false);
        });
    };

    return (
        <div className="max-w-5xl space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Droplets className="text-pink-500 fill-pink-500" size={32} />
                        Human Milk Bank
                    </h2>
                    <p className="text-gray-500 font-medium">AI-prioritized donor network for neonatal care</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2.5 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex bg-gray-50 p-1 rounded-2xl shrink-0">
                        {['routine', 'urgent', 'emergency'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setUrgency(lvl)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                    urgency === lvl ? 'bg-white shadow-sm text-pink-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                    <div className="h-8 w-px bg-gray-100 mx-1" />
                    <button 
                        onClick={handleSearchNearby}
                        disabled={isSearching}
                        className="bg-pink-600 text-white px-8 py-2.5 rounded-2xl font-black text-sm hover:bg-pink-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-pink-100"
                    >
                        {isSearching ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
                        Find Donors
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-pink-500 via-rose-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Droplets size={120} />
                    </div>
                    <p className="text-pink-100 text-xs font-black uppercase tracking-widest mb-2">Total Bank Volume</p>
                    <h3 className="text-4xl font-black mb-4">12,450<span className="text-xl ml-1 text-pink-200">ml</span></h3>
                    <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1.5 rounded-xl backdrop-blur-md">
                        <AlertCircle size={14} /> Screened & Certified
                    </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mb-4">
                            <Heart size={24} fill="currentColor" />
                        </div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Active Donors</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">48</h3>
                    </div>
                    <p className="text-[10px] text-green-500 font-bold flex items-center gap-1 mt-4">
                        <ShieldCheck size={12} /> +12% this month
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
                        <ShieldCheck size={24} />
                    </div>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Screened Batches</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1">156</h3>
                    <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[85%]" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Filter size={20} className="text-pink-500" />
                        AI Prioritized Matchmaking
                    </h3>
                    {donors.length > 0 && (
                        <span className="text-xs font-bold text-gray-400">{donors.length} matches found</span>
                    )}
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4 text-gray-400">
                            <Loader2 className="animate-spin text-pink-500" size={40} />
                            <p className="font-bold">Syncing with donor network...</p>
                        </div>
                    ) : donors.length > 0 ? (
                        donors.map((d, i) => (
                            <MilkDonationItem 
                                key={i} 
                                donor={d.name} 
                                priorityScore={d.priorityScore} 
                                status="Available" 
                            />
                        ))
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                                <MapPin size={40} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-400">No active searches</h4>
                            <p className="text-sm text-gray-300 mt-2 max-w-xs">Use the "Find Donors" button above to scan the geospatial network forhuman milk donors.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
