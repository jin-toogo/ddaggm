import { NextRequest, NextResponse } from 'next/server';
import { TemporaryUserSession } from '@/types/auth';

import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'change-this-key-in-production-make-it-32-chars';
const COOKIE_NAME = 'pendingUser';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  try {
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to base64 encoding if crypto fails
    return Buffer.from(text).toString('base64');
  }
}

function decrypt(encryptedText: string): string {
  try {
    // Check if it's the new format (with IV and auth tag)
    if (encryptedText.includes(':')) {
      const parts = encryptedText.split(':');
      if (parts.length === 3) {
        const [ivHex, authTagHex, encryptedData] = parts;
        const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipher(ALGORITHM, key);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }
    }
    
    // Fallback to base64 decoding for backward compatibility
    return Buffer.from(encryptedText, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Invalid session data');
  }
}

export function createTemporarySession(
  response: NextResponse,
  sessionData: Omit<TemporaryUserSession, 'timestamp'>
): void {
  const session: TemporaryUserSession = {
    ...sessionData,
    timestamp: Date.now(),
  };

  const encryptedSession = encrypt(JSON.stringify(session));

  response.cookies.set(COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION / 1000, // in seconds
    sameSite: 'lax',
    path: '/',
  });
}

export function getTemporarySession(request: NextRequest): TemporaryUserSession | null {
  try {
    const encryptedSession = request.cookies.get(COOKIE_NAME)?.value;
    if (!encryptedSession) return null;

    const sessionJson = decrypt(encryptedSession);
    const session: TemporaryUserSession = JSON.parse(sessionJson);

    // Check expiration
    if (Date.now() - session.timestamp > SESSION_DURATION) {
      return null; // Expired
    }

    return session;
  } catch (error) {
    console.error('Failed to parse temporary session:', error);
    return null;
  }
}

export function clearTemporarySession(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    sameSite: 'lax',
    path: '/',
  });
}

// Client-side utility for getting session data
export function getTemporarySessionClient(): TemporaryUserSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Since it's httpOnly, we'll need to fetch from API
    // This is a placeholder - the real implementation will use an API call
    return null;
  } catch {
    return null;
  }
}