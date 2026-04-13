import React, { useState } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import { Stethoscope, ShieldCheck } from 'lucide-react';

export default function AdminAddDoctor() {
    const [addingDoctor, setAddingDoctor] = useState(false);
    const [newDoctor, setNewDoctor] = useState({ name: '', email: '', password: '', specialization: '', experience: 0 });

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setAddingDoctor(true);
        try {
            await adminService.addDoctor(newDoctor);
            toast.success('Doctor successfully added to platform!');
            setNewDoctor({ name: '', email: '', password: '', specialization: '', experience: 0 });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add doctor');
        } finally {
            setAddingDoctor(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/squares.png')] opacity-10"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner border border-white/20">
                        <Stethoscope size={40} className="text-indigo-100" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight mb-1">Onboard Doctor</h2>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-400" />
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Admin Authorization Required</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddDoctor} className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/30 border border-gray-100 space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block mb-2">Full Name</label>
                    <input type="text" required value={newDoctor.name} onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="Dr. John Doe" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block mb-2">Email Address</label>
                    <input type="email" required value={newDoctor.email} onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="doctor@healthhub.ai" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block mb-2">Initial Password</label>
                    <input type="text" required value={newDoctor.password} onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="Secure password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block mb-2">Specialization</label>
                        <input type="text" required value={newDoctor.specialization} onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="e.g. Cardiology" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block mb-2">Experience (Years)</label>
                        <input type="number" min="0" required value={newDoctor.experience} onChange={(e) => setNewDoctor({...newDoctor, experience: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                    </div>
                </div>
                <div className="pt-6">
                    <button type="submit" disabled={addingDoctor} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50">
                        {addingDoctor ? 'Onboarding...' : 'Create Doctor Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}
