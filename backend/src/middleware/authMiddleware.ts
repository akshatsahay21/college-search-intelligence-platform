import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'college_super_secret_jwt_key_2026_genz_platform';

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  name?: string;
  department?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden. Required role: [${allowedRoles.join(' or ')}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

export const adminOnly = authorize(['ADMIN']);
export const facultyOrAdmin = authorize(['FACULTY', 'ADMIN']);
export const studentOnly = authorize(['STUDENT']);
