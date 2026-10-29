import React, { useState, useRef } from 'react';
import { Camera, Loader2, Check, UploadCloud } from 'lucide-react';
import { api, setSession } from '../services/api';
import UserAvatar from './UserAvatar';

interface AvatarUploadFieldProps {
  currentAvatar?: string | null;
  userName?: string;
  userRole?: string;
  onAvatarUpdated: (newAvatarUrl: string) => void;
}

export default function AvatarUploadField({
  currentAvatar,
  userName = 'User',
  userRole = 'STUDENT',
  onAvatarUpdated,
}: AvatarUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }

    // Set instant client preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setUploading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newAvatarUrl = res.data.avatar;
      setPreview(newAvatarUrl);
      setSuccess(true);
      onAvatarUpdated(newAvatarUrl);

      // Update session storage
      const token = sessionStorage.getItem('token') || '';
      if (res.data.user) {
        setSession(token, res.data.user);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload image. Please try again.');
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
      {/* Avatar Preview with Camera Overlay */}
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <UserAvatar
          src={preview}
          name={userName}
          role={userRole}
          className="w-16 h-16 rounded-2xl border-2 border-white shadow-md object-cover"
        />

        {/* Hover / Uploading Overlay */}
        <div className="absolute inset-0 bg-black/45 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Uploading...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Photo Updated!</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload Profile Photo</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-1">
          Supports PNG, JPG, or WEBP up to 10MB.
        </p>

        {error && <p className="text-[11px] text-rose-600 font-semibold mt-1">⚠️ {error}</p>}
      </div>
    </div>
  );
}

