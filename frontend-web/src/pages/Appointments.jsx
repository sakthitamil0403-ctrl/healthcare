import React, { useEffect, useState } from 'react';
import { appointmentService, doctorService } from '../services/api';
import useStore from '../store/useStore';
import {
    Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, Activity,
    UserCheck, ChevronDown, RefreshCw, Trash2, Stethoscope, ShieldAlert, ShieldCheck,
    User, Heart, Thermometer, ClipboardList, Mic, Languages, X, Globe
} from 'lucide-react';
import VoiceBookingModal from '../components/VoiceBookingModal';

const STATUS_CONFIG = {
    pending:   { label: 'Pending',   className: 'bg-teal-100 text-teal-700',   icon: <Clock size={11} /> },
    approved:  { label: 'Approved',  className: 'bg-green-100 text-green-700', icon: <CheckCircle size={11} /> },
    rejected:  { label: 'Rejected',  className: 'bg-red-100 text-red-700',     icon: <XCircle size={11} /> },
    completed: { label: 'Completed', className: 'bg-purple-100 text-purple-700', icon: <CheckCircle size={11} /> },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500',   icon: <XCircle size={11} /> },
    missed:    { label: 'Missed',    className: 'bg-amber-100 text-amber-700', icon: <AlertCircle size={11} /> },
};


const URGENCY_CONFIG = {
    emergency: { label: 'Emergency', className: 'bg-red-600 text-white border-red-700 animate-pulse', icon: <ShieldAlert size={12} /> },
    urgent:    { label: 'Urgent',    className: 'bg-orange-500 text-white border-orange-600', icon: <Activity size={12} /> },
    routine:   { label: 'Routine',   className: 'bg-teal-50 text-teal-600 border-teal-100', icon: <ClipboardList size={12} /> },
};

