import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';
import { appointmentService } from '../services/api';
import axios from 'axios';
import useStore from '../store/useStore';
import { 
    LayoutDashboard, 
    Calendar, 
    Droplet, 
    LogOut, 
    User as UserIcon,
    Bell,
    Settings,
    Baby,
    ArrowRight,
    Activity,
    HeartPulse,
    Stethoscope,
    Clock,
    CheckCircle,
    XCircle,
    MapPin,
    Navigation,
    Award,
    Heart,
    Zap,
    RefreshCw,
    Loader2,
    ShieldCheck,
    TrendingUp
} from 'lucide-react';
import BloodDonation from './BloodDonation';
import Appointments from './Appointments';
import Profile from './Profile';
import MilkDonation from './MilkDonation';
import AdminDashboard from './AdminDashboard';
import AdminAddDoctor from './AdminAddDoctor';

// ─── Milk Donor Home View ──────────────────────────────────────────────────────
const MilkDonorHomeView = ({ user }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const [locStatus, setLocStatus]     = useState('idle');
    const [locMsg, setLocMsg]           = useState('');
    const token = useStore(state => state.token);

    const handleUpdateLocation = () => {
        if (!navigator.geolocation) {
            setLocStatus('error');
            setLocMsg('Geolocation not supported.');
            return;
        }
        setLocStatus('loading');
        setLocMsg('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    await axios.post(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donors/location`,
                        { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setLocStatus('success');
                    setLocMsg('Location updated successfully!');
                } catch {
                    setLocStatus('error');
                    setLocMsg('Failed to update location. Try again.');
                }
            },
            () => {
                setLocStatus('error');
                setLocMsg('Location access denied. Please allow in browser settings.');
            },
            { enableHighAccuracy: true, timeout: 12000 }
        );
    };

    const stats = [
        {
            label: 'Donor Type',
            value: 'Milk Donor',
            icon: <Baby size={20} />,
            color: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
            iconColor: 'text-pink-400',
        },
        {
            label: 'Total Liters',
            value: '4.2 L',
            icon: <Droplet size={20} />,
            color: 'from-teal-500/20 to-teal-600/10 border-teal-500/20',
            iconColor: 'text-teal-400',
        },
        {
            label: 'Status',
            value: 'Active',
            icon: <ShieldCheck size={20} />,
            color: 'from-green-500/20 to-green-600/10 border-green-500/20',
            iconColor: 'text-green-400',
        },
        {
            label: 'Babies Fed',
            value: '12+',
            icon: <Heart size={20} />,
            color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
            iconColor: 'text-purple-400',
        },
    ];

    const quickActions = [
        { icon: <Baby size={22} />,   label: 'Milk Donation',  desc: 'Manage milk contributions',  to: 'milk-donation',  gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
        { icon: <UserIcon size={22} />, label: 'My Profile', desc: 'View your verified donor profile', to: 'profile', gradient: 'from-teal-500 to-indigo-500', shadow: 'shadow-teal-500/20' },
    ];

    return (
        <div className="space-y-8 max-w-4xl">

            {/* ── Hero Banner ── */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-2xl shadow-pink-500/30">
                            <Baby size={38} />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900" />
                    </div>

                    <div className="flex-1">
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{greeting}</p>
                        <h2 className="text-3xl font-black text-white mt-1 tracking-tight">{user?.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-pink-500/15 border border-pink-500/25 text-pink-400 text-xs font-black rounded-full uppercase tracking-wider">
                                Human Milk Donor
                            </span>
                            <span className="px-3 py-1 bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-black rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Verified Donor
                            </span>
                        </div>
                    </div>

                    {/* Impact Badge */}
                    <div className="text-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex-shrink-0">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Babies Nourished</p>
                        <p className="text-4xl font-black text-white mt-1">12+</p>
                        <p className="text-pink-400 text-[10px] font-black mt-0.5">Life-saving impact</p>
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className={`relative p-5 rounded-2xl bg-gradient-to-br border ${s.color} overflow-hidden`}>
                        <div className={`mb-3 ${s.iconColor}`}>{s.icon}</div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                        <p className="text-white text-xl font-black mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Update Location Card ── */}
            <div className="bg-slate-800 border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-12 h-12 bg-teal-500/15 border border-teal-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Navigation size={22} className="text-teal-400" />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-black text-base">Update Your Location</h4>
                    <p className="text-gray-500 text-sm mt-0.5">Allow nearby NICUs and milk banks to efficiently collect donations.</p>
                    {locStatus === 'success' && (
                        <p className="text-green-400 text-xs font-bold mt-1 flex items-center gap-1"><CheckCircle size={12} /> {locMsg}</p>
                    )}
                    {locStatus === 'error' && (
                        <p className="text-red-400 text-xs font-bold mt-1">{locMsg}</p>
                    )}
                </div>
                <button
                    onClick={handleUpdateLocation}
                    disabled={locStatus === 'loading'}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all flex-shrink-0 ${
                        locStatus === 'loading'
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : locStatus === 'success'
                            ? 'bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25'
                            : 'bg-teal-500/15 border border-teal-500/25 text-teal-400 hover:bg-teal-500/25'
                    }`}
                >
                    {locStatus === 'loading'
                        ? <><Loader2 size={16} className="animate-spin" /> Detecting...</>
                        : locStatus === 'success'
                        ? <><CheckCircle size={16} /> Updated</>
                        : <><MapPin size={16} /> Update Location</>
                    }
                </button>
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.to} to={action.to}
                            className="group relative overflow-hidden p-6 rounded-2xl bg-slate-800 border border-white/5 hover:border-white/10 transition-all hover:shadow-xl">
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl pointer-events-none`} />
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg ${action.shadow} mb-4`}>
                                {action.icon}
                            </div>
                            <h4 className="text-white font-black text-base group-hover:text-white transition-colors">{action.label}</h4>
                            <p className="text-gray-500 text-xs mt-1">{action.desc}</p>
                            <div className="flex items-center gap-1 text-gray-600 text-xs font-bold mt-4 group-hover:text-gray-300 transition-colors">
                                Open <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Donation Tips ── */}
            <div className="bg-gradient-to-br from-pink-600/10 to-rose-600/5 border border-pink-500/15 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Heart size={18} className="text-pink-400" />
                    <h4 className="text-white font-black text-sm uppercase tracking-wider">Lactation Guidelines</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: '🍼', title: 'Hygiene First', desc: 'Always wash hands thoroughly and ensure pump kits are properly sterilized before expression.' },
                        { icon: '❄️', title: 'Safe Storage', desc: 'Freeze milk immediately after pumping. Label bags safely with clear dates and quantities.' },
                        { icon: '🥗', title: 'Healthy Diet', desc: 'Maintain a nutrient-rich diet and stay highly hydrated to sustain excellent milk production.' },
                    ].map((tip, i) => (
                        <div key={i} className="flex gap-3 items-start p-4 bg-white/5 rounded-2xl">
                            <span className="text-xl flex-shrink-0">{tip.icon}</span>
                            <div>
                                <p className="text-white text-sm font-bold">{tip.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Donor Home View ─────────────────────────────────────────────────────────
const DonorHomeView = ({ user }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const [locStatus, setLocStatus]     = useState('idle'); // idle | loading | success | error
    const [locMsg, setLocMsg]           = useState('');
    const token = useStore(state => state.token);

    const isBlood = user?.donationType === 'blood' || user?.donationType === 'both';
    const isMilk  = user?.donationType === 'milk'  || user?.donationType === 'both';

    const handleUpdateLocation = () => {
        if (!navigator.geolocation) {
            setLocStatus('error');
            setLocMsg('Geolocation not supported.');
            return;
        }
        setLocStatus('loading');
        setLocMsg('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    await axios.post(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donors/location`,
                        { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setLocStatus('success');
                    setLocMsg('Location updated successfully!');
                } catch {
                    setLocStatus('error');
                    setLocMsg('Failed to update location. Try again.');
                }
            },
            () => {
                setLocStatus('error');
                setLocMsg('Location access denied. Please allow in browser settings.');
            },
            { enableHighAccuracy: true, timeout: 12000 }
        );
    };

    const stats = [
        {
            label: 'Donor Type',
            value: user?.donationType ? user.donationType.charAt(0).toUpperCase() + user.donationType.slice(1) : '—',
            icon: <Droplet size={20} />,
            color: 'from-red-500/20 to-red-600/10 border-red-500/20',
            iconColor: 'text-red-400',
        },
        {
            label: 'Blood Group',
            value: user?.bloodType || '—',
            icon: <Heart size={20} />,
            color: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
            iconColor: 'text-pink-400',
        },
        {
            label: 'Status',
            value: 'Active',
            icon: <ShieldCheck size={20} />,
            color: 'from-green-500/20 to-green-600/10 border-green-500/20',
            iconColor: 'text-green-400',
        },
        {
            label: 'Impact Score',
            value: '98%',
            icon: <TrendingUp size={20} />,
            color: 'from-teal-500/20 to-teal-600/10 border-teal-500/20',
            iconColor: 'text-teal-400',
        },
    ];

    const quickActions = [
        isBlood && { icon: <Droplet size={22} />, label: 'Blood Donation', desc: 'View requests & availability', to: 'blood-donation', gradient: 'from-red-600 to-rose-600', shadow: 'shadow-red-600/20' },
        isMilk  && { icon: <Baby size={22} />,   label: 'Milk Donation',  desc: 'Manage milk contributions',  to: 'milk-donation',  gradient: 'from-teal-600 to-indigo-600', shadow: 'shadow-teal-600/20' },
        { icon: <UserIcon size={22} />, label: 'My Profile', desc: 'View your verified donor profile', to: 'profile', gradient: 'from-indigo-600 to-violet-600', shadow: 'shadow-indigo-600/20' },
    ].filter(Boolean);

    return (
        <div className="space-y-8 max-w-4xl">

            {/* ── Hero Banner ── */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 border border-white/5 shadow-2xl">
                {/* BG Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-2xl shadow-red-600/30">
                            <Droplet size={38} />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900" />
                    </div>

                    <div className="flex-1">
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{greeting}</p>
                        <h2 className="text-3xl font-black text-white mt-1 tracking-tight">{user?.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-black rounded-full uppercase tracking-wider">
                                {user?.donationType || 'Donor'}
                            </span>
                            {user?.bloodType && (
                                <span className="px-3 py-1 bg-white/10 border border-white/10 text-white text-xs font-black rounded-full">
                                    {user.bloodType} ●
                                </span>
                            )}
                            <span className="px-3 py-1 bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-black rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Verified Donor
                            </span>
                        </div>
                    </div>

                    {/* Impact Badge */}
                    <div className="text-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex-shrink-0">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Lives Impacted</p>
                        <p className="text-4xl font-black text-white mt-1">∞</p>
                        <p className="text-green-400 text-[10px] font-black mt-0.5">Every donation counts</p>
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className={`relative p-5 rounded-2xl bg-gradient-to-br border ${s.color} overflow-hidden`}>
                        <div className={`mb-3 ${s.iconColor}`}>{s.icon}</div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                        <p className="text-white text-xl font-black mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Update Location Card ── */}
            <div className="bg-slate-800 border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Navigation size={22} className="text-orange-400" />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-black text-base">Update Your Location</h4>
                    <p className="text-gray-500 text-sm mt-0.5">Keep your location current so nearby patients can find you during emergencies.</p>
                    {locStatus === 'success' && (
                        <p className="text-green-400 text-xs font-bold mt-1 flex items-center gap-1"><CheckCircle size={12} /> {locMsg}</p>
                    )}
                    {locStatus === 'error' && (
                        <p className="text-red-400 text-xs font-bold mt-1">{locMsg}</p>
                    )}
                </div>
                <button
                    onClick={handleUpdateLocation}
                    disabled={locStatus === 'loading'}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all flex-shrink-0 ${
                        locStatus === 'loading'
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : locStatus === 'success'
                            ? 'bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25'
                            : 'bg-orange-500/15 border border-orange-500/25 text-orange-400 hover:bg-orange-500/25'
                    }`}
                >
                    {locStatus === 'loading'
                        ? <><Loader2 size={16} className="animate-spin" /> Detecting...</>
                        : locStatus === 'success'
                        ? <><CheckCircle size={16} /> Updated</>
                        : <><MapPin size={16} /> Update Location</>
                    }
                </button>
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.to} to={action.to}
                            className="group relative overflow-hidden p-6 rounded-2xl bg-slate-800 border border-white/5 hover:border-white/10 transition-all hover:shadow-xl">
                            {/* Hover glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl pointer-events-none`} />
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg ${action.shadow} mb-4`}>
                                {action.icon}
                            </div>
                            <h4 className="text-white font-black text-base group-hover:text-white transition-colors">{action.label}</h4>
                            <p className="text-gray-500 text-xs mt-1">{action.desc}</p>
                            <div className="flex items-center gap-1 text-gray-600 text-xs font-bold mt-4 group-hover:text-gray-300 transition-colors">
                                Open <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Donation Tips ── */}
            <div className="bg-gradient-to-br from-teal-600/10 to-indigo-600/5 border border-teal-500/15 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={18} className="text-teal-400" />
                    <h4 className="text-white font-black text-sm uppercase tracking-wider">Donor Tips</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: '💧', title: 'Stay Hydrated', desc: 'Drink 500ml of water before donating to keep iron levels stable.' },
                        { icon: '🥗', title: 'Eat Beforehand', desc: 'Have a nutritious meal 2–3 hours before your donation.' },
                        { icon: '😴', title: 'Rest Well', desc: 'Get 7–8 hours of sleep the night before to ensure quality donation.' },
                    ].map((tip, i) => (
                        <div key={i} className="flex gap-3 items-start p-4 bg-white/5 rounded-2xl">
                            <span className="text-xl flex-shrink-0">{tip.icon}</span>
                            <div>
                                <p className="text-white text-sm font-bold">{tip.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Generic QuickCard (for patient/doctor home) ──────────────────────────────
const QuickCard = ({ icon, title, desc, to, color }) => (
    <Link to={to} className={`group p-6 rounded-2xl border ${color} hover:shadow-md transition-all flex flex-col gap-4`}>
        <div>{icon}</div>
        <div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
        </div>
        <div className="flex items-center text-teal-600 text-sm font-semibold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Open <ArrowRight size={14} />
        </div>
    </Link>
);

const HomeView = ({ user }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (user?.role === 'patient' || user?.role === 'doctor') {
            appointmentService.getAppointments()
                .then(({ data }) => setAppointments(data))
                .catch(() => {});
        }
    }, [user?.role]);

    const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status)).slice(0, 3);
    const past = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status)).slice(0, 3);

    const STATUS_LABEL = {
        pending: { label: 'Pending', cls: 'bg-teal-100 text-teal-700' },
        approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
        rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
        completed: { label: 'Completed', cls: 'bg-purple-100 text-purple-700' },
        cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
    };

    const cards = {
        patient: [
            { icon: <Calendar size={28} className="text-teal-600" />, title: 'My Appointments', desc: 'View and book appointments with AI reliability scoring', to: 'appointments', color: 'border-teal-100 bg-teal-50/50' },
            { icon: <Droplet size={28} className="text-red-500" />, title: 'Blood Donation', desc: 'Find nearby donors and request blood', to: 'blood-donation', color: 'border-red-100 bg-red-50/50' },
            { icon: <Baby size={28} className="text-pink-500" />, title: 'Milk Donation', desc: 'Priority-based human milk donor network', to: 'milk-donation', color: 'border-pink-100 bg-pink-50/50' },
            { icon: <UserIcon size={28} className="text-indigo-500" />, title: 'My Profile', desc: 'View and update your account details', to: 'profile', color: 'border-indigo-100 bg-indigo-50/50' },
        ],
        doctor: [
            { icon: <Calendar size={28} className="text-teal-600" />, title: 'My Schedule', desc: 'See all upcoming patient appointments', to: 'appointments', color: 'border-teal-100 bg-teal-50/50' },
            { icon: <UserIcon size={28} className="text-indigo-500" />, title: 'My Profile', desc: 'View your doctor profile and specialization', to: 'profile', color: 'border-indigo-100 bg-indigo-50/50' },
        ],
        donor: [
            { icon: <Droplet size={28} className="text-red-500" />, title: 'Blood Donation', desc: 'Update your location and availability', to: 'blood-donation', color: 'border-red-100 bg-red-50/50' },
            { icon: <Baby size={28} className="text-pink-500" />, title: 'Milk Donation', desc: 'Manage your breast milk donation contributions', to: 'milk-donation', color: 'border-pink-100 bg-pink-50/50' },
            { icon: <UserIcon size={28} className="text-indigo-500" />, title: 'My Profile', desc: 'View your verified donor status', to: 'profile', color: 'border-indigo-100 bg-indigo-50/50' },
        ]
    };

    const roleIcon = {
        patient: <HeartPulse size={40} className="text-white" />,
        doctor: <Stethoscope size={40} className="text-white" />,
        donor: <Activity size={40} className="text-white" />
    };

    const getDonorCards = () => {
        const baseCards = cards.donor;
        if (user?.donationType === 'blood') {
            return baseCards.filter(c => c.to !== 'milk-donation');
        }
        if (user?.donationType === 'milk') {
            return baseCards.filter(c => c.to !== 'blood-donation');
        }
        return baseCards;
    };

    const donorCards = user?.role === 'donor' ? getDonorCards() : [];

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="bg-gradient-to-br from-teal-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        {roleIcon[user?.role] || <UserIcon size={40} className="text-white" />}
                    </div>
                    <div>
                        <p className="text-teal-200 text-sm font-medium uppercase tracking-wider">{greeting}</p>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold">{user?.name}</h2>
                            {user?.role === 'donor' && (
                                <div className="flex gap-2">
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/30">
                                        {user?.donationType?.toUpperCase()} DONOR
                                    </span>
                                    {user?.bloodType && (
                                        <span className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-400">
                                            {user?.bloodType}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-teal-100 max-w-md">
                    {user?.role === 'doctor' && 'Manage your patient schedule and track appointments from your personalized dashboard.'}
                    {user?.role === 'patient' && 'Book appointments, find donors, and manage your health journey — all in one place.'}
                    {user?.role === 'donor' && 'Your donations save lives. Update your availability and manage your contributions below.'}
                </p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4">Quick Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(user?.role === 'donor' ? donorCards : (cards[user?.role] || [])).map(card => (
                        <QuickCard key={card.title} {...card} />
                    ))}
                </div>
            </div>

            {/* Doctor Specific View: Quick Stats & Schedule */}
            {user?.role === 'doctor' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">Pending Actions</p>
                            <p className="text-3xl font-bold text-teal-600 mt-1">{appointments.filter(a => a.status === 'pending').length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">High Risk Alerts</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{appointments.filter(a => a.reliabilityScore < 60).length}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-700">Upcoming Schedule</h3>
                        <Link to="appointments" className="text-sm text-teal-600 hover:underline font-semibold">View All →</Link>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                            <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No scheduled appointments yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.filter(a => ['pending', 'approved'].includes(a.status)).slice(0, 3).map(appt => (
                                <div key={appt._id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-teal-400">{new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                        <span className="text-lg font-black text-teal-700">{new Date(appt.date).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate font-inter">{appt.patient?.name || 'Patient'}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Clock size={10} />
                                            {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                            appt.reliabilityScore >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
                                            appt.reliabilityScore >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                                            'text-red-600 bg-red-50 border-red-200'
                                        }`}>
                                            <Activity size={12} />
                                            {appt.reliabilityScore}%
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                                            appt.status === 'pending' ? 'bg-teal-100 text-teal-700' : 'bg-green-100 text-green-700'
                                        }`}>{appt.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Health Journey — Patient Only */}
            {user?.role === 'patient' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-700">Health Journey</h3>
                        <Link to="appointments" className="text-sm text-teal-600 hover:underline font-semibold">View All →</Link>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                            <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No appointments yet. <Link to="appointments" className="text-teal-500 font-semibold underline">Book one now</Link></p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider flex items-center gap-1"><Clock size={11} /> Upcoming</p>
                                    <div className="space-y-2">
                                        {upcoming.map(appt => {
                                            const cfg = STATUS_LABEL[appt.status] || STATUS_LABEL.pending;
                                            return (
                                                <div key={appt._id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                                                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex flex-col items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-teal-400">{new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                                        <span className="text-lg font-black text-teal-700">{new Date(appt.date).getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{appt.doctor?.name || 'Doctor'}</p>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Clock size={10} />
                                                            {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        {appt.reason && <p className="text-xs text-gray-400 truncate mt-0.5">{appt.reason}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                                                        <span className="text-xs font-bold text-gray-500">{appt.reliabilityScore}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {past.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-2 mt-4 tracking-wider flex items-center gap-1"><CheckCircle size={11} /> Past</p>
                                    <div className="space-y-2">
                                        {past.map(appt => {
                                            const cfg = STATUS_LABEL[appt.status] || STATUS_LABEL.completed;
                                            return (
                                                <div key={appt._id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4 opacity-80">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex flex-col items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-gray-400">{new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                                        <span className="text-lg font-black text-gray-600">{new Date(appt.date).getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-700 truncate">{appt.doctor?.name || 'Doctor'}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{new Date(appt.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Sidebar = () => {
    const user = useStore(state => state.user);
    const logout = useStore(state => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '', roles: ['patient', 'doctor', 'donor', 'admin'] },
        { label: 'Appointments', icon: <Calendar size={20} />, path: 'appointments', roles: ['patient', 'doctor', 'admin'] },
        { label: 'Onboard Doctor', icon: <Stethoscope size={20} />, path: 'onboard-doctor', roles: ['admin'] },
        { label: 'Blood Donation', icon: <Droplet size={20} />, path: 'blood-donation', roles: ['patient', 'donor', 'admin'] },
        { label: 'Milk Bank', icon: <Baby size={20} />, path: 'milk-donation', roles: ['patient', 'donor', 'admin'] },
        { label: 'My Profile', icon: <UserIcon size={20} />, path: 'profile', roles: ['patient', 'doctor', 'donor', 'admin'] },
    ];

    return (
        <div className="w-72 bg-slate-900 h-screen border-r border-white/5 flex flex-col text-gray-400 relative z-20">
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-600 rounded-xl text-white shadow-lg shadow-teal-600/20">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tighter">HealthHub<span className="text-teal-500">AI</span></h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Live</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 mb-4">Main Menu</p>
                {navItems.filter(item => {
                    if (!item.roles.includes(user?.role)) return false;
                    
                    // Specific logic to hide irrelevant modules from specialized donors
                    if (user?.role === 'donor') {
                        if (item.path === 'blood-donation' && user?.donationType === 'milk') return false;
                        if (item.path === 'milk-donation' && user?.donationType === 'blood') return false;
                    }
                    
                    return true;
                }).map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.path === ''}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3.5 rounded-2xl transition-all text-sm font-bold group ${
                                isActive
                                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xl shadow-teal-600/10'
                                    : 'hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <span className={`mr-3 transition-transform group-hover:scale-110`}>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 mt-auto">
                <div className="bg-white/5 rounded-3xl p-5 border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600/20 to-indigo-600/20 flex items-center justify-center text-teal-500 font-black border border-teal-500/20">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-tight mt-0.5">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-red-600/20"
                    >
                        <LogOut size={16} className="mr-2" />
                        Terminate Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const user = useStore(state => state.user);
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Overview</h2>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors">
                            <Bell size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>
                <main className="p-8">
                    <Routes>
                        <Route path="/" element={
                            user?.role === 'admin' ? <AdminDashboard /> : 
                            (user?.role === 'donor' && user?.donationType === 'milk') ? <MilkDonorHomeView user={user} /> :
                            user?.role === 'donor' ? <DonorHomeView user={user} /> :
                            <HomeView user={user} />
                        } />
                        <Route path="appointments" element={<Appointments />} />
                        <Route path="onboard-doctor" element={<AdminAddDoctor />} />
                        <Route path="blood-donation" element={<BloodDonation />} />
                        <Route path="milk-donation" element={<MilkDonation />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
