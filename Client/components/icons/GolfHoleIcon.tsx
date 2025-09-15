import React from 'react';

interface GolfHoleIconProps {
  className?: string;
  size?: number;
}

export function GolfHoleIcon({ className = "", size = 24 }: GolfHoleIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
    >
      {/* Fondo blanco */}
      <rect width="64" height="64" rx="12" fill="#fff"/>

      {/* Definimos gradiente radial para efecto de profundidad */}
      <defs>
        <radialGradient id="holeGradient" cx="32" cy="32" r="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#111"/> {/* centro más oscuro */}
          <stop offset="50%" stopColor="#222"/> {/* intermedio */}
          <stop offset="100%" stopColor="#555"/> {/* borde más claro */}
        </radialGradient>
      </defs>

      {/* Hoyo con gradiente */}
      <ellipse cx="32" cy="32" rx="24" ry="12" fill="url(#holeGradient)"/>
    </svg>
  );
}
