import React, { useState } from 'react';
import { Volume2, Mic, Smartphone, Bell, Activity } from 'lucide-react';

const VoiceCard = () => {
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [volButtonEnabled, setVolButtonEnabled] = useState(true);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50 space-y-6">

            {/* Voice Commands Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                    <Volume2 className="w-6 h-6 text-orange-500 mt-1" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Voice Commands</h3>
                        <p className="text-gray-500 text-sm">Say "Help me" to activate alert</p>
                    </div>
                </div>
                {/* Switch Toggle */}
                <div
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${voiceEnabled ? 'bg-black' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${voiceEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>

            <button className="w-full bg-white border border-gray-200 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-gray-800 shadow-sm hover:bg-gray-50">
                <Volume2 className="w-4 h-4" />
                Test Voice Command
            </button>

            <div className="h-px bg-gray-100 w-full" />

            {/* Volume Button SOS */}
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                    <div className="text-orange-500 font-bold text-xl mt-0.5">⏏</div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Volume Button SOS</h3>
                        <p className="text-gray-500 text-sm">Press volume down 3 times quickly</p>
                    </div>
                </div>
                {/* Switch Toggle */}
                <div
                    onClick={() => setVolButtonEnabled(!volButtonEnabled)}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${volButtonEnabled ? 'bg-black' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${volButtonEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900">Shake Detection</p>
                            <p className="text-xs text-gray-500">2:30 PM</p>
                        </div>
                        <span className="bg-[#FF4D00] text-white text-xs font-bold px-3 py-1.5 rounded-full">Triggered</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900">Voice Command</p>
                            <p className="text-xs text-gray-500">1:15 PM</p>
                        </div>
                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">Activated</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#FFF5EB] rounded-2xl p-5 border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-orange-700" />
                    <h4 className="font-bold text-orange-900">Alert Actions</h4>
                </div>
                <ul className="space-y-3">
                    {[
                        'Send SMS to all emergency contacts',
                        'Call primary emergency contact',
                        'Share live location',
                        'Start audio recording',
                        'Send notification to nearby'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-700 mt-1.5 shrink-0"></div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default VoiceCard;
