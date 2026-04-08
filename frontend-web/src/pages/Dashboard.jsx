import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';
import { appointmentService } from '../services/api';
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
    XCircle
} from 'lucide-react';
import BloodDonation from './BloodDonation';
import Appointments from './Appointments';
import Profile from './Profile';
import MilkDonation from './MilkDonation';
import AdminDashboard from './AdminDashboard';

const QuickCard = ({ icon, title, desc, to, color }) => (
    <Link to={to} className={`group p-6 rounded-2xl border ${color} hover:shadow-md transition-all flex flex-col gap-4`}>
        <div>{icon}</div>
        <div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
        </div>
        <div className="flex items-center text-blue-600 text-sm font-semibold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        pending: { label: 'Pending', cls: 'bg-blue-100 text-blue-700' },
        approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
        rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
        completed: { label: 'Completed', cls: 'bg-purple-100 text-purple-700' },
        cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
    };

    const cards = {
        patient: [
            { icon: <Calendar size={28} className="text-blue-600" />, title: 'My Appointments', desc: 'View and book appointments with AI reliability scoring', to: 'appointments', color: 'border-blue-100 bg-blue-50/50' },
            { icon: <Droplet size={28} className="text-red-500" />, title: 'Blood Donation', desc: 'Find nearby donors and request blood', to: 'blood-donation', color: 'border-red-100 bg-red-50/50' },
            { icon: <Baby size={28} className="text-pink-500" />, title: 'Milk Donation', desc: 'Priority-based human milk donor network', to: 'milk-donation', color: 'border-pink-100 bg-pink-50/50' },
            { icon: <UserIcon size={28} className="text-indigo-500" />, title: 'My Profile', desc: 'View and update your account details', to: 'profile', color: 'border-indigo-100 bg-indigo-50/50' },
        ],
        doctor: [
            { icon: <Calendar size={28} className="text-blue-600" />, title: 'My Schedule', desc: 'See all upcoming patient appointments', to: 'appointments', color: 'border-blue-100 bg-blue-50/50' },
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
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        {roleIcon[user?.role] || <UserIcon size={40} className="text-white" />}
                    </div>
                    <div>
                        <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">{greeting}</p>
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
                <p className="text-blue-100 max-w-md">
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
                            <p className="text-3xl font-bold text-blue-600 mt-1">{appointments.filter(a => a.status === 'pending').length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">High Risk Alerts</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{appointments.filter(a => a.reliabilityScore < 60).length}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-700">Upcoming Schedule</h3>
                        <Link to="appointments" className="text-sm text-blue-600 hover:underline font-semibold">View All →</Link>
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
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-blue-400">{new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                        <span className="text-lg font-black text-blue-700">{new Date(appt.date).getDate()}</span>
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
                                            appt.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
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
                        <Link to="appointments" className="text-sm text-blue-600 hover:underline font-semibold">View All →</Link>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                            <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No appointments yet. <Link to="appointments" className="text-blue-500 font-semibold underline">Book one now</Link></p>
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
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-blue-400">{new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                                        <span className="text-lg font-black text-blue-700">{new Date(appt.date).getDate()}</span>
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
        { label: 'Blood Donation', icon: <Droplet size={20} />, path: 'blood-donation', roles: ['patient', 'donor', 'admin'] },
        { label: 'Milk Bank', icon: <Baby size={20} />, path: 'milk-donation', roles: ['patient', 'donor', 'admin'] },
        { label: 'My Profile', icon: <UserIcon size={20} />, path: 'profile', roles: ['patient', 'doctor', 'donor', 'admin'] },
    ];

    return (
        <div className="w-72 bg-[#0a0a0a] h-screen border-r border-white/5 flex flex-col text-gray-400 relative z-20">
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tighter">HealthHub<span className="text-blue-500">AI</span></h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Live</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 mb-4">Main Menu</p>
                {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.path === ''}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3.5 rounded-2xl transition-all text-sm font-bold group ${
                                isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/10'
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
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 flex items-center justify-center text-blue-500 font-black border border-blue-500/20">
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
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                            <Bell size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>
                <main className="p-8">
                    <Routes>
                        <Route path="/" element={user?.role === 'admin' ? <AdminDashboard /> : <HomeView user={user} />} />
                        <Route path="appointments" element={<Appointments />} />
                        <Route path="blood-donation" element={<BloodDonation />} />
                        <Route path="milk-donation" element={<MilkDonation />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
