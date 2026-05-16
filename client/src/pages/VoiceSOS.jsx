import { API_BASE_URL } from '../config.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, MicOff, Info, AlertTriangle } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const VoiceSOS = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [lastTrigger, setLastTrigger] = useState(null);
    const [volume, setVolume] = useState(0);
    const [alertTriggered, setAlertTriggered] = useState(false);
    const [sosTriggered, setSosTriggered] = useState(false);
    const [showConfirmButton, setShowConfirmButton] = useState(false); // New: for browser bypass
    const [location, setLocation] = useState("Current Location (GPS Simulated)");
    const [emergencyContact, setEmergencyContact] = useState(null); // New: cache contact

    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const debounceTimerRef = useRef(null);

    const triggerSOS = async (reason) => {
        if (alertTriggered) return;
        setAlertTriggered(true);
        setSosTriggered(true);
        setLastTrigger({ reason, time: new Date().toLocaleTimeString() });

        const sosData = {
            type: 'VOICE_SOS',
            reason: reason,
            location: location,
            timestamp: new Date().toISOString()
        };

        try {
            // 1. Notify Backend (Still automatic)
            await fetch(`${API_BASE_URL}/api/alert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sosData)
            });

            // 2. Fetch/Prepare Trusted Contact
            const contactsRes = await fetch(`${API_BASE_URL}/api/contacts`);
            const contactsList = await contactsRes.json();
            const contact = contactsList.find(c => c.type === 'emergency') || contactsList[0];

            if (contact && contact.phone) {
                setEmergencyContact(contact);
                setShowConfirmButton(true); // Reveal the bypass button
            } else {
                alert("SOS Triggered! (No trusted contacts found)");
            }

        } catch (error) {
            console.error("SOS Alert failed:", error);
        }
    };

    const handleConfirmRealAlert = () => {
        if (!emergencyContact || !emergencyContact.phone) return;

        // Use libphonenumber-js to format to E.164 (e.g., +923001234567)
        // This is much more reliable for dialers to recognize the number
        const phoneNumber = parsePhoneNumberFromString(emergencyContact.phone, emergencyContact.country || 'PK');
        const formattedPhone = phoneNumber ? phoneNumber.format('E.164') : emergencyContact.phone.replace(/\D/g, '');

        const message = encodeURIComponent(`EMERGENCY! I need help. My location: ${location}`);

        console.log(`[DEBUG] Triggering SMS to: ${formattedPhone}`);
        
        // Trigger SMS first (often opens in a separate view)
        window.location.href = `sms:${formattedPhone}?body=${message}`;
        
        // Delay the call trigger to allow the SMS app to initialize
        setTimeout(() => {
            console.log(`[DEBUG] Triggering Call to: ${formattedPhone}`);
            window.location.href = `tel:${formattedPhone}`;
        }, 2000);
        
        setShowConfirmButton(false);
    };

    const startListening = async () => {
        try {
            // 1. Setup Speech Recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Speech recognition is not supported in this browser.");
                return;
            }

            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript.toLowerCase())
                    .join(' '); // Fix: use space for better joining

                console.log('[DEBUG] Heard:', transcript);

                // Clear previous timer
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                // Debounce AI check to avoid spamming endpoint
                debounceTimerRef.current = setTimeout(async () => {
                    if (transcript.length > 5) {
                        try {
                            const res = await fetch(`${API_BASE_URL}/api/ai/analyze-transcript`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ transcript })
                            });
                            
                            const data = await res.json();
                            
                            if (data.isDanger) {
                                console.log('[DEBUG] AI Detected Danger:', data.reason);
                                triggerSOS(`AI Detected Danger: "${transcript}" (${data.reason})`);
                                stopListening();
                                return;
                            }
                        } catch (err) {
                            console.error("AI Transcript Analysis failed:", err);
                        }
                    }

                    // Fallback to basic keywords
                    const emergencyKeywords = ['help', 'help me', 'bachao', 'emergency', 'save me', 'police', 'danger', 'madad', 'help please'];
                    if (emergencyKeywords.some(keyword => transcript.includes(keyword))) {
                        triggerSOS(`Keyword detected: "${transcript}"`);
                        stopListening();
                    }
                }, 1000); // 1.0 seconds silence before analysis
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Recognition error:', event.error);
                if (event.error !== 'no-speech') setIsListening(false);
            };

            recognitionRef.current.start();

            // 2. Setup Audio Volume Monitoring (Scream Detection)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkVolume = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setVolume(average);

                // Sudden jump to high volume (scream pulse)
                if (average > 70) {
                    triggerSOS("High-pitched distress sounds detected");
                    stopListening();
                    return;
                }

                animationFrameRef.current = requestAnimationFrame(checkVolume);
            };

            checkVolume();
            setIsListening(true);

        } catch (err) {
            console.error('Error starting listeners:', err);
            let errorMessage = "Microphone access denied or error occurred.";
            if (window.isSecureContext === false) {
                errorMessage = "Microphone access requires a secure connection (HTTPS or localhost). Please use 'localhost' if testing on this computer, or set up HTTPS for mobile testing.";
            } else if (err.name === 'NotAllowedError') {
                errorMessage = "Microphone permission was denied. Please allow microphone access in your browser settings.";
            } else if (err.name === 'NotFoundError') {
                errorMessage = "No microphone found on this device.";
            }
            alert(errorMessage);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        setIsListening(false);
        setVolume(0);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopListening();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white relative font-sans p-6 overflow-y-auto">

            {/* TOP SECTION */}
            <div className="flex flex-col gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/home')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                        <ChevronLeft className="w-6 h-6 text-gray-300" />
                    </button>
                    <h1 className="text-2xl font-bold">Voice SOS</h1>
                </div>
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-300 tracking-wide uppercase">
                            {isListening ? 'Listening Mode ON' : 'Listening Mode OFF'}
                        </span>
                    </div>
                    {isListening && (
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 transition-all duration-100"
                                    style={{ width: `${Math.min(volume * 1.5, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CENTER SECTION: MIC & ANIMATION */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                <div className="relative mb-8">
                    {/* Animated Waves */}
                    {isListening && (
                        <>
                            <div
                                className="absolute inset-0 bg-red-500/20 rounded-full animate-ping blur-xl opacity-75 duration-1000"
                                style={{ transform: `scale(${1 + volume / 100})` }}
                            ></div>
                            <div className="absolute inset-0 border-[3px] border-red-500/30 rounded-full animate-[spin_3s_linear_infinite] scale-150"></div>
                        </>
                    )}

                    {/* Mic Icon Container */}
                    <div
                        onClick={toggleListening}
                        className={`
                            relative z-10 w-40 h-40 rounded-full flex items-center justify-center 
                            shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] border-4 transition-all duration-300 cursor-pointer
                            ${isListening
                                ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 scale-105'
                                : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                            }
                        `}
                    >
                        {isListening ? (
                            <Mic className="w-16 h-16 text-white animate-pulse" />
                        ) : (
                            <MicOff className="w-16 h-16 text-gray-500" />
                        )}
                    </div>
                </div>

                <p className={`text-center font-medium transition-colors duration-300 ${isListening ? 'text-white' : 'text-gray-500'}`}>
                    {isListening ? "Say 'Help Me' or scream to trigger SOS" : "Tap microphone to enable"}
                </p>

                {lastTrigger && (
                    <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex flex-col gap-4 animate-fade-in w-full max-w-sm">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-200 uppercase tracking-tight">SOS Triggered</p>
                                <p className="text-xs text-red-300/80">{lastTrigger.reason} at {lastTrigger.time}</p>
                            </div>
                        </div>

                        {showConfirmButton && (
                            <button 
                                onClick={handleConfirmRealAlert}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce text-sm uppercase"
                            >
                                Tap to Activate Call & SMS
                            </button>
                        )}
                        
                        {!showConfirmButton && alertTriggered && (
                            <p className="text-[10px] text-red-400 italic text-center">
                                * Alert processed. Contact your trusted contacts if apps didn't open.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* LOWER MIDDLE SECTION: KEYWORDS */}
            <div className="w-full max-w-sm mx-auto mb-10">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Active Triggers</h3>
                <div className="space-y-3">
                    {["Help me", "Bachao", "High-pitched distress scream"].map((keyword, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                            <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                            <span className={`font-medium ${isListening ? 'text-gray-200' : 'text-gray-500'}`}>
                                {keyword === "High-pitched distress scream" ? (
                                    <span>Scream Detection <span className="text-xs text-gray-500">(loud panic sounds)</span></span>
                                ) : (
                                    `"${keyword}"`
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM SECTION: TOGGLE */}
            <div className="bg-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-lg mb-4">
                <div>
                    <span className="block font-bold text-gray-200">Enable Voice SOS</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Info className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] text-gray-500">Detects keywords and panic screams. Always active while on this screen.</span>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={toggleListening}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isListening ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isListening ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>

        </div>
    );
};

export default VoiceSOS;
