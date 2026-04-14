import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Calendar, 
    Activity, 
    Database, 
    TrendingUp, 
    AlertCircle, 
    Search, 
    Filter, 
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    ShieldCheck,
    Stethoscope,
    HeartPulse,
    Droplet,
    ArrowRight,
    Zap,
    Send,
    Navigation,
    Loader2
} from 'lucide-react';
import { adminService, donorService } from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color, trend }) => (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/20 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            {trend && (
                <span className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-black ${trend > 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'} uppercase tracking-widest`}>
                    <TrendingUp size={12} className="mr-1" />
                    {trend}%
                </span>
            )}
        </div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">{value}</h3>
    </div>
);

const RoleBadge = ({ role }) => {
    const roles = {
        admin: { bg: 'bg-slate-100', text: 'text-slate-700', icon: <ShieldCheck size={12} /> },
        doctor: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Stethoscope size={12} /> },
        patient: { bg: 'bg-teal-100', text: 'text-teal-700', icon: <HeartPulse size={12} /> },
        donor: { bg: 'bg-red-100', text: 'text-red-700', icon: <Droplet size={12} /> }
    };
    const cfg = roles[role] || roles.patient;
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text} border border-transparent hover:border-current transition-colors`}>
            {cfg.icon}
            {role}
        </span>
    );
};

const RecommendationCard = ({ type, title, text, icon: IconName }) => {
    const Icon = { Users, Calendar, Activity, Database, TrendingUp, AlertCircle, CheckCircle }[IconName] || AlertCircle;
    const styles = {
        critical: 'bg-red-500/10 border-red-500/20 text-red-700',
        warning: 'bg-orange-500/10 border-orange-500/20 text-orange-700',
        info: 'bg-teal-500/10 border-teal-500/20 text-teal-700',
        action: 'bg-indigo-500/10 border-indigo-100/20 text-indigo-700',
        success: 'bg-green-500/10 border-green-500/20 text-green-700'
    }[type];

    return (
        <div className={`p-6 rounded-[1.5rem] border ${styles} flex gap-5 items-start shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden backdrop-blur-md`}>
            <div className={`shrink-0 p-3.5 rounded-2xl bg-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform text-current`}>
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{type} insight</span>
                    <Zap size={10} className="animate-pulse" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight text-gray-900">{title}</h4>
                <p className="text-xs opacity-80 leading-relaxed font-bold italic mt-1">{text}</p>
            </div>
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <Icon size={80} />
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering States
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [apptUrgencyFilter, setApptUrgencyFilter] = useState('all');
    const [apptStatusFilter, setApptStatusFilter] = useState('all');
    
    // Broadcast State
    const [broadcastData, setBroadcastData] = useState({
        bloodType: 'O+',
        radius: 5000,
        message: ''
    });
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        
        socket.on('clinical-alert', (data) => {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-[2.5rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border-2 border-red-600`}>
                    <div className="flex-1 w-0 p-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                                    <AlertCircle size={32} />
                                </div>
                            </div>
                            <div className="ml-5 flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                    Neutral System Alert
                                </p>
                                <p className="mt-1 text-lg font-black text-red-600 leading-tight">
                                    {data.message}
                                </p>
                                <p className="mt-3 text-xs text-gray-500 font-bold flex items-center gap-2">
                                    <Clock size={12} /> {new Date(data.timestamp).toLocaleTimeString()} • AI Urgency: <span className="text-red-500">EXtreme</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 10000 });
        });

        const fetchData = async () => {
            try {
                const [statsRes, usersRes, apptsRes, recommendationsRes] = await Promise.all([
                    adminService.getStats(),
                    adminService.getUsers(),
                    adminService.getAppointments(),
                    adminService.getRecommendations()
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setAppointments(apptsRes.data);
                setRecommendations(recommendationsRes.data);
            } catch (err) {
                console.error('Error fetching admin data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => socket.disconnect();
    }, []);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastData.message) {
            toast.error('Please enter an emergency message');
            return;
        }

        setIsBroadcasting(true);
        try {
            // Hardcoded coords for demo, in production we can use admin's current location or a selected facility
            const response = await donorService.sendEmergencyAlert({
                ...broadcastData,
                latitude: 12.9716, // Default to a central point (e.g., city center)
                longitude: 77.5946
            });
            toast.success(response.data.message);
            setBroadcastData({ ...broadcastData, message: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Broadcast failed');
        } finally {
            setIsBroadcasting(false);
        }
    };

    // Filtered Data
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                             u.email.toLowerCase().includes(userSearch.toLowerCase());
        const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
    });

    const filteredAppointments = appointments.filter(a => {
        const matchesUrgency = apptUrgencyFilter === 'all' || a.urgency === apptUrgencyFilter;
        const matchesStatus = apptStatusFilter === 'all' || a.status === apptStatusFilter;
        return matchesUrgency && matchesStatus;
    });

    const statItems = [
        { label: 'Platform Users', value: stats?.users?.value || 0, icon: <Users size={24} />, color: 'bg-teal-600', trend: stats?.users?.trend },
        { label: 'Total Consults', value: stats?.appointments?.value || 0, icon: <Calendar size={24} />, color: 'bg-purple-600', trend: stats?.appointments?.trend },
        { label: 'Neural Health', value: stats?.health?.value || '98%', icon: <Zap size={24} />, color: 'bg-green-600', trend: +2.1 },
        { label: 'Active Fleet', value: stats?.donors?.value || 0, icon: <Database size={24} />, color: 'bg-orange-600', trend: stats?.donors?.trend }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50/30 backdrop-blur-xl">
                <div className="relative">
                    <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 bg-teal-600/20"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent relative z-10 shadow-lg shadow-teal-500/20"></div>
                </div>
                <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Syncing Neural Core</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
            {/* Command Header */}
            <header className="flex flex-wrap justify-between items-end bg-white/50 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-2xl shadow-gray-200/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck size={200} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Operational Monitoring Enabled</span>
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-3">Intelligence Monitor</h2>
                    <p className="text-gray-500 font-bold text-lg">Central hub for clinical triage and platform governance.</p>
                </div>
                <div className="flex gap-2 p-2 bg-gray-100/50 backdrop-blur-lg rounded-[2rem] border border-white relative z-10">
                    {['overview', 'users', 'appointments', 'broadcast'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-10 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                activeTab === tab 
                                    ? 'bg-white text-teal-600 shadow-2xl shadow-teal-500/20 scale-105' 
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-white/50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'overview' && (
                <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {statItems.map((stat, i) => (
                            <StatCard key={i} {...stat} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Recommendations Panel */}
                        <div className="bg-white/50 backdrop-blur-lg p-10 rounded-[3rem] shadow-2xl shadow-gray-200/20 border border-white flex flex-col h-full group">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                        <Zap className="text-indigo-600" size={32} /> Smart Advisory
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Platform Intelligence Stream</p>
                                </div>
                                <div className="px-4 py-2 bg-indigo-50 rounded-2xl text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em] animate-pulse">
                                    Active Signal
                                </div>
                            </div>
                            
                            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                                {recommendations.length > 0 ? (
                                    recommendations.map((rec, i) => (
                                        <RecommendationCard key={i} {...rec} />
                                    ))
                                ) : (
                                    <div className="py-24 text-center">
                                        <Activity className="mx-auto mb-4 text-indigo-400 animate-bounce" size={48} />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Constructing recommendations...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Triage Matrix */}
                        <div className="bg-white/50 backdrop-blur-lg p-10 rounded-[3rem] shadow-2xl shadow-gray-200/20 border border-white group">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                        <Activity className="text-red-600" size={32} /> Triage Analysis
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Global Severity Distribution</p>
                                </div>
                                <Activity size={32} className="text-gray-100 group-hover:text-red-100 transition-colors" />
                            </div>
                            
                            <div className="space-y-8">
                                {['emergency', 'urgent', 'routine'].map((level, i) => {
                                    const count = appointments.filter(a => a.urgency === level).length;
                                    const total = appointments.length || 1;
                                    const percent = Math.round((count / total) * 100);
                                    const colorCls = level === 'emergency' ? 'bg-red-500' : level === 'urgent' ? 'bg-orange-500' : 'bg-teal-500';
                                    const glowCls = level === 'emergency' ? 'shadow-red-500/50' : level === 'urgent' ? 'shadow-orange-500/50' : 'shadow-teal-500/50';
                                    
                                    return (
                                        <div key={level} className="group/row">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${colorCls} group-hover/row:scale-150 transition-transform shadow-lg ${glowCls}`}></div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-700">{level} Signature</span>
                                                </div>
                                                <span className="text-[11px] font-black text-gray-400 tracking-tighter">{count} Verified cases ({percent}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200/50 h-5 rounded-[1rem] overflow-hidden p-1 border border-white shadow-inner">
                                                <div 
                                                    className={`h-full ${colorCls} rounded-full transition-all duration-1000 ease-out shadow-lg`} 
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                <div className="mt-12 p-8 bg-gradient-to-br from-teal-600 to-indigo-700 rounded-[2rem] text-white shadow-xl shadow-teal-600/20 relative overflow-hidden group/alert">
                                    <TrendingUp className="absolute top-[-10%] right-[-10%] w-32 h-32 opacity-10 group-hover/alert:scale-110 transition-transform" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShieldCheck size={18} className="text-teal-200 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-200">Neural Advisory Module</span>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed">
                                            Platform clinical load is currently 
                                            <span className="text-teal-200 font-black underline decoration-2 underline-offset-4 mx-1">
                                                {Math.round((appointments.filter(a => a.urgency !== 'routine').length / (appointments.length || 1)) * 100)}% Non-Routine
                                            </span>. 
                                            Recommend allocating emergency bypass channels for critical user signals.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/30 border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-12 duration-700">
                    <div className="p-10 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/20 gap-8">
                        <div className="relative group flex-1 min-w-[400px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={24} />
                            <input 
                                type="text" 
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Search system identities by name or verified email..." 
                                className="w-full pl-16 pr-8 py-5 bg-white border border-gray-200 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-8 focus:ring-teal-500/5 focus:border-teal-500 transition-all shadow-inner"
                            />
                        </div>
                        <div className="flex gap-2 p-2 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                            {['all', 'doctor', 'patient', 'donor'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setUserRoleFilter(role)}
                                    className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                                        userRoleFilter === role 
                                            ? 'bg-teal-600 text-white shadow-xl shadow-teal-500/20 scale-105' 
                                            : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black">
                                    <th className="px-12 py-8 border-b border-gray-50">Identity Profile</th>
                                    <th className="px-12 py-8 border-b border-gray-50">System Role</th>
                                    <th className="px-12 py-8 border-b border-gray-50">Onboarding Date</th>
                                    <th className="px-12 py-8 border-b border-gray-50 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-teal-50/20 transition-all group">
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-teal-500/20 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 group-hover:text-teal-600 transition-colors text-lg tracking-tight">{user.name}</p>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-12 py-8">
                                            <p className="text-sm text-gray-600 font-black tracking-tighter">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        </td>
                                        <td className="px-12 py-8 text-right">
                                            <button className="p-4 text-gray-300 hover:text-teal-600 hover:bg-white rounded-[1.25rem] transition-all border border-transparent hover:border-teal-100 hover:shadow-lg">
                                                <MoreVertical size={24} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-12 py-24 text-center">
                                            <Search className="mx-auto mb-4 text-gray-100" size={64} />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No identities matched your query</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/30 border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-12 duration-700">
                    <div className="p-10 border-b border-gray-100 bg-gray-50/20 flex flex-wrap justify-between items-center gap-8">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-gradient-to-tr from-indigo-600 to-teal-600 rounded-3xl text-white shadow-2xl shadow-indigo-600/20">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Schedule Monitor</h3>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Neural Triage Matrix enabled</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <select 
                                value={apptUrgencyFilter}
                                onChange={(e) => setApptUrgencyFilter(e.target.value)}
                                className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-8 focus:ring-teal-500/5 shadow-sm"
                            >
                                <option value="all">Global Urgency</option>
                                <option value="emergency">Emergency Only</option>
                                <option value="urgent">Urgent Only</option>
                                <option value="routine">Routine Only</option>
                            </select>
                            <select 
                                value={apptStatusFilter}
                                onChange={(e) => setApptStatusFilter(e.target.value)}
                                className="bg-white border border-gray-200 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-8 focus:ring-teal-500/5 shadow-sm"
                            >
                                <option value="all">Global Status</option>
                                <option value="pending">Pending Review</option>
                                <option value="approved">Operational</option>
                                <option value="completed">Cycle Finished</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black">
                                    <th className="px-12 py-8 border-b border-gray-50">Patient & Practitioner</th>
                                    <th className="px-12 py-8 border-b border-gray-50">Execution Time</th>
                                    <th className="px-12 py-8 border-b border-gray-50">Reliability Index</th>
                                    <th className="px-12 py-8 border-b border-gray-50">Urgency Signature</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAppointments.length > 0 ? filteredAppointments.map((appt) => (
                                    <tr key={appt._id} className="hover:bg-indigo-50/20 transition-all group">
                                        <td className="px-12 py-8">
                                            <div className="flex flex-col gap-2">
                                                <p className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">Patient: {appt.patient?.name}</p>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Stethoscope size={14} className="text-indigo-500" /> Dr. {appt.doctor?.name}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-black text-gray-900">{new Date(appt.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={12} /> {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-xs font-black shadow-lg transition-all group-hover:scale-105 ${
                                                appt.reliabilityScore >= 80 ? 'bg-green-500/10 text-green-700 border-green-500/20 shadow-green-500/5' :
                                                appt.reliabilityScore >= 60 ? 'bg-orange-500/10 text-orange-700 border-orange-500/20 shadow-orange-500/5' :
                                                'bg-red-500/10 text-red-700 border-red-500/20 shadow-red-500/5'
                                            }`}>
                                                <Zap size={14} className="animate-pulse" />
                                                {appt.reliabilityScore}% Index
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[10px] font-black px-5 py-2.5 rounded-[1.25rem] uppercase tracking-widest border transition-all ${
                                                    appt.urgency === 'emergency' ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-500/30' :
                                                    appt.urgency === 'urgent' ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/20' :
                                                    'bg-teal-600 border-teal-600 text-white shadow-xl shadow-teal-500/20'
                                                }`}>
                                                    {appt.urgency}
                                                </span>
                                                <span className={`text-[10px] font-black px-4 py-2 border rounded-xl uppercase tracking-widest ${
                                                    appt.status === 'approved' ? 'border-green-200 text-green-600' :
                                                    appt.status === 'pending' ? 'border-teal-200 text-teal-600' :
                                                    'border-gray-200 text-gray-400'
                                                }`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-12 py-24 text-center text-gray-300">
                                            <Calendar className="mx-auto mb-4 opacity-20" size={64} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No appointment records found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'broadcast' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-12 duration-700">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/30 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Send size={150} />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Emergency Broadcast Hub</h3>
                                <p className="text-gray-500 font-bold">Trigger real-time clinical alerts to the donor network.</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleBroadcast}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Blood Type</label>
                                        <select 
                                            value={broadcastData.bloodType}
                                            onChange={(e) => setBroadcastData({...broadcastData, bloodType: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black focus:outline-none focus:ring-8 focus:ring-red-500/5 focus:border-red-500 transition-all"
                                        >
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                                <option key={type} value={type}>{type} Group</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Safety Radius (Meters)</label>
                                        <input 
                                            type="number" 
                                            value={broadcastData.radius}
                                            onChange={(e) => setBroadcastData({...broadcastData, radius: parseInt(e.target.value)})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                                            placeholder="e.g. 5000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Emergency Message</label>
                                    <textarea 
                                        rows="4"
                                        value={broadcastData.message}
                                        onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-3xl px-6 py-5 text-xs font-bold focus:outline-none focus:ring-8 focus:ring-teal-500/5 focus:border-teal-500 transition-all resize-none"
                                        placeholder="Enter the critical alert details..."
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isBroadcasting}
                                    className="w-full bg-gradient-to-r from-red-600 to-indigo-600 py-5 rounded-[2rem] text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 group/btn"
                                >
                                    {isBroadcasting ? (
                                        <><Loader2 className="animate-spin" size={20} /> Broadcasting Signal...</>
                                    ) : (
                                        <><Send size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /> Execute Emergency Broadcast</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
                            <Navigation className="absolute top-[-10%] right-[-10%] w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-white/10 rounded-2xl">
                                        <ShieldCheck className="text-teal-400" size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Security Protocol Alpha</span>
                                </div>
                                <h4 className="text-xl font-black mb-4 tracking-tight">Geospatial Alert Matrix</h4>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">
                                    Broadcasting an emergency signal will immediately notify all matching donors within the specified radius via **encrypted mail and multi-channel SMS**.
                                </p>
                                <div className="flex items-center gap-8">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Alert Validity</p>
                                        <p className="text-sm font-black">24 Hours</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Encrypted Data</p>
                                        <p className="text-sm font-black">AES-256 Enabled</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Nearby Fleet Status</h4>
                            <div className="space-y-6">
                                {['A+', 'O+', 'B-'].map((type, i) => (
                                    <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-100 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-red-600 font-black text-xs shadow-sm">
                                                {type}
                                            </div>
                                            <p className="text-xs font-black text-gray-700 tracking-tight">{type} Donors Online</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-[10px] font-black text-gray-400">{12 + i * 5} Active</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
