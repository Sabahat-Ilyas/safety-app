import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Users, MapPin, Clock, Mic, LogOut, Shield, Brain, Zap } from 'lucide-react';
import bgImage from '../assets/login_bg.png';
import logoImage from '../assets/logo.png';
import AISafetyStatus from '../components/dashboard/AISafetyStatus';

const Home = () => {
    const navigate = useNavigate();

    const openFeature = (path) => {
        const width = 390;
        const height = 844;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
            path,
            '_blank',
            `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes,left=${left},top=${top}`
        );
    };

    const features = [
        {
            id: 'ai-threat',
            name: 'AI Detection',
            icon: <Brain className="w-8 h-8 text-white" />,
            color: 'bg-purple-600',
            path: '/ai-threat',
            desc: 'AI-powered safety advisor'
        },
        {
            id: 'fake-call',
            name: 'Fake Call',
            icon: <Phone className="w-8 h-8 text-white" />,
            color: 'bg-indigo-500',
            path: '/fake-call',
            desc: 'Simulate an incoming call'
        },
        {
            id: 'contacts',
            name: 'Contacts',
            icon: <Users className="w-8 h-8 text-white" />,
            color: 'bg-blue-500',
            path: '/contacts',
            desc: 'Manage trusted contacts'
        },
        {
            id: 'location',
            name: 'Location',
            icon: <MapPin className="w-8 h-8 text-white" />,
            color: 'bg-green-500',
            path: '/location',
            desc: 'Share live location'
        },
        {
            id: 'safety-timer',
            name: 'Safety Timer',
            icon: <Clock className="w-8 h-8 text-white" />,
            color: 'bg-orange-500',
            path: '/safety-timer',
            desc: 'Schedule check-ins'
        },
        {
            id: 'voice-sos',
            name: 'Voice SOS',
            icon: <Mic className="w-8 h-8 text-white" />,
            color: 'bg-red-500',
            path: '/voice-sos',
            desc: 'Voice activated alert'
        }
    ];

    return (
        <div className="flex flex-col h-screen bg-[#0A0A1F] relative overflow-hidden font-sans text-white">
            {/* Background Image with Overlay - Subtler for better readability */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src={bgImage} alt="Background" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A1F]/90 via-transparent to-[#0A0A1F]" />
            </div>

            {/* Header */}
            <header className="px-6 py-4 bg-black/40 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-lg shadow-red-600/10">
                        <img src={logoImage} alt="Guardian Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">Guardian</h1>
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em]">Safety Hub</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5 text-gray-300" />
                </button>
            </header>

            <main className="flex-1 p-6 overflow-y-auto relative z-10 pb-12">
                <div className="max-w-md mx-auto">
                    {/* New AI Safety Status Section */}
                    <AISafetyStatus />

                    <div className="flex flex-col gap-4">
                        {features.map((feature) => (
                            <div
                                key={feature.id}
                                onClick={() => openFeature(feature.path)}
                                className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-md p-5 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-row items-center gap-5 cursor-pointer transition-all duration-300 hover:border-white/20 active:scale-95"
                            >
                                <div className={`${feature.color} p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-xl leading-tight tracking-tight">{feature.name}</h3>
                                    <p className="text-gray-400 text-sm mt-0.5 font-medium">{feature.desc}</p>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Brain className="w-5 h-5 text-white/20" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm rounded-3xl p-6 text-center shadow-2xl">
                        <p className="text-sm text-indigo-200 font-medium">
                            <span className="inline-block px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full mr-2 uppercase tracking-tighter">Pro Tip</span>
                            Tap any tool to open it in an <span className="text-white font-bold underline decoration-indigo-500/50">independent window</span>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
