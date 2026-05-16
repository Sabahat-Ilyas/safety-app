import React, { useState } from 'react';
import { Clock, Play } from 'lucide-react';

const TimerCard = () => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const toggleTimer = () => {
        if (isActive) {
            setIsActive(false);
            setTimeLeft(0);
        } else {
            setIsActive(true);
            setTimeLeft(900); // Default to 15 mins for demo

            // Mock timer countdown would go here
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-cyan-100 space-y-6">
            <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-cyan-600 mt-1" />
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Safety Check-in Timer</h3>
                    <p className="text-gray-500 text-sm mt-1">Set a timer to check in - alerts sent if you don't respond</p>
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">Timer Duration</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium outline-none border-r-8 border-r-transparent">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                </select>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">Check-in Message</label>
                <input
                    type="text"
                    defaultValue="Are you safe?"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-cyan-200"
                />
            </div>

            <button
                onClick={toggleTimer}
                className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#008ba3] hover:bg-[#007b8f] text-white'}`}
            >
                {isActive ? 'Stop Timer' : (
                    <>
                        <Play className="w-5 h-5 fill-current" />
                        Start Safety Timer
                    </>
                )}
            </button>

            <div className="bg-cyan-50 rounded-2xl p-5 border border-cyan-100">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-cyan-700" />
                    <h4 className="font-bold text-cyan-900">How It Works</h4>
                </div>
                <ul className="space-y-3">
                    {[
                        'Set a timer for your journey or activity',
                        'Receive notifications to check in',
                        'If timer expires without check-in, SOS is triggered',
                        'Emergency contacts notified with your location'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-700 mt-1.5 shrink-0"></div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TimerCard;
