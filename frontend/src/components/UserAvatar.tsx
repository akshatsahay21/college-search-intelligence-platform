import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  role?: 'STUDENT' | 'FACULTY' | 'ADMIN' | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function UserAvatar({
  src,
  name = 'User',
  role = 'STUDENT',
  className = '',
  size = 'md',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Compute initials (e.g. "Neha Sharma" -> "NS")
  const getInitials = (fullName: string) => {
    const clean = fullName.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Pick an elegant academic gradient based on role
  const getGradient = (userRole: string) => {
    switch (userRole) {
      case 'FACULTY':
        return 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white';
      case 'ADMIN':
        return 'bg-gradient-to-tr from-purple-800 via-violet-700 to-indigo-600 text-white';
      case 'STUDENT':
      default:
        return 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-pink-500 text-white';
    }
  };

  // Check if src is valid and NOT a cartoon robot dicebear avatar
  const hasValidCustomAvatar =
    src &&
    typeof src === 'string' &&
    src.trim().length > 0 &&
    !src.includes('bottts') &&
    !imgError;

  // Size preset classes if className doesn't override width/height
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl',
    xl: 'w-24 h-24 text-3xl',
  }[size];

  if (hasValidCustomAvatar) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`object-cover rounded-2xl select-none ${className || sizeClasses}`}
      />
    );
  }

  // Elegant Professional Monogram Initials Avatar
  return (
    <div
      className={`rounded-2xl flex items-center justify-center font-black tracking-wider uppercase shadow-inner select-none ${getGradient(
        role
      )} ${className || sizeClasses}`}
    >
      <span>{initials}</span>
    </div>
  );
}

