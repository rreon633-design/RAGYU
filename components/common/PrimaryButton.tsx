
import React from 'react';

interface PrimaryButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  variant?: 'blue' | 'white' | 'ghost';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  onClick, 
  children, 
  disabled, 
  className = '', 
  type = 'button',
  variant = 'blue'
}) => {
  const baseStyles = "w-full py-5 font-black rounded-[2rem] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center text-lg uppercase tracking-tight";
  
  const variants = {
    blue: "brand-gradient text-white shadow-2xl shadow-brand-lightcyan hover:scale-[1.02]",
    white: "bg-white border-2 border-gray-100 text-gray-800 shadow-sm hover:border-brand-teal hover:bg-gray-50",
    ghost: "bg-transparent text-gray-500 border-2 border-transparent hover:bg-gray-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
