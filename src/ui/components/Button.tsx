/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { soundFx } from '@/audio/audioManager';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'on-air' | 'cyber';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      if (variant === 'on-air') {
        soundFx.playOnAirChime();
      } else {
        soundFx.playClick();
      }
      onClick?.(e);
    }
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold tracking-wide',
    icon: 'p-2 rounded-lg',
  }[size];

  const variantStyles = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 border border-cyan-400/30 hover:shadow-cyan-400/30',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/60 shadow-sm hover:border-slate-500/50',
    danger:
      'bg-red-600/90 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-600/25 border border-red-500/30',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent',
    'on-air':
      'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold tracking-wider uppercase border border-red-400/40 shadow-lg shadow-red-600/30 broadcast-glow-red',
    cyber:
      'bg-slate-900 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-950/40 hover:border-cyan-400 font-mono text-xs uppercase tracking-wider',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
