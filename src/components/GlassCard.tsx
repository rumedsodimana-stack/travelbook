'use client';
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", style, ...props }) => {
  return (
    <div
      style={style}
      {...props}
      className={`backdrop-blur-2xl bg-white/10 border border-white/30 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
};
