import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';

const FakeCall = () => {
    const navigate = useNavigate();
    const [callState, setCallState] = useState('incoming'); // incoming, active, ended
    const [timer, setTimer] = useState(0);

    // Timer logic for active call
    useEffect(() => {
        let interval;
        if (callState === 'active') {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callState]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAccept = () => {
        setCallState('active');
    };

    const handleDecline = () => {
        navigate('/home');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white relative overflow-hidden font-sans">

            {/* Background Image / Blur Effect */}
            <div className="absolute inset-0 bg-gray-900 z-0">
                {/* Optional: Add a subtle blurry background or gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-950/90"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center pt-20 pb-12 px-6">

                {/* TOP SECTION: CALLER INFO */}
                <div className="flex flex-col items-center gap-4 animate-fade-in-down">
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600 shadow-2xl overflow-hidden">
                        <UserPlaceholder />
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Mom</h1>
                        <p className="text-lg text-gray-300 tracking-wide">
                            {callState === 'incoming' ? 'Incoming Call...' : formatTime(timer)}
                        </p>
                    </div>
                </div>

                {/* CENTER SECTION */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    {callState === 'incoming' && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping blur-xl"></div>
                            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-pulse blur-md"></div>
                            <Phone className="w-24 h-24 text-green-500 animate-bounce" />
                        </div>
                    )}
                    {callState === 'incoming' && (
                        <p className="mt-8 text-gray-400 text-sm font-medium tracking-widest uppercase">Fake Call Active</p>
                    )}

                    {callState === 'active' && (
                        <div className="grid grid-cols-3 gap-8 w-full max-w-xs mb-12">
                            <ActionButton icon={<Mic className="w-8 h-8" />} label="Mute" />
                            <ActionButton icon={<Volume2 className="w-8 h-8" />} label="Speaker" />
                            <ActionButton icon={<Phone className="w-8 h-8" />} label="Keypad" />
                        </div>
                    )}
                </div>

                {/* BOTTOM SECTION: CONTROLS */}
                <div className="w-full max-w-md flex justify-around items-end pb-8">
                    {callState === 'incoming' ? (
                        <>
                            <button
                                onClick={handleDecline}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                                    <PhoneOff className="w-10 h-10 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-300">Decline</span>
                            </button>

                            <button
                                onClick={handleAccept}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform animate-pulse">
                                    <Phone className="w-10 h-10 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-300">Accept</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleDecline}
                            className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                        >
                            <PhoneOff className="w-10 h-10 text-white" />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

// Helper Components
const UserPlaceholder = () => (
    <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ActionButton = ({ icon, label }) => (
    <div className="flex flex-col items-center gap-2 text-gray-300 opacity-80 cursor-not-allowed">
        <div className="p-4 rounded-full border border-gray-600 bg-gray-800">
            {icon}
        </div>
        <span className="text-xs">{label}</span>
    </div>
);

export default FakeCall;