const UrgencyBadge = ({ urgency }) => {
    const cfg = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.routine;
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 border shadow-sm ${cfg.className}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

const SeverityBadge = ({ urgency }) => {
    const configs = {
        emergency: { label: 'Emergency', className: 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-200 animate-pulse', icon: <Activity size={12} /> },
        urgent:    { label: 'Urgent',    className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <AlertCircle size={12} /> },
        routine:   { label: 'Routine',   className: 'bg-teal-50 text-teal-600 border-teal-100', icon: <CheckCircle size={12} /> }
    };
    const cfg = configs[urgency] || configs.routine;
    return (
        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${cfg.className}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

const RiskBadge = ({ riskLevel, score, urgency }) => {
    const isHigh = riskLevel === 'high' || score < 60 || urgency === 'emergency';
    return (
        <div className="flex items-center gap-3">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-xl border text-sm font-bold gap-1.5 ${
                score >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
                score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                'text-red-600 bg-red-50 border-red-200'
            }`}>
                <Activity size={13} />
                {score ?? '--'}%
            </div>
            <SeverityBadge urgency={urgency} />
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tight ${
                isHigh ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
                {isHigh ? <ShieldAlert size={11} /> : <ShieldCheck size={11} />}
                {isHigh ? 'High Opt-in' : 'Low Opt-in'}
            </span>
        </div>
    );
};

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [rescheduleAppt, setRescheduleAppt] = useState(null);
    const [error, setError] = useState('');
    const [newAppt, setNewAppt] = useState({ doctor: '', date: '', time: '', reason: '' });
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
    const [activeTab, setActiveTab] = useState('upcoming');
    const [confirmCancel, setConfirmCancel] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null); // Patient data for modal
    
    const [showVoiceModal, setShowVoiceModal] = useState(false);

    const user = useStore(state => state.user);

    const fetchAppointments = async () => {
        try {
            const { data } = await appointmentService.getAppointments();
            setAppointments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        if (user?.role === 'patient' || user?.role === 'admin') {
            doctorService.getDoctors()
                .then(({ data }) => setDoctors(data))
                .catch(console.error);
        }
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        setError('');
        if (!newAppt.doctor) { setError('Please select a doctor.'); return; }
        if (!newAppt.date) { setError('Please pick a date.'); return; }
        setBooking(true);
        try {
            const timeStr = newAppt.time || '09:00';
            const dateStr = `${newAppt.date}T${timeStr}`;
            const dateObj = new Date(dateStr);
            
            if (isNaN(dateObj.getTime())) {
                throw new Error('Invalid date or time selected.');
            }

            await appointmentService.bookAppointment({ 
                doctor: newAppt.doctor, 
                date: dateObj.toISOString(), 
                reason: newAppt.reason 
            });
            setShowModal(false);
            setNewAppt({ doctor: '', date: '', time: '', reason: '' });
            await fetchAppointments();
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Booking failed.');
        } finally {
            setBooking(false);
        }
    };

    const handleCancel = async (id) => {
        try {
            await appointmentService.cancelAppointment(id);
            setConfirmCancel(null);
            await fetchAppointments();
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to cancel');
        }
    };

    const handleReschedule = async (e) => {
        e.preventDefault();
        if (!rescheduleData.date) { setError('Please pick a date.'); return; }
        try {
            await appointmentService.rescheduleAppointment(rescheduleAppt._id, rescheduleData);
            setRescheduleAppt(null);
            setRescheduleData({ date: '', time: '' });
            await fetchAppointments();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to reschedule');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await appointmentService.updateAppointmentStatus(id, status);
            await fetchAppointments();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status));
    const past = appointments.filter(a => ['completed', 'cancelled', 'rejected', 'missed'].includes(a.status));
    const displayed = activeTab === 'upcoming' ? upcoming : past;

    const selectedDoctor = doctors.find(d => d.user?._id === newAppt.doctor);


    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
                    <p className="text-gray-500 text-sm mt-1">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} total</p>
                </div>
                {user?.role === 'patient' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowVoiceModal(true)}
                            className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-200 flex items-center font-semibold"
                        >
                            <Mic size={18} className="mr-2" /> Voice Book
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-all shadow-lg flex items-center font-semibold"
                        >
                            <Plus size={18} className="mr-2" /> Book New
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100 pb-0">
                {['upcoming', 'past'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 text-sm font-semibold capitalize rounded-t-xl transition-all ${
                            activeTab === tab
                                ? 'bg-white border border-b-white border-gray-100 text-teal-600 -mb-px'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab} ({tab === 'upcoming' ? upcoming.length : past.length})
                    </button>
                ))}
            </div>

            {/* Appointment Cards */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
                        <div className="w-8 h-8 border-4 border-teal-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span>Loading appointments...</span>
                    </div>
                ) : displayed.length > 0 ? (
                    displayed.map(appt => {
                        const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                        const canCancel = user?.role === 'patient' && ['pending', 'approved'].includes(appt.status);
                        const canReschedule = user?.role === 'patient' && ['pending'].includes(appt.status);
                        const isDoctorView = user?.role === 'doctor';
                        const isAdminView = user?.role === 'admin';
                        const isManagementView = isDoctorView || isAdminView;
                        
                        const personName = isDoctorView ? appt.patient?.name : appt.doctor?.name;
                        const personEmail = isDoctorView ? appt.patient?.email : appt.doctor?.email;
                        
                        return (
                            <div key={appt._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Date / Time */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-teal-50 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-teal-400 uppercase">
                                                {new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-black text-teal-700">
                                                {new Date(appt.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                                                <Clock size={12} />
                                                {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Doctor / Patient */}
                                    <div className="flex items-center gap-3 flex-[1.5] min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                            {isAdminView ? <ShieldCheck size={20} /> : (personName?.charAt(0)?.toUpperCase() || '?')}
                                        </div>
                                        <div className="min-w-0">
                                            {isAdminView ? (
                                                <>
                                                    <p className="font-semibold text-gray-800 truncate leading-tight">Patient: {appt.patient?.name}</p>
                                                    <p className="text-xs text-indigo-500 font-medium truncate mt-0.5">Doctor: {appt.doctor?.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-semibold text-gray-800 truncate">{personName || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{personEmail || ''}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${statusCfg.className}`}>
                                            {statusCfg.icon} {statusCfg.label}
                                        </span>
                                    </div>

                                    {/* AI Reliability & Triage */}
                                    <div className="shrink-0">
                                        <RiskBadge riskLevel={appt.riskLevel} score={appt.reliabilityScore} urgency={appt.urgency} />
                                    </div>
                                </div>

                                {/* Reason for visit */}
                                {appt.reason && (
                                    <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
                                        <span className="font-semibold text-gray-700">Reason: </span>{appt.reason}
                                    </p>
                                )}

                                {appt.aiRecommendation && (
                                    <div className="mt-2 text-[11px] font-bold text-teal-700 bg-teal-50/50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-teal-100/50">
                                        <Activity size={14} className="text-teal-500" />
                                        <span className="text-teal-400 uppercase tracking-wider">AI Recommendation:</span>
                                        <span className="italic">{appt.aiRecommendation}</span>
                                        {appt.priorityScore > 0 && (
                                            <span className="ml-auto bg-teal-600 text-white px-2 py-0.5 rounded-lg">Priority: {appt.priorityScore}</span>
                                        )}
                                    </div>
                                )}

                                {/* Actions Row */}
                                {(canCancel || canReschedule || isManagementView || (user?.role === 'patient' && appt.status === 'missed')) && (
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2 items-center">
                                        {canReschedule && (
                                            <button
                                                onClick={() => { setRescheduleAppt(appt); setError(''); }}
                                                className="flex items-center gap-1.5 text-sm px-4 py-2 border border-teal-200 text-teal-600 rounded-xl hover:bg-teal-50 font-semibold transition-colors"
                                            >
                                                <RefreshCw size={14} /> Reschedule
                                            </button>
                                        )}
                                        {canCancel && (
                                            confirmCancel === appt._id ? (
                                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                                                    <span className="text-sm text-red-700 font-semibold">Cancel this appointment?</span>
                                                    <button
                                                        onClick={() => handleCancel(appt._id)}
                                                        className="text-sm px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                                                    >Yes</button>
                                                    <button
                                                        onClick={() => setConfirmCancel(null)}
                                                        className="text-sm px-3 py-1 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold"
                                                    >No</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmCancel(appt._id)}
                                                    className="flex items-center gap-1.5 text-sm px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 font-semibold transition-colors"
                                                >
                                                    <Trash2 size={14} /> Cancel
                                                </button>
                                            )
                                        )}
                                        {isManagementView && appt.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusChange(appt._id, 'approved')}
                                                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold">
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button onClick={() => handleStatusChange(appt._id, 'rejected')}
                                                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold">
                                                    <XCircle size={14} /> Reject
                                                </button>
                                                <button 
                                                    onClick={() => setSelectedPatient(appt.patientClinical || { user: appt.patient })}
                                                    className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                                                >
                                                    <User size={14} /> View Profile
                                                </button>
                                            </>
                                        )}
                                        {isManagementView && appt.status === 'approved' && (
                                            <>
                                                <button onClick={() => handleStatusChange(appt._id, 'completed')}
                                                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold">
                                                    <CheckCircle size={14} /> Mark Completed
                                                </button>
                                                <button onClick={() => handleStatusChange(appt._id, 'missed')}
                                                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold">
                                                    <AlertCircle size={14} /> Mark Missed
                                                </button>

                                                <button 
                                                    onClick={() => setSelectedPatient(appt.patientClinical || { user: appt.patient })}
                                                    className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                                                >
                                                    <User size={14} /> View Profile
                                                </button>
                                            </>
                                        )}
                                        {isManagementView && ['completed', 'rejected', 'cancelled', 'missed'].includes(appt.status) && (
                                            <button 
                                                onClick={() => setSelectedPatient(appt.patientClinical || { user: appt.patient })}
                                                className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                                            >
                                                <User size={14} /> View Historical Profile
                                            </button>
                                        )}
                                        {user?.role === 'patient' && appt.status === 'missed' && (
                                            <button onClick={() => { setNewAppt({ ...newAppt, doctor: appt.doctor?._id }); setShowModal(true); }}
                                                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-100 transition-all">
                                                <RefreshCw size={14} /> Rebook Visit
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center py-16 gap-3 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Calendar size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">
                            {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
                        </p>
                        {user?.role === 'patient' && activeTab === 'upcoming' && (
                            <button onClick={() => setShowModal(true)} className="text-teal-600 font-semibold text-sm hover:underline">
                                Book your first appointment →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center">
                                <UserCheck size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Book an Appointment</h3>
                                <p className="text-sm text-gray-500">AI will calculate reliability score</p>
                            </div>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <form onSubmit={handleBook} className="space-y-5">
                            {/* Doctor Selection — Card Grid */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Doctor</label>
                                {doctors.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                                        <Stethoscope size={24} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No doctors available right now</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
                                        {doctors.map(doc => {
                                            const isSelected = newAppt.doctor === doc.user?._id;
                                            const initials = doc.user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
                                            const available = doc.availability !== false;
                                            return (
                                                <button
                                                    key={doc._id}
                                                    type="button"
                                                    onClick={() => setNewAppt({ ...newAppt, doctor: doc.user?._id })}
                                                    className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-teal-500 bg-teal-50 shadow-md'
                                                            : 'border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50/40'
                                                    } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={!available}
                                                >
                                                    {/* Avatar */}
                                                    <div className="shrink-0 relative">
                                                        {doc.user?.image || doc.image ? (
                                                            <img src={doc.user?.image || doc.image} alt={doc.user?.name} className="w-14 h-14 rounded-2xl object-cover" />
                                                        ) : (
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${
                                                                isSelected ? 'bg-teal-600 text-white' : 'bg-gradient-to-br from-teal-100 to-indigo-200 text-teal-700'
                                                            }`}>
                                                                {initials}
                                                            </div>
                                                        )}
                                                        {/* Availability dot */}
                                                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                                            available ? 'bg-green-400' : 'bg-gray-300'
                                                        }`} />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-bold text-gray-900 text-sm">{doc.user?.name}</p>
                                                            {isSelected && (
                                                                <span className="text-xs font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">Selected</span>
                                                            )}
                                                        </div>
                                                        <p className={`text-xs font-semibold mt-0.5 ${
                                                            isSelected ? 'text-teal-600' : 'text-indigo-500'
                                                        }`}>
                                                            <Stethoscope size={10} className="inline mr-1" />
                                                            {doc.specialization || 'General Practitioner'}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                            {doc.experience > 0 && (
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                                                    {doc.experience} yr{doc.experience !== 1 ? 's' : ''} exp
                                                                </span>
                                                            )}
                                                            {doc.rating && (
                                                                <span className="text-xs text-yellow-600 font-semibold">★ {doc.rating.toFixed(1)}</span>
                                                            )}
                                                            <span className={`text-xs font-semibold ${
                                                                available ? 'text-green-600' : 'text-gray-400'
                                                            }`}>
                                                                {available ? '● Available' : '● Unavailable'}
                                                            </span>
                                                        </div>
                                                        {doc.bio && (
                                                            <p className="text-xs text-gray-400 mt-1 truncate">{doc.bio}</p>
                                                        )}
                                                    </div>

                                                    {/* Check circle */}
                                                    {isSelected && (
                                                        <CheckCircle size={20} className="text-teal-500 shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {/* Hidden required input for form validation */}
                                <input type="hidden" required value={newAppt.doctor} onChange={() => {}} />
                                {!newAppt.doctor && (
                                    <p className="text-xs text-gray-400 mt-2">Please select a doctor to continue</p>
                                )}
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        value={newAppt.date}
                                        onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        value={newAppt.time}
                                        onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit <span className="text-gray-400 font-normal">(optional)</span></label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g. Routine checkup, chest pain, follow-up..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 resize-none"
                                    value={newAppt.reason}
                                    onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setError(''); }}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={booking}
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {booking ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Booking...</> : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleAppt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                                <RefreshCw size={22} className="text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Reschedule Appointment</h3>
                                <p className="text-sm text-gray-500">Choose a new date and time</p>
                            </div>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <form onSubmit={handleReschedule} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        value={rescheduleData.date}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        value={rescheduleData.time}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setRescheduleAppt(null)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold">
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Patient Profile Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden">
                                    {selectedPatient.user?.image ? (
                                        <img src={selectedPatient.user.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedPatient.user?.name || 'Patient Profile'}</h3>
                                    <p className="text-sm text-gray-500">{selectedPatient.user?.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <XCircle size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Age / Gender</p>
                                <p className="font-bold text-gray-800 flex items-center gap-2">
                                    <User size={14} className="text-indigo-400" />
                                    {selectedPatient.age || '--'} yrs / {selectedPatient.gender || 'Not specified'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Blood Group</p>
                                <p className="font-bold text-red-600 flex items-center gap-2">
                                    <Heart size={14} className="text-red-400" />
                                    {selectedPatient.bloodGroup || '--'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                                    <ClipboardList size={16} className="text-teal-500" /> Medical History
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPatient.medicalHistory?.length > 0 ? (
                                        selectedPatient.medicalHistory.map((h, i) => (
                                            <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold border border-teal-100">
                                                {h}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No medical history recorded.</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 italic flex items-center gap-1">
                                    <Thermometer size={12} /> Privacy Notice: This information is only visible to authorized medical staff.
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedPatient(null)}
                            className="w-full mt-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                        >
                            Close Profile
                        </button>
                    </div>
                </div>
            )}

            <VoiceBookingModal 
                isOpen={showVoiceModal} 
                onClose={() => setShowVoiceModal(false)} 
                onBookingSuccess={fetchAppointments} 
            />
        </div>
    );
}
