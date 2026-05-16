import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-safety-orange to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30",
        danger: "bg-safety-red hover:bg-red-700 shadow-red-500/30 text-xl py-6 animate-pulse-fast",
        secondary: "bg-dark-card border border-white/10 hover:bg-white/5",
        ghost: "bg-transparent hover:bg-white/5 shadow-none"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
