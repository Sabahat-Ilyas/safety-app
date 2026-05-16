import { API_BASE_URL } from '../config.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Shield } from 'lucide-react';
import bgImage from '../assets/login_bg.png';
import logoImage from '../assets/logo.png';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            
            if (response.ok) {
                setSent(true);
            } else {
                setError(data.error || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Server connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full relative bg-dark-bg text-white overflow-y-auto flex flex-col font-serif">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img src={bgImage} alt="Background" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/90 to-transparent" />
            </div>

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button onClick={() => navigate('/')} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-8 pb-12 pt-20 min-h-[600px]">

                {/* Logo Section */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-8 bg-red-600/30 rounded-full blur-2xl group-hover:bg-red-600/40 transition-all duration-700 animate-pulse" />
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl relative border border-white/10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            <img src={logoImage} alt="Guardian Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent uppercase">Forgot Password?</h1>
                        <p className="text-red-400/80 text-base font-medium">Enter your email to reset your password</p>
                    </div>
                </div>

                {/* Form */}
                <div className="w-full max-w-sm mx-auto space-y-6 animate-fade-in-up">
                    {sent ? (
                        <div className="bg-green-500/20 border border-green-500/50 p-6 rounded-2xl text-center space-y-4">
                            <div className="bg-green-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="font-bold text-lg text-green-100">Check your email</h3>
                            <p className="text-green-200/80 text-sm">We've sent password reset instructions to {email}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition-all mt-2"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-safety-orange transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-[#800000] hover:bg-[#600000] text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Sending...</span>
                                ) : (
                                    <span>Reset Password</span>
                                )}
                            </button>
                        </>
                    )}

                    <div className="pt-6 flex justify-center">
                        <p className="text-xs text-center text-white/30 flex items-center gap-1 font-sans">
                            <Lock className="w-3 h-3" />
                            Secured by Guardian Shield
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
