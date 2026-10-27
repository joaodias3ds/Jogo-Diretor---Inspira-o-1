/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'cyan' | 'red' | 'amber';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = 'none',
  bordered = true,
  className = '',
  ...props
}) => {
  const glowStyles = {
    none: '',
    cyan: 'border-cyan-500/40 shadow-lg shadow-cyan-950/50',
    red: 'border-red-500/40 shadow-lg shadow-red-950/50',
    amber: 'border-amber-500/40 shadow-lg shadow-amber-950/50',
  }[glow];

  return (
    <div
      className={`relative rounded-xl bg-slate-900/70 backdrop-blur-md p-4 sm:p-5 text-slate-100 ${
        bordered ? 'border border-slate-800/80' : ''
      } ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
