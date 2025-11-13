import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from './storage';
import { users, sessions, type User } from '../shared/schema';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthRequest extends Request {
  user?: User;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  static async createSession(userId: string): Promise<string> {
    const token = this.generateToken(userId);
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await db.insert(sessions).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  static async validateSession(token: string): Promise<User | null> {
    try {
      const [session] = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date())
        ))
        .limit(1);

      if (!session) {
        return null;
      }

      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, session.userId),
          eq(users.isActive, true)
        ))
        .limit(1);

      return user || null;
    } catch {
      return null;
    }
  }

  static async invalidateSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  static async cleanExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(
      lt(sessions.expiresAt, new Date())
    );
  }
}

// Middleware for authentication
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const user = await AuthService.validateSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Erreur d\'authentification' });
  }
};

// Middleware for admin-only routes
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }
    next();
  });
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token;

    if (token) {
      const user = await AuthService.validateSession(token);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch {
    // Continue without authentication
    next();
  }
};