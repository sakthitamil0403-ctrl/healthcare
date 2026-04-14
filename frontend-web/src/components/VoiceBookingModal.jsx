import React, { useState, useEffect } from 'react';
import { Mic, X, Globe, Languages, CheckCircle, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { appointmentService } from '../services/api';

/**
 * WAV Encoder Utility
 * Ensures browser MediaRecorder (webm) is converted to a clinical-standard WAV format
 */
function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
}

export default function VoiceBookingModal({ isOpen, onClose, onBookingSuccess }) {
    const [status, setStatus] = useState('idle'); // idle, recording, processing, success, error
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [selectedLang, setSelectedLang] = useState('en-US'); 
    const [error, setError] = useState('');
    const [voiceResult, setVoiceResult] = useState(null);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Clean up recorder on close
    useEffect(() => {
        if (!isOpen) {
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
            }
            setStatus('idle');
            setVoiceResult(null);
            setError('');
        }
    }, [isOpen]);

    const startRecording = async () => {
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setStatus('processing');
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    const wavBlob = encodeWAV(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
                    await handleVoiceUpload(wavBlob);
                } catch (e) {
                    console.error("Audio conversion failed, trying fallback", e);
                    await handleVoiceUpload(blob);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            setStatus('recording');
        } catch (err) {
            setError('Microphone access denied. Please allow microphone permissions.');
            setStatus('error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleVoiceUpload = async (blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', blob, 'booking.wav');
            formData.append('language', selectedLang);

            const { data } = await appointmentService.bookVoiceAppointment(formData);
            setVoiceResult(data);
            setStatus('success');
            if (onBookingSuccess) onBookingSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || 'AI Voice Processing failed. Please try again.');
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className={`bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col transition-transform duration-300 scale-100`}>
                {/* Premium Header */}
                <div className="bg-gradient-to-br from-indigo-700 to-teal-700 p-8 pb-12 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/squares.png')] opacity-10"></div>
                    <div className="flex justify-between items-start text-white relative z-10">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">HealthHub Voice AI</h3>
                            <p className="text-teal-50 text-xs mt-1 font-semibold tracking-wider uppercase opacity-80">Neural Clinical Assistant</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 -mt-6 bg-white rounded-t-3xl relative z-20 flex-1 flex flex-col min-h-[400px]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle size={20} className="shrink-0 text-red-500" /> 
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    {status !== 'success' ? (
                        <div className="flex flex-col items-center text-center flex-1">
                            {/* Language Toggle */}
                            <div className="flex bg-gray-50 border border-gray-100 p-1.5 rounded-2xl mb-10 w-full max-w-[260px] shadow-sm">
                                <button 
                                    onClick={() => setSelectedLang('en-US')}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${selectedLang === 'en-US' ? 'bg-white shadow-md text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Globe size={13} /> ENGLISH
                                </button>
                                <button 
                                    onClick={() => setSelectedLang('ta-IN')}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${selectedLang === 'ta-IN' ? 'bg-white shadow-md text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Languages size={13} /> தமிழ்
                                </button>
                            </div>

                            {/* Center Visual */}
                            <div className="relative mb-8 mt-4">
                                {isRecording && (
                                    <>
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150 duration-1000" />
                                        <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping scale-[2] duration-1000 delay-150" />
                                    </>
                                )}
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={status === 'processing'}
                                    className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${
                                        isRecording 
                                            ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110' 
                                            : 'bg-gradient-to-br from-teal-600 to-indigo-700 hover:scale-105 shadow-teal-500/40'
                                    } disabled:opacity-50 group`}
                                >
                                    {status === 'processing' ? (
                                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                                    ) : (
                                        <>
                                            <Mic size={48} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] text-white/90 font-black mt-2 uppercase tracking-widest">
                                                {isRecording ? 'Stop' : 'Speak'}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <p className={`text-xl font-black ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                                    {isRecording ? `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')} Recording...` : 
                                     status === 'processing' ? 'Processing Signal...' : 'Ready to listen'}
                                </p>
                                <p className="text-sm text-gray-400 max-w-[260px] leading-relaxed mx-auto font-medium">
                                    {isRecording 
                                        ? "Declare your symptoms and preferred time clearly." 
                                        : "Tap the microphone to book your appointment using natural voice."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300 flex-1">
                            <div className="bg-green-50/50 border border-green-100 rounded-[2rem] p-6 text-center shadow-inner">
                                <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-green-500/20">
                                    <CheckCircle size={32} />
                                </div>
                                <h4 className="text-xl font-black text-green-900 leading-tight">Identity & Schedule Locked</h4>
                                <p className="text-sm text-green-600/80 mt-1 font-bold">Successfully processed by AI Core</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity size={14} className="text-indigo-400" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neural Transcription</p>
                                    </div>
                                    <p className="text-sm text-gray-800 font-bold italic leading-relaxed">"{voiceResult.transcript}"</p>
                                    {voiceResult.translated && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">English Mapping</p>
                                            <p className="text-sm text-indigo-800 font-bold italic opacity-80">"{voiceResult.translated}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100">
                                        <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Practitioner</p>
                                        <p className="font-black text-teal-900 truncate">Dr. {voiceResult.appointment?.doctor?.name || 'Assigned'}</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Schedule</p>
                                        <p className="font-black text-indigo-900 truncate">
                                            {new Date(voiceResult.appointment?.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(voiceResult.appointment?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 shadow-2xl transition-all mt-auto"
                            >
                                Dismiss Hub
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
