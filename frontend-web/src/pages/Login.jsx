import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import useStore from '../store/useStore';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck, HeartPulse, Stethoscope } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const setUser = useStore(state => state.setUser);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await authService.login({ email, password });
            setUser(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side: Branding & Value Prop */}
                <div className="hidden lg:block space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-blue-500/20">
                            <Activity size={40} className="animate-pulse" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">HealthHub<span className="text-blue-500">AI</span></h1>
                    </div>
                    
                    <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                        The future of <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Clinical Intelligence.</span>
                    </h2>
                    
                    <p className="text-gray-400 text-xl max-w-md font-medium leading-relaxed">
                        Experience the next generation of healthcare management with AI-driven triage, predictive analytics, and real-time clinical monitoring.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-8">
                        {[
                            { icon: <ShieldCheck className="text-blue-500" />, label: 'Secure AI' },
                            { icon: <HeartPulse className="text-red-500" />, label: 'Live Triage' },
                            { icon: <Stethoscope className="text-indigo-500" />, label: 'Doctor Sync' },
                            { icon: <Activity className="text-green-500" />, label: 'Predictive' }
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                {feat.icon}
                                <span className="text-sm font-bold text-gray-300">{feat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="flex justify-center lg:justify-end">
                    <div className="w-full max-w-md space-y-8 bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-[3rem] -z-10"></div>
                        
                        <div className="text-center lg:hidden flex flex-col items-center mb-8">
                            <Activity className="text-blue-500 mb-4" size={48} />
                            <h2 className="text-3xl font-black text-white tracking-tight">HealthHub AI</h2>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Welcome Back</h3>
                            <p className="text-gray-400 text-sm mt-2 font-medium">Log in to manage your clinical network.</p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                                    <Activity size={18} /> {error}
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div className="group/input relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="group/input relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                            >
                                {isLoading ? 'Authenticating...' : (
                                    <>
                                        Sign In <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center pt-4">
                            <p className="text-gray-500 text-sm font-medium">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-500 font-bold hover:underline">
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
