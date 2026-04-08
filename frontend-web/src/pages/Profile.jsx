import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { User, Mail, Shield, CheckCircle, Edit2, X, Save, Upload, Heart, Activity, ClipboardList } from 'lucide-react';
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
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-10">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-all flex items-center gap-2 text-sm font-semibold"
                        >
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    )}
                </div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-center">
                        <div className="absolute -top-16 w-32 h-32 rounded-3xl bg-white p-2 shadow-xl">
                            <div className="w-full h-full rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden relative group">
                                {formData.image ? (
                                    <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} />
                                )}
                                
                                {isEditing && (
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Upload size={24} />
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
                        </div>
                    </div>
                    
                    <div className="mt-20 text-center">
                        {isEditing ? (
                            <div className="max-w-md mx-auto space-y-6">
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline"
                                >
                                    Change Photo
                                </button>

                                <div className="space-y-4">
                                    <input 
                                        type="text"
                                        className="w-full text-center text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                    <div className="flex gap-2 justify-center">
                                        <button 
                                            disabled={loading}
                                            onClick={handleSave}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200"
                                        >
                                            <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
                                        </button>
                                        <button 
                                            disabled={loading}
                                            onClick={() => { setIsEditing(false); setFormData({ name: user.name, image: user.image }); }}
                                            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-200"
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </div>

                                {user?.role === 'patient' && (
                                    <div className="mt-8 pt-8 border-t border-gray-100 space-y-4 text-left">
                                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <ClipboardList size={18} className="text-blue-500" /> Clinical Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase">Age</label>
                                                <input 
                                                    type="number"
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                                                    value={clinicalData.age}
                                                    onChange={(e) => setClinicalData({ ...clinicalData, age: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase">Gender</label>
                                                <select 
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                                                    value={clinicalData.gender}
                                                    onChange={(e) => setClinicalData({ ...clinicalData, gender: e.target.value })}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Blood Group</label>
                                            <input 
                                                type="text"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                                                value={clinicalData.bloodGroup}
                                                onChange={(e) => setClinicalData({ ...clinicalData, bloodGroup: e.target.value })}
                                                placeholder="e.g. A+, O-"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Medical History (comma separated)</label>
                                            <textarea 
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-gray-700"
                                                rows={3}
                                                value={clinicalData.medicalHistory}
                                                onChange={(e) => setClinicalData({ ...clinicalData, medicalHistory: e.target.value })}
                                                placeholder="e.g. Asthma, Diabetes, Seasonal Allergies"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{user?.name}</h3>
                                    <div className="flex items-center justify-center mt-2 space-x-2">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <Shield size={12} /> {user?.role} Portal
                                        </span>
                                    </div>
                                </div>

                                {user?.role === 'patient' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center">
                                                <Activity size={20} className="text-blue-500 mb-1" />
                                                <span className="text-xs font-bold text-gray-400 uppercase">Age / Gender</span>
                                                <span className="font-bold text-gray-800">{clinicalData.age || '--'} / {clinicalData.gender || '--'}</span>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center">
                                                <Heart size={20} className="text-red-500 mb-1" />
                                                <span className="text-xs font-bold text-gray-400 uppercase">Blood Group</span>
                                                <span className="font-bold text-red-600">{clinicalData.bloodGroup || '--'}</span>
                                            </div>
                                        </div>

                                        {clinicalData.medicalHistory && (
                                            <div className="max-w-md mx-auto text-left bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <ClipboardList size={14} /> Medical History
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {clinicalData.medicalHistory.split(',').map((h, i) => h.trim() && (
                                                        <span key={i} className="px-3 py-1 bg-white text-blue-700 rounded-lg text-xs font-bold border border-blue-200 shadow-sm">
                                                            {h.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            <div className="pt-4 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Mail size={14} /> {user?.email}
                                </div>
                                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <CheckCircle size={14} /> Verified Member
                                </div>
                            </div>
                        </div>
                    )}
                        
                        {message.text && (
                            <p className={`mt-4 text-sm font-semibold ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6">
                        <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                            <Mail className="text-gray-400 mr-4" size={24} />
                            <div>
                                <p className="text-sm text-gray-500">Email Address</p>
                                <p className="font-semibold text-gray-900">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                            <Shield className="text-gray-400 mr-4" size={24} />
                            <div>
                                <p className="text-sm text-gray-500">Account Security</p>
                                <p className="font-semibold text-gray-900">Protected by HealthHub Guard</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-gray-100">
                        <div className="flex items-center justify-between text-gray-600 bg-green-50 p-4 rounded-2xl border border-green-100">
                            <div className="flex items-center font-medium text-green-700">
                                <CheckCircle size={20} className="mr-2" />
                                Verified Profile Status
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
