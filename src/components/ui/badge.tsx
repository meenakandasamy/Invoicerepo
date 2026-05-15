// src/components/ui/badge.tsx
import * as React from 'react';

interface BadgeProps {
  text: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, className = '' }) => {
  return (
    <span
      className={`inline-block bg-blue-500 text-white px-2 py-1 rounded-full ${className}`}
    >
      {text}
    </span>
  );
};
