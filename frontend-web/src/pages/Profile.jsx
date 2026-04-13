import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { User, Mail, Shield, CheckCircle, Edit2, X, Save, Upload, Heart, Activity, ClipboardList, Droplet, Baby, MapPin, Award } from 'lucide-react';
import { authService, patientService } from '../services/api';

export default function Profile() {
    const user = useStore(state => state.user);
    const token = useStore(state => state.token);
    const setUser = useStore(state => state.setUser);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ 
        name: user?.name || '', 
        image: user?.image || '' 
    });
    
    const [clinicalData, setClinicalData] = useState({
        age: '',
        gender: '',
        bloodGroup: '',
        medicalHistory: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user?.role === 'patient') {
            patientService.getProfile(user.id)
                .then(({ data }) => {
                    setClinicalData({
                        age: data.age || '',
                        gender: data.gender || '',
                        bloodGroup: data.bloodGroup || '',
                        medicalHistory: data.medicalHistory?.join(', ') || ''
                    });
                })
                .catch(console.error);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await authService.updateProfile(formData);
            if (user.role === 'patient') {
                await patientService.updateProfile({
                    ...clinicalData,
                    medicalHistory: clinicalData.medicalHistory.split(',').map(s => s.trim()).filter(s => s)
                });
            }
            setUser({ ...user, ...formData }, token);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Identity synchronized successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update system records.' });
        } finally {
            setLoading(false);
        }
    };

    const isDonor = user?.role === 'donor';
    const isPatient = user?.role === 'patient';
    const isMilk = user?.donationType === 'milk' || user?.donationType === 'both';
    const isBlood = user?.donationType === 'blood' || user?.donationType === 'both';

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
            {/* Identity Card */}
            <div className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl border ${isDonor ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100'}`}>
                
                {/* Dynamic Hero Banner */}
                <div className={`h-40 relative ${
                    isDonor 
                        ? (isMilk ? 'bg-gradient-to-r from-pink-600 to-teal-600' : 'bg-gradient-to-r from-red-600 to-rose-600')
                        : 'bg-gradient-to-r from-teal-600 to-indigo-700'
                }`}>
                    {isDonor && (
                        <>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="absolute -bottom-10 -right-10 opacity-20 transform rotate-12">
                                {isMilk ? <Baby size={150} /> : <Droplet size={150} />}
                            </div>
                        </>
                    )}

                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="absolute top-6 right-6 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white transition-all flex items-center gap-2 text-sm font-bold shadow-lg border border-white/20 hover:scale-105"
                        >
                            <Edit2 size={14} /> Update Record
                        </button>
                    )}
                </div>

                <div className={`px-10 pb-10 relative ${isDonor ? 'text-white' : 'text-gray-900'}`}>
                    
                    {/* Avatar Container */}
                    <div className="relative flex justify-center -mt-20">
                        <div className={`w-36 h-36 rounded-full p-2 shadow-2xl ${isDonor ? 'bg-slate-900' : 'bg-white'}`}>
                            <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden relative group border-4 ${isDonor ? 'bg-slate-800 border-slate-700' : 'bg-teal-50 border-white'}`}>
                                {formData.image ? (
                                    <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    isDonor ? (isMilk ? <Baby size={50} className="text-pink-400" /> : <Droplet size={50} className="text-red-400" />) : <User size={50} className="text-teal-500" />
                                )}
                                
                                {isEditing && (
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                                    >
                                        <Upload size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                                    </button>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {/* Verification Badge */}
                            <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 flex items-center justify-center bg-green-500 text-white shadow-lg animate-bounce" style={{ borderColor: isDonor ? '#0f172a' : '#fff' }}>
                                <CheckCircle size={14} strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Content Area */}
                    <div className="mt-6 text-center">
                        {isEditing ? (
                            /* ── EDIT MODE ── */
                            <div className="max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <input 
                                        type="text"
                                        className={`w-full text-center text-4xl font-black border-b-2 focus:outline-none bg-transparent transition-colors ${
                                            isDonor ? 'text-white border-teal-500/50 focus:border-teal-400 placeholder-gray-600' : 'text-gray-900 border-teal-500 focus:border-teal-600 placeholder-gray-300'
                                        }`}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                    <div className="flex gap-3 justify-center pt-2">
                                        <button 
                                            disabled={loading}
                                            onClick={handleSave}
                                            className="px-8 py-3.5 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-teal-500 disabled:opacity-50 shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-1"
                                        >
                                            <Save size={18} /> {loading ? 'Syncing...' : 'Save Identity'}
                                        </button>
                                        <button 
                                            disabled={loading}
                                            onClick={() => { setIsEditing(false); setFormData({ name: user.name, image: user.image }); }}
                                            className={`px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all ${
                                                isDonor ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            <X size={18} /> Cancel
                                        </button>
                                    </div>
                                </div>

                                {isPatient && (
                                    <div className="pt-8 border-t border-gray-100 space-y-6 text-left">
                                        <h4 className="text-sm font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                                            <ClipboardList size={18} /> Clinical Info Updates
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age</label>
                                                <input type="number"
                                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-700"
                                                    value={clinicalData.age}
                                                    onChange={(e) => setClinicalData({ ...clinicalData, age: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gender</label>
                                                <select 
                                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-700"
                                                    value={clinicalData.gender}
                                                    onChange={(e) => setClinicalData({ ...clinicalData, gender: e.target.value })}>
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Blood Group</label>
                                            <input type="text"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-700 uppercase"
                                                value={clinicalData.bloodGroup}
                                                onChange={(e) => setClinicalData({ ...clinicalData, bloodGroup: e.target.value })}
                                                placeholder="e.g. O+" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical History</label>
                                            <textarea 
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none font-medium text-gray-700"
                                                rows={3}
                                                value={clinicalData.medicalHistory}
                                                onChange={(e) => setClinicalData({ ...clinicalData, medicalHistory: e.target.value })}
                                                placeholder="Asthma, Diabetes..." />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── VIEW MODE ── */
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                <div>
                                    <h3 className="text-4xl font-black tracking-tight">{user?.name}</h3>
                                    <div className="flex items-center justify-center mt-3 gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${
                                            isDonor ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-teal-100 text-teal-700 border-teal-200'
                                        }`}>
                                            <Shield size={12} /> {user?.role} Access
                                        </span>
                                        {isDonor && (
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                isMilk ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {user?.donationType} Donor
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className={`flex justify-center items-center gap-4 mt-4 text-sm font-bold ${isDonor ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <span className="flex items-center gap-1.5"><Mail size={16} /> {user?.email}</span>
                                    </div>
                                </div>

                                {/* ── Donor Specific Layout ── */}
                                {isDonor && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-6">
                                        <div className="bg-slate-800 border border-white/5 p-5 rounded-3xl flex flex-col items-center justify-center pointer-events-none">
                                            <Award size={24} className="text-yellow-500 mb-2" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Donation Tier</p>
                                            <p className="text-white font-black text-lg mt-0.5">Hero</p>
                                        </div>
                                        <div className="bg-slate-800 border border-white/5 p-5 rounded-3xl flex flex-col items-center justify-center pointer-events-none">
                                            {isMilk ? <Baby size={24} className="text-pink-500 mb-2" /> : <Heart size={24} className="text-red-500 mb-2" />}
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Blood Group</p>
                                            <p className="text-white font-black text-lg mt-0.5 uppercase">{user?.bloodType || '—'}</p>
                                        </div>
                                        <div className="bg-slate-800 border border-white/5 p-5 rounded-3xl flex flex-col items-center justify-center md:col-span-2 relative overflow-hidden group hover:border-green-500/30 transition-colors">
                                            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <Shield size={24} className="text-green-400 mb-2" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Status</p>
                                            <p className="text-green-400 font-black text-lg mt-0.5 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse"></span>
                                                Fully Verified & Active
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Patient Specific Layout ── */}
                                {isPatient && (
                                    <div className="pt-6">
                                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
                                                <Activity size={24} className="text-teal-500 mb-2" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age / Gender</span>
                                                <span className="font-black text-xl text-gray-800 mt-1">{clinicalData.age || '--'} / {clinicalData.gender || '--'}</span>
                                            </div>
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center">
                                                <Heart size={24} className="text-red-500 mb-2" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Blood Group</span>
                                                <span className="font-black text-xl text-red-600 mt-1 uppercase">{clinicalData.bloodGroup || '--'}</span>
                                            </div>
                                        </div>

                                        {clinicalData.medicalHistory && (
                                            <div className="max-w-md mx-auto mt-4 text-left bg-teal-50/50 border border-teal-100 p-6 rounded-3xl">
                                                <h4 className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <ClipboardList size={16} /> Known Medical History
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {clinicalData.medicalHistory.split(',').map((h, i) => h.trim() && (
                                                        <span key={i} className="px-4 py-2 bg-white text-teal-700 rounded-xl text-xs font-bold border border-teal-100 shadow-sm">
                                                            {h.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {message.text && (
                            <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
                                message.type === 'error' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                : 'bg-green-500/10 text-green-500 border-green-500/20'
                            }`}>
                                {message.type === 'error' ? <X size={14} /> : <CheckCircle size={14} />}
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Info Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isDonor ? 'opacity-90' : ''}`}>
                <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDonor ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDonor ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDonor ? 'text-gray-500' : 'text-gray-400'}`}>Communication Email</p>
                        <p className={`font-bold mt-0.5 ${isDonor ? 'text-white' : 'text-gray-900'}`}>{user?.email}</p>
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDonor ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDonor ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-500'}`}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDonor ? 'text-gray-500' : 'text-gray-400'}`}>Account Security</p>
                        <p className={`font-bold mt-0.5 ${isDonor ? 'text-white' : 'text-gray-900'}`}>Protected by HealthHub Guard</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
