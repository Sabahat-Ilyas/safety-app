import React, { useState, useEffect, useRef } from 'react';
import { Brain, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config.js';

const AICard = () => {
    const [detecting, setDetecting] = useState(false);
    const [warning, setWarning] = useState(null);
    const [currentActivity, setCurrentActivity] = useState("sitting");
    const motionDataRef = useRef([]);
    const intervalRef = useRef(null);

    useEffect(() => {
        const handleMotion = (event) => {
            let accMag = 9.8;
            let gyroMag = 0;

            if (event.accelerationIncludingGravity) {
                const { x, y, z } = event.accelerationIncludingGravity;
                accMag = Math.sqrt((x||0)**2 + (y||0)**2 + (z||0)**2);
            }
            if (event.rotationRate) {
                const { alpha, beta, gamma } = event.rotationRate;
                gyroMag = Math.sqrt((alpha||0)**2 + (beta||0)**2 + (gamma||0)**2);
            }

            motionDataRef.current.push({ a: accMag, g: gyroMag });
            if (motionDataRef.current.length > 300) {
                motionDataRef.current.shift();
            }
        };

        const analyzeMovement = async () => {
            if (motionDataRef.current.length === 0) return;
            
            const dataToSend = [...motionDataRef.current];
            motionDataRef.current = []; // Clear for next batch
            
            try {
                const res = await fetch(`${API_BASE_URL}/api/ai/analyze-movement`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sensorData: dataToSend })
                });
                const data = await res.json();
                
                if (data.activity) {
                    setCurrentActivity(data.activity);
                }

                if (data.isSuspicious) {
                    setWarning(data.reason);
                    // Hide warning automatically after 10s
                    setTimeout(() => setWarning(null), 10000);
                }
            } catch (err) {
                console.error("AI Movement Analysis failed", err);
            }
        };

        if (detecting) {
            // Request permission for iOS devices if necessary
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission().then(response => {
                    if (response == 'granted') {
                        window.addEventListener('devicemotion', handleMotion);
                    }
                }).catch(console.error);
            } else {
                window.addEventListener('devicemotion', handleMotion);
            }

            // Analyze every 5 seconds
            intervalRef.current = setInterval(analyzeMovement, 5000);
        } else {
            window.removeEventListener('devicemotion', handleMotion);
            if (intervalRef.current) clearInterval(intervalRef.current);
            motionDataRef.current = [];
            setWarning(null);
            setCurrentActivity("sitting");
        }

        return () => {
            window.removeEventListener('devicemotion', handleMotion);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [detecting]);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-50 space-y-6 overflow-hidden">
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${detecting ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-100'}`}>
                    <Brain className={`w-6 h-6 ${detecting ? 'text-white' : 'text-indigo-600'}`} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">AI Threat Detection</h3>
                    <p className="text-gray-500 text-sm mt-1">Real-time AI analysis of your physical movements to detect struggles or falls</p>
                </div>
            </div>

            {warning && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-900">Suspicious Movement Detected!</h4>
                        <p className="text-sm text-red-700 mt-1">{warning}</p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!detecting ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                    onClick={() => setDetecting(false)}
                >
                    Inactive
                </button>
                <button
                    className={`flex-1 px-6 py-2 rounded-lg text-sm font-bold transition-all ${detecting ? 'bg-green-500 text-white shadow-lg' : 'bg-[#5B4DFF] text-white'}`}
                    onClick={() => setDetecting(true)}
                >
                    {detecting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                            Detecting...
                        </span>
                    ) : 'Start AI Detection'}
                </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl relative">
                {detecting && (
                    <div className="absolute inset-0 bg-indigo-500/5 animate-pulse rounded-2xl pointer-events-none"></div>
                )}
                <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-5 h-5 ${monitoring ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                        <p className="font-bold text-gray-900">Current Activity: <span className="capitalize text-indigo-600">{currentActivity}</span></p>
                        <p className="text-xs text-gray-500">{detecting ? 'Analyzing accel & gyro...' : 'Sensors offline'}</p>
                    </div>
                </div>
                {/* Switch Toggle */}
                <div
                    onClick={() => setMonitoring(!monitoring)}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative z-10 ${monitoring ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${monitoring ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-indigo-700" />
                    <h4 className="font-bold text-indigo-900">AI Detection Features</h4>
                </div>
                <ul className="space-y-3">
                    {[
                        'Following/stalking detection',
                        'Unsafe location identification',
                        'Suspicious behavior analysis',
                        'Real-time threat assessment',
                        'Automatic SOS trigger on high threat'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-700 mt-1.5 shrink-0"></div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AICard;
