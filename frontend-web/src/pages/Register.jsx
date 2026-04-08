import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import useStore from '../store/useStore';
import { 
    UserPlus, Mail, Lock, User, PlusCircle, MapPin, 
    CheckCircle, Droplet, ArrowRight, Activity, 
    Stethoscope, HeartPulse, ShieldCheck, Loader2 
} from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        bloodType: 'O+',
        donationType: 'blood',
        location: null
    });
    const [error, setError] = useState('');
    const [detecting, setDetecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState('');
    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();

    const handleGetLocation = () => {
        setDetecting(true);
        setLocationStatus('Scanning Satellite...');
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setDetecting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData({
                    ...formData,
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                });
                setDetecting(false);
                setLocationStatus('Location Secured');
            },
            (err) => {
                setError('Precision location access denied.');
                setDetecting(false);
                setLocationStatus('');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
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

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side: Branding & Value Prop */}
                <div className="hidden lg:block space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-blue-500/20">
                            <UserPlus size={40} className="animate-pulse" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">HealthHub<span className="text-blue-500">AI</span></h1>
                    </div>
                    
                    <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                        Join the <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Next Gen Network.</span>
                    </h2>
                    
                    <div className="space-y-6 pt-4">
                        {[
                            { icon: <CheckCircle className="text-blue-500" />, title: 'Real-time Triage', desc: 'Get AI assessment in seconds.' },
                            { icon: <MapPin className="text-indigo-500" />, title: 'Geospatial Discovery', desc: 'Find donors and doctors near you.' },
                            { icon: <ShieldCheck className="text-green-500" />, title: 'Blockchain Security', desc: 'Secure medical data encryption.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-[3rem] -z-10"></div>
                        
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group/input">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-sm"
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>

                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-sm"
                                    placeholder="Secure Password"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">System Role</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'patient', icon: <HeartPulse size={16} />, label: 'Patient' },
                                        { id: 'doctor', icon: <Stethoscope size={16} />, label: 'Doctor' },
                                        { id: 'donor', icon: <Droplet size={16} />, label: 'Donor' }
                                    ].map(role => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setFormData({...formData, role: role.id})}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                                                formData.role === role.id 
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {role.icon}
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.role === 'donor' && (
                                <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, donationType: 'blood'})}
                                            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                                formData.donationType === 'blood' 
                                                ? 'bg-red-500 border-red-400 text-white' 
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                            }`}
                                        >
                                            <Droplet size={14} /> Blood
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, donationType: 'milk'})}
                                            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                                formData.donationType === 'milk' 
                                                ? 'bg-blue-500 border-blue-400 text-white' 
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                            }`}
                                        >
                                            <PlusCircle size={14} /> Human Milk
                                        </button>
                                    </div>

                                    {formData.donationType !== 'milk' && (
                                        <select
                                            value={formData.bloodType}
                                            onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-sm"
                                        >
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                                <option key={type} value={type} className="bg-[#1a1a1a]">{type} Group</option>
                                            ))}
                                        </select>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={detecting}
                                        className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border transition-all text-sm font-bold ${
                                            formData.location 
                                            ? 'bg-green-500/20 border-green-500/40 text-green-500' 
                                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                        }`}
                                    >
                                        {detecting ? <Loader2 className="animate-spin" size={18} /> : (formData.location ? <CheckCircle size={18} /> : <MapPin size={18} />)}
                                        {locationStatus || 'Verify Geospatial Location'}
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group/btn mt-4 disabled:opacity-50"
                            >
                                {isLoading ? 'Building Identity...' : (
                                    <>
                                        Register Account <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                                Already have an identity?{' '}
                                <Link to="/login" className="text-blue-500 hover:underline ml-1">
                                    Sign in system
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
