import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, MapPin, StopCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when coords change
function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        map.setView(coords);
    }, [coords]);
    return null;
}

const Location = () => {
    const navigate = useNavigate();
    const [isSharing, setIsSharing] = useState(false);
    const [coords, setCoords] = useState([40.7128, -74.0060]); // Default: NYC
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords([position.coords.latitude, position.coords.longitude]);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setLoading(false);
                }
            );
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col relative">
            <header className="absolute top-0 left-0 right-0 z-20 flex items-center gap-4 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full pointer-events-auto hover:bg-black/60 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                    <h1 className="text-lg font-bold">Live Location</h1>
                </div>
            </header>

            <main className="flex-1 relative z-0">
                <MapContainer
                    center={coords}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                    style={{ background: '#1a1a1a' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={coords}>
                        <Popup>
                            <span className="font-bold text-gray-800">You are here</span>
                        </Popup>
                    </Marker>
                    <RecenterMap coords={coords} />
                </MapContainer>

                {loading && (
                    <div className="absolute inset-0 bg-black/80 z-[1000] flex items-center justify-center">
                        <div className="animate-spin w-10 h-10 border-4 border-safety-orange border-t-transparent rounded-full" />
                    </div>
                )}
            </main>

            <div className="bg-gray-900 border-t border-gray-800 p-6 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <div className="mb-4">
                    <p className="text-sm text-gray-400">Current Coordinates</p>
                    <p className="font-mono text-lg font-bold tracking-wider">{coords[0].toFixed(4)}, {coords[1].toFixed(4)}</p>
                </div>

                <Button
                    variant={isSharing ? "danger" : "primary"}
                    onClick={() => setIsSharing(!isSharing)}
                    className={isSharing ? "bg-red-600 animate-pulse" : "bg-blue-600"}
                >
                    {isSharing ? <StopCircle className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                    <span>{isSharing ? "Stop Sharing Live Location" : "Share Live Location"}</span>
                </Button>
            </div>
        </div>
    );
};

export default Location;
