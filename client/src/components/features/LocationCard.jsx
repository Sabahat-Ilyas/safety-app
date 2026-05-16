import React, { useState } from 'react';
import { MapPin, Share2, Smartphone, Bell, Sliders } from 'lucide-react';

const LocationCard = () => {
    const [isSharing, setIsSharing] = useState(false);
    const [location, setLocation] = useState(null);
    const [shakeEnabled, setShakeEnabled] = useState(true);

    const toggleSharing = () => {
        if (!isSharing) {
            if ("geolocation" in navigator) {
                const id = navigator.geolocation.watchPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                        setIsSharing(true);
                    },
                    (error) => {
                        console.error("Error getting location", error);
                        alert("Could not access location. Please check permissions.");
                        setIsSharing(false);
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser");
            }
        } else {
            setIsSharing(false);
            setLocation(null);
            // In a real app we would clear the watch ID here, but simple toggle is okay for now
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-50 space-y-6">

            <div className="flex items-start gap-3">
                <MapPin className={`w-6 h-6 mt-1 ${isSharing ? 'text-green-600 animate-pulse' : 'text-pink-600'}`} />
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Live Location Sharing</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {isSharing && location
                            ? `Sharing: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                            : 'Share your real-time location with trusted contacts'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsSharing(false)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${!isSharing ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                    Not Sharing
                </button>
                <button
                    onClick={toggleSharing}
                    className={`flex-1 px-6 py-2 font-bold rounded-lg text-sm transition-colors shadow-lg ${isSharing ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-[#F50057] hover:bg-[#D5004D] text-white shadow-pink-500/30'}`}
                >
                    {isSharing ? 'Sharing Active' : 'Start Sharing'}
                </button>
            </div>

            <button className="w-full bg-white border border-gray-200 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-gray-500 shadow-sm hover:bg-gray-50">
                <Share2 className="w-4 h-4" />
                Share Location Link
            </button>

            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
                <div className="mt-1">
                    <div className="w-4 h-4 border-2 border-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-transparent border-t-2 border-r-2 border-blue-600 transform rotate-45"></div>
                        {/* Simulating a clock icon or simple dot */}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-[#1A4B8A]">Auto-sharing enabled</h4>
                    <p className="text-sm text-[#2C5EA9] mt-1">Location automatically shared when SOS is activated</p>
                </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div className="flex items-start gap-3">
                <Bell className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Smart Alert System</h3>
                    <p className="text-gray-500 text-sm mt-1">Configure automatic alert triggers and notifications</p>
                </div>
            </div>

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-orange-500" />
                    <div>
                        <p className="font-bold text-gray-900">Shake Detection</p>
                        <p className="text-sm text-gray-500">Shake phone rapidly to trigger SOS</p>
                    </div>
                </div>
                {/* Switch Toggle */}
                <div
                    onClick={() => setShakeEnabled(!shakeEnabled)}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${shakeEnabled ? 'bg-black' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${shakeEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>

            <div>
                <div className="flex justify-between text-sm font-bold text-gray-900 mb-3">
                    <span>Sensitivity</span>
                    <span className="text-gray-500 font-normal">70%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full bg-black rounded-full" style={{ width: '70%' }}></div>
                    <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md cursor-pointer" style={{ left: '70%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>Less sensitive</span>
                    <span>More sensitive</span>
                </div>
            </div>
        </div>
    );
};

export default LocationCard;
