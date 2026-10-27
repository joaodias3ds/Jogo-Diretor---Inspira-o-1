/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'live' | 'danger' | 'warning' | 'success' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider font-semibold',
    md: 'text-xs px-2.5 py-1 tracking-wide font-medium',
  }[size];

  const variantStyles = {
    live: 'bg-red-950/80 text-red-400 border border-red-500/40 uppercase font-mono tracking-widest',
    danger: 'bg-red-950/60 text-red-300 border border-red-800/40',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-800/40',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40',
    info: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40',
    neutral: 'bg-slate-800/70 text-slate-300 border border-slate-700/50',
    purple: 'bg-purple-950/60 text-purple-300 border border-purple-800/40',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {children}
    </span>
  );
};
