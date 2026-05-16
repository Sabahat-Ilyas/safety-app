import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, X, Check, ChevronLeft } from 'lucide-react';

const SafetyTimer = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('config'); // config, running, alert
    const [duration, setDuration] = useState(15); // minutes
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        let interval;
        if (status === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (status === 'running' && timeLeft === 0) {
            setStatus('alert');
            // Mock backend trigger here
            console.log("SOS TRIGGERED BY TIMER");
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    const startTimer = () => {
        setTimeLeft(duration * 60);
        setStatus('running');
    };

    const cancelTimer = () => {
        setStatus('config');
        setTimeLeft(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white relative font-sans p-6">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/home')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                    <ChevronLeft className="w-6 h-6 text-gray-300" />
                </button>
                <h1 className="text-2xl font-bold">Safety Timer</h1>
            </div>

            {/* CONFIG MODE */}
            {status === 'config' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-10 animate-fade-in">
                    <div className="text-center">
                        <Clock className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Set a Check-in Time</h2>
                        <p className="text-gray-400 text-sm">We'll alert your contacts if you don't confirm you're safe.</p>
                    </div>

                    <div className="w-full max-w-xs">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-300 font-medium">Duration</span>
                            <span className="text-3xl font-bold text-orange-400">{duration} min</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="120"
                            step="5"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>5m</span>
                            <span>1h</span>
                            <span>2h</span>
                        </div>
                    </div>

                    <button
                        onClick={startTimer}
                        className="w-full py-4 bg-orange-600 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all hover:bg-orange-700"
                    >
                        Start Timer
                    </button>

                    <div className="mt-auto bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex gap-3 items-start">
                        <ShieldAlert className="w-6 h-6 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-400 leading-relaxed">
                            If the timer ends without confirmation, an SOS alert with your location will be sent automatically.
                        </p>
                    </div>
                </div>
            )}

            {/* RUNNING MODE */}
            {status === 'running' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-fade-in">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse blur-xl"></div>
                        <div className="w-64 h-64 rounded-full border-8 border-gray-800 flex items-center justify-center bg-gray-800/50 relative z-10">
                            <span className="text-5xl font-mono font-bold text-white tracking-widest">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    <div className="w-full flexflex-col gap-4">
                        <p className="text-center text-gray-400 mb-8 animate-pulse">Monitoring your safety...</p>

                        <button
                            onClick={cancelTimer}
                            className="w-full py-4 bg-gray-700 rounded-xl font-bold text-lg text-gray-300 shadow-lg active:scale-95 transition-all mb-4"
                        >
                            Cancel Timer
                        </button>

                        <button
                            onClick={cancelTimer}
                            className="w-full py-4 bg-green-600 rounded-xl font-bold text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="w-6 h-6" />
                            I'm Safe
                        </button>
                    </div>
                </div>
            )}

            {/* ALERT MODE */}
            {status === 'alert' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-shake">
                    <ShieldAlert className="w-32 h-32 text-red-500 animate-pulse" />
                    <h1 className="text-4xl font-black text-red-500 uppercase tracking-widest text-center">SOS SENT</h1>
                    <p className="text-center text-gray-300">Emergency contacts have been notified with your location.</p>

                    <button
                        onClick={() => setStatus('config')}
                        className="mt-8 px-8 py-3 bg-gray-800 rounded-full text-sm font-medium text-gray-400 hover:text-white transition"
                    >
                        Dismiss
                    </button>
                </div>
            )}

        </div>
    );
};

export default SafetyTimer;
