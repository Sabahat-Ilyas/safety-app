import { API_BASE_URL } from '../config.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Phone, MapPin, AlertTriangle, Settings, Home as HomeIcon, Mic, Shield } from 'lucide-react';
import { useVoiceRecognition } from '../features/useVoiceRecognition';

const Home = () => {
    const navigate = useNavigate();
    const [sosActive, setSosActive] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(true);

    const triggerSOS = async () => {
        setSosActive(true);

        // 1. Get Location
        let locationData = 'Unknown';
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                locationData = `${position.coords.latitude}, ${position.coords.longitude}`;
            } catch (error) {
                console.error("GPS Error", error);
            }
        }

        // 2. Fetch Contacts & Call
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts`);
            const contacts = await res.json();
            // Find emergency contact or default to police
            const emergencyContact = contacts.find(c => c.type === 'emergency') || contacts[0];

            if (emergencyContact && emergencyContact.phone) {
                console.log("Calling", emergencyContact.phone);
                window.location.href = `tel:${emergencyContact.phone}`;
            }
        } catch (e) {
            console.error("Failed to fetch contacts", e);
        }

        // 3. Send Backend Alert
        try {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]); // SOS Pattern
            await fetch(`${API_BASE_URL}/api/alert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: locationData, type: 'SOS_TRIGGER' })
            });
        } catch (error) {
            console.error("Failed to send alert", error);
        }
        setTimeout(() => setSosActive(false), 5000);
    };

    const { isListening, startListening, transcript } = useVoiceRecognition(triggerSOS);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white relative overflow-hidden font-sans">

            {/* TOP SECTION */}
            <header className="px-6 py-8 flex flex-col gap-6 bg-gray-800 rounded-b-3xl shadow-lg z-10">
                <div className="flex justify-between items-center">
                    {/* Voice SOS Button (Top Left) */}
                    <button
                        onClick={() => navigate('/voice-sos')}
                        className="p-3 bg-gray-700/50 rounded-full hover:bg-gray-700 transition group"
                    >
                        <Mic className="w-8 h-8 text-gray-300 group-hover:text-red-400 transition-colors" />
                    </button>

                    <h1 className="text-3xl font-bold tracking-wide">Guardian</h1>

                    <button className="p-3 bg-gray-700/50 rounded-full hover:bg-gray-700 transition">
                        <Settings className="w-8 h-8 text-gray-300" />
                    </button>
                </div>
                <div
                    onClick={() => navigate('/voice-sos')}
                    className="flex items-center justify-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className={`w-4 h-4 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-lg font-medium text-gray-300 tracking-wide">
                        {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
                    </span>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8 relative">

                {/* CENTER SECTION: PANIC BUTTON */}
                <div className="flex flex-col items-center justify-center relative z-0">
                    {/* Ripple Effect Wrapper */}
                    <div className="relative">
                        <div className={`absolute inset-0 bg-red-600/20 rounded-full blur-3xl ${sosActive ? 'animate-pulse scale-150' : 'scale-100'} transition-transform duration-500`}></div>
                        <button
                            className={`
                                relative z-10 w-64 h-64 rounded-full flex flex-col items-center justify-center 
                                bg-gradient-to-br from-red-500 to-red-700 shadow-[0_10px_60px_-10px_rgba(220,38,38,0.7)]
                                border-[10px] border-gray-800 ring-4 ring-red-900/50
                                active:scale-95 active:shadow-inner transition-all duration-200
                                ${sosActive ? 'animate-pulse ring-red-500' : ''}
                            `}
                            onTouchStart={triggerSOS}
                            onMouseDown={triggerSOS}
                        >
                            <AlertTriangle className="w-24 h-24 text-white mb-3 ml-1" fill="white" strokeWidth={1.5} />
                            <span className="text-5xl font-black text-white tracking-widest drop-shadow-md">SOS</span>
                        </button>
                    </div>
                    <p className="mt-8 text-gray-400 text-xl font-bold uppercase tracking-widest">Tap in Emergency</p>
                </div>

                {/* LOWER MIDDLE SECTION: ACTION BUTTONS */}
                <div className="flex flex-col gap-6 w-full max-w-sm">
                    <div className="grid grid-cols-2 gap-6">
                        <button
                            onClick={() => navigate('/fake-call')}
                            className="bg-gray-800 p-6 rounded-2xl border border-gray-700 active:bg-gray-700 transition flex items-center justify-center gap-4 shadow-md"
                        >
                            <Phone className="w-8 h-8 text-blue-400" />
                            <span className="font-bold text-xl text-gray-200">Fake Call</span>
                        </button>
                        <button
                            onClick={() => navigate('/safety-timer')}
                            className="bg-gray-800 p-6 rounded-2xl border border-gray-700 active:bg-gray-700 transition flex items-center justify-center gap-4 shadow-md"
                        >
                            <div className="w-8 h-8 text-orange-400 font-bold border-2 border-orange-400 rounded-full flex items-center justify-center text-lg">T</div>
                            <span className="font-bold text-xl text-gray-200">Safety Timer</span>
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/ai-threat')}
                        className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-6 rounded-2xl border border-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-lg"
                    >
                        <Mic className="w-8 h-8 text-purple-400" />
                        <span className="font-bold text-xl text-white">AI Safety Advisor</span>
                    </button>
                </div>

                {/* BOTTOM SECTION: LOCATION STATUS */}
                <div className="flex flex-col items-center gap-2 mt-auto pb-6">
                    <p className="text-green-400 text-lg font-bold tracking-wide flex items-center gap-2">
                        Location Sharing ON
                    </p>
                    <div className="p-2 bg-green-500/10 rounded-full animate-bounce mt-1">
                        <MapPin className="w-6 h-6 text-green-500" />
                    </div>
                </div>

            </main>

            {/* BOTTOM NAVIGATION BAR */}
            <nav className="w-full bg-gray-900 border-t border-gray-800 px-6 py-5 flex justify-between items-center z-20 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
                <button className="flex flex-col items-center gap-1 text-red-500">
                    <HomeIcon className="w-8 h-8" />
                    <span className="text-xs font-bold uppercase tracking-wider">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors" onClick={() => navigate('/location')}>
                    <MapPin className="w-8 h-8" />
                    <span className="text-xs font-bold uppercase tracking-wider">Track</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors" onClick={() => navigate('/contacts')}>
                    <User className="w-8 h-8" />
                    <span className="text-xs font-bold uppercase tracking-wider">Contacts</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
                    <Settings className="w-8 h-8" />
                    <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
                </button>
            </nav>
        </div>
    );
};

export default Home;
