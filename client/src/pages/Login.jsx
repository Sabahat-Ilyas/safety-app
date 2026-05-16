import { API_BASE_URL } from '../config.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Shield } from 'lucide-react';
import bgImage from '../assets/login_bg.png';
import logoImage from '../assets/logo.png';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: normalizedEmail, password: password.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store user info if needed, e.g., in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/home');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Server connection failed. Please try again.');
            console.error('Login error:', err);
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

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-8 pb-12 pt-10 min-h-[600px]">

                {/* Logo Section */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-8 bg-red-600/30 rounded-full blur-2xl group-hover:bg-red-600/40 transition-all duration-700 animate-pulse" />
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl relative border border-white/10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            <img src={logoImage} alt="Guardian Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">GUARDIAN</h1>
                        <p className="text-red-400/80 text-lg font-medium tracking-wide uppercase text-sm">Your Personal Safety Companion</p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="w-full max-w-sm mx-auto space-y-6 animate-fade-in-up">
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
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-safety-orange transition-all font-sans"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-[#800000] hover:bg-[#600000] text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="animate-pulse">Logging in...</span>
                        ) : (
                            <>
                                <span>Login</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <div className="flex justify-between text-sm text-white/40 px-2 font-sans">
                        <button onClick={() => {
                            localStorage.removeItem('user');
                            navigate('/signup');
                        }} className="hover:text-white transition-colors">Create Account</button>
                        <button onClick={() => navigate('/forgot-password')} className="hover:text-white transition-colors">Forgot Password?</button>
                    </div>

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

export default Login;
