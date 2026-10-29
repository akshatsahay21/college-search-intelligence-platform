import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  department: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;

  // Student specific
  rollNumber?: string;
  semester?: number;
  batch?: string;
  quizzesTaken?: number;
  streakDays?: number;

  // Faculty specific
  employeeId?: string;
  designation?: string;
  specialization?: string;
  officeRoom?: string;
}

export const getStoredUser = (): UserSession | null => {
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (token: string, user: UserSession) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('user-profile-updated'));
  }
};

export const clearSession = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};
