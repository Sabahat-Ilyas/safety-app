import React, { useState } from 'react';
import { Battery, Zap, AlertTriangle } from 'lucide-react';

const BatteryCard = () => {
    const [autoAlert, setAutoAlert] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState(0);
    const [isCharging, setIsCharging] = useState(false);

    React.useEffect(() => {
        try {
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    setBatteryLevel(Math.round(battery.level * 100));
                    setIsCharging(battery.charging);

                    battery.addEventListener('levelchange', () => setBatteryLevel(Math.round(battery.level * 100)));
                    battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
                }).catch(e => console.log('Battery API API error', e));
            } else {
                setBatteryLevel(75); // Fallback
            }
        } catch (error) {
            console.log("Battery effect error", error);
        }
    }, []);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 space-y-6">
            <div className="flex items-start gap-3">
                <Battery className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Low Battery Alert System</h3>
                    <p className="text-gray-500 text-sm mt-1">Automatic alerts when battery is low to keep contacts informed</p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4 bg-orange-50/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <Battery className="w-8 h-8 text-green-600 rotate-90" />
                    <span className="text-5xl font-bold text-green-600">{batteryLevel}%</span>
                </div>
                <p className="text-gray-500 font-medium">Current battery level</p>

                {/* Progress Bar */}
                <div className="w-full max-w-[200px] h-4 bg-gray-200 rounded-full mt-4 overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full bg-black rounded-full" style={{ width: `${batteryLevel}%` }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white z-10">{batteryLevel}%</span>
                </div>

                <div className="mt-4 w-full px-4">
                    <button className="w-full bg-white border border-gray-200 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-gray-800 shadow-sm hover:bg-gray-50">
                        <Zap className="w-4 h-4" />
                        Start Charging (Demo)
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                        <p className="font-bold text-gray-900">Auto Alert</p>
                        <p className="text-xs text-gray-500">Notify contacts when battery is low</p>
                    </div>
                </div>
                {/* Switch Toggle */}
                <div
                    onClick={() => setAutoAlert(!autoAlert)}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${autoAlert ? 'bg-black' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${autoAlert ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">Alert Threshold</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-200">
                    <option>20%</option>
                    <option>15%</option>
                    <option>10%</option>
                    <option>5%</option>
                </select>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                <div className="flex items-center gap-2 mb-3">
                    <Battery className="w-5 h-5 text-yellow-700" />
                    <h4 className="font-bold text-yellow-900">Low Battery Actions</h4>
                </div>
                <ul className="space-y-3">
                    {['Alert sent at 20% battery level', 'Location automatically shared at 10%', 'SOS prepared for quick activation', 'Power-saving mode recommended', 'Emergency contacts receive'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-700 mt-1.5 shrink-0"></div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BatteryCard;
