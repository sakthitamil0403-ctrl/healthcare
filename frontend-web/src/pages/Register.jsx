import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import useStore from '../store/useStore';
import { 
    UserPlus, Mail, Lock, User, PlusCircle, MapPin, 
    CheckCircle, Droplet, ArrowRight, Activity, 
    Stethoscope, HeartPulse, ShieldCheck, Loader2,
    AlertTriangle, Navigation, RefreshCw
} from 'lucide-react';

// Only donors need location (for proximity-based matching)
// Patients do NOT have a location field in the Patient model

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        phone: '',
        bloodType: 'O+',
        donationType: 'blood',
        location: null
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Location state
    const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | secured | error
    const [coords, setCoords] = useState(null);                   // { lat, lng, accuracy }
    const [locationError, setLocationError] = useState('');

    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();

    // Only donors need location
    const needsLocation = formData.role === 'donor';

    const resetLocation = () => {
        setFormData(prev => ({ ...prev, location: null }));
        setLocationStatus('idle');
        setCoords(null);
        setLocationError('');
    };

    const handleRoleChange = (roleId) => {
        setFormData(prev => ({ ...prev, role: roleId, location: null }));
        setLocationStatus('idle');
        setCoords(null);
        setLocationError('');
    };

    // One-shot current location
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setLocationStatus('loading');
        setLocationError('');
        setCoords(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setCoords({ lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });
                setFormData(prev => ({
                    ...prev,
                    location: { type: 'Point', coordinates: [longitude, latitude] }
                }));
                setLocationStatus('secured');
            },
            (err) => {
                setLocationStatus('error');
                setLocationError(
                    err.code === 1
                        ? 'Location access denied. Please allow location in your browser settings and try again.'
                        : 'Could not determine your location. Please try again.'
                );
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (needsLocation && !formData.location) {
            setLocationError('📍 Location is required for Donor registration. Please enable your location.');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await authService.register(formData);
            setUser(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. System timeout.');
        } finally {
            setIsLoading(false);
        }
    };

    // Accuracy quality
    const getAccuracyInfo = (acc) => {
        if (!acc) return null;
        if (acc <= 10)  return { label: 'Excellent', color: 'text-green-400', bar: 'bg-green-500 w-full' };
        if (acc <= 30)  return { label: 'Good',      color: 'text-teal-400',  bar: 'bg-teal-500 w-3/4' };
        if (acc <= 100) return { label: 'Fair',       color: 'text-yellow-400',bar: 'bg-yellow-500 w-1/2' };
        return           { label: 'Low',        color: 'text-orange-400',bar: 'bg-orange-500 w-1/4' };
    };
    const accuracyInfo = getAccuracyInfo(coords?.accuracy);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Side: Branding */}
                <div className="hidden lg:block space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-4 bg-gradient-to-tr from-teal-600 to-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-teal-500/20">
                            <UserPlus size={40} className="animate-pulse" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">HealthHub<span className="text-teal-500">AI</span></h1>
                    </div>
                    <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                        Join the <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">Next Gen Network.</span>
                    </h2>
                    <div className="space-y-6 pt-4">
                        {[
                            { icon: <CheckCircle className="text-teal-500" />, title: 'Real-time Triage', desc: 'Get AI assessment in seconds.' },
                            { icon: <MapPin className="text-indigo-500" />, title: 'Geospatial Discovery', desc: 'Find donors and doctors near you.' },
                            { icon: <ShieldCheck className="text-green-500" />, title: 'Blockchain Security', desc: 'Secure medical data encryption.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{item.icon}</div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                                    <p className="text-gray-400 text-sm font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Register Card */}
                <div className="flex justify-center lg:justify-end">
                    <div className="w-full max-w-lg space-y-8 bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/5 to-indigo-600/5 rounded-[3rem] -z-10"></div>
                        
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">Create Identity</h3>
                            <p className="text-gray-400 text-sm mt-2 font-medium">Join 12,000+ clinical users worldwide.</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-3">
                                    <Activity size={18} /> {error}
                                </div>
                            )}

                            {/* Name + Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group/input">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-teal-500 transition-colors" size={18} />
                                    <input type="text" required value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium text-sm"
                                        placeholder="Full Name" />
                                </div>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-teal-500 transition-colors" size={18} />
                                    <input type="email" required value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium text-sm"
                                        placeholder="Email Address" />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="relative group/input">
                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-teal-500 transition-colors" size={18} />
                                <input type="tel" value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium text-sm"
                                    placeholder="Phone (e.g. +91 9876543210)" />
                            </div>

                            {/* Password */}
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-teal-500 transition-colors" size={18} />
                                <input type="password" required value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium text-sm"
                                    placeholder="Secure Password" />
                            </div>

                            {/* Role Selector */}
                            <div className="pt-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">System Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'patient', icon: <HeartPulse size={16} />, label: 'Patient' },
                                        { id: 'donor',   icon: <Droplet size={16} />,     label: 'Donor' }
                                    ].map(role => (
                                        <button key={role.id} type="button" onClick={() => handleRoleChange(role.id)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                                                formData.role === role.id
                                                ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}>
                                            {role.icon}
                                            {role.label}
                                            {role.id === 'donor' && (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                                    formData.role === 'donor' ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-400'
                                                }`}>📍 Required</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ===== LOCATION SECTION (Donor only) ===== */}
                            {needsLocation && (
                                <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">

                                    {/* Info Banner */}
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                        <Navigation size={14} className="text-orange-400 flex-shrink-0" />
                                        <p className="text-orange-400 text-[11px] font-bold">
                                            Location is <span className="underline">required</span> — enables nearby donor matching
                                        </p>
                                    </div>

                                    {/* Get Location Button */}
                                    {locationStatus !== 'secured' && (
                                        <button type="button" onClick={handleGetLocation}
                                            disabled={locationStatus === 'loading'}
                                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all text-sm font-bold ${
                                                locationStatus === 'loading'
                                                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 cursor-not-allowed'
                                                : locationStatus === 'error'
                                                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15'
                                                : 'bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20'
                                            }`}>
                                            {locationStatus === 'loading'
                                                ? <><Loader2 size={18} className="animate-spin" /> Detecting Location...</>
                                                : locationStatus === 'error'
                                                ? <><RefreshCw size={18} /> Retry Location</>
                                                : <><MapPin size={18} /> Use Current Location</>
                                            }
                                        </button>
                                    )}

                                    {/* Secured Location — simple confirmation only */}
                                    {locationStatus === 'secured' && (
                                        <div className="flex items-center justify-between px-4 py-3 bg-green-500/10 border border-green-500/25 rounded-2xl">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={16} className="text-green-400" />
                                                <span className="text-green-400 text-sm font-bold">Location secured</span>
                                            </div>
                                            <button type="button" onClick={resetLocation}
                                                className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors text-[11px] font-bold">
                                                <RefreshCw size={12} /> Reset
                                            </button>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {locationError && (
                                        <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-red-400 text-xs font-medium">{locationError}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Donor Extra Fields */}
                            {formData.role === 'donor' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setFormData({...formData, donationType: 'blood'})}
                                            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                                formData.donationType === 'blood' ? 'bg-red-500 border-red-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                                            }`}>
                                            <Droplet size={14} /> Blood
                                        </button>
                                        <button type="button" onClick={() => setFormData({...formData, donationType: 'milk'})}
                                            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                                formData.donationType === 'milk' ? 'bg-teal-500 border-teal-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                                            }`}>
                                            <PlusCircle size={14} /> Human Milk
                                        </button>
                                    </div>
                                    {formData.donationType !== 'milk' && (
                                        <select value={formData.bloodType}
                                            onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-bold text-sm">
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                                <option key={type} value={type} className="bg-slate-900">{type} Group</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit"
                                disabled={isLoading || (needsLocation && !formData.location)}
                                className={`w-full py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group/btn mt-4 ${
                                    needsLocation && !formData.location
                                    ? 'bg-gray-700 border border-white/10 text-gray-400 cursor-not-allowed opacity-60'
                                    : 'bg-gradient-to-r from-teal-600 to-indigo-600 hover:opacity-90 shadow-teal-500/20 disabled:opacity-50'
                                }`}>
                                {isLoading ? 'Building Identity...' : (
                                    needsLocation && !formData.location
                                    ? <><MapPin size={16} /> Enable Location to Continue</>
                                    : <>Register Account <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                                Already have an identity?{' '}
                                <Link to="/login" className="text-teal-500 hover:underline ml-1">Sign in system</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
