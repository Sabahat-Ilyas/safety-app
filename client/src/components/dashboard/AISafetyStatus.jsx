import React, { useState, useEffect } from 'react';
import { Brain, ShieldCheck, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

const AISafetyStatus = () => {
    const [status, setStatus] = useState('Secure');
    const [scanning, setScanning] = useState(false);
    const [tip, setTip] = useState("AI is monitoring your surroundings.");

    const safetyTips = [
        "AI is monitoring your surroundings.",
        "Stay in well-lit areas.",
        "Trusted contacts are on standby.",
        "Voice SOS is active and listening.",
        "Environment looks safe.",
        "Walk with confidence, AI has your back."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            if (!scanning) {
                const randomTip = safetyTips[Math.floor(Math.random() * safetyTips.length)];
                setTip(randomTip);
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [scanning]);

    const handleScan = () => {
        setScanning(true);
        setStatus('Analyzing');
        setTip('Processing sensor data...');

        setTimeout(() => {
            setScanning(false);
            setStatus('Secure');
            setTip('Environment verified. You are safe.');
        }, 3000);
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 mb-8 relative overflow-hidden group">
            {/* Animated Background Pulse */}
            <div className={`absolute inset-0 bg-indigo-500/5 transition-opacity duration-1000 ${scanning ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent animate-pulse" />
            </div>

            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl relative transition-all duration-500 ${scanning ? 'bg-indigo-600 rotate-180' : 'bg-white/10'}`}>
                            {scanning ? (
                                <RefreshCw className="w-6 h-6 text-white animate-spin" />
                            ) : (
                                <Brain className="w-6 h-6 text-indigo-400" />
                            )}
                            {!scanning && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-lg">AI Safety Insight</h3>
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className={`text-sm font-medium transition-colors ${scanning ? 'text-indigo-300' : 'text-green-400'}`}>
                                {status === 'Secure' ? 'System Active' : 'Analyzing...'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${scanning
                                ? 'bg-white/5 border-white/5 text-gray-500'
                                : 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {scanning ? 'Scanning' : 'Quick Scan'}
                    </button>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 flex items-start gap-3 border border-white/5 min-h-[72px] transition-all group-hover:bg-white/10 group-hover:border-white/10">
                    <div className="mt-1">
                        {status === 'Secure' ? (
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                        ) : (
                            <ShieldAlert className="w-5 h-5 text-indigo-400 animate-bounce" />
                        )}
                    </div>
                    <div>
                        <p className="text-white/90 text-sm leading-relaxed font-medium">
                            {tip}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISafetyStatus;
