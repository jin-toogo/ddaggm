import jwt from "jsonwebtoken";

interface AccessTokenPayload {
  userId: string;
  email: string;
  provider: string;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  tokenVersion: number;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET 환경 변수가 설정되지 않았습니다.");
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "30m",
  } as any);
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET 환경 변수가 설정되지 않았습니다.");
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "14d",
  } as any);
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET 환경 변수가 설정되지 않았습니다.");
    }
    
    return jwt.verify(token, secret) as AccessTokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET 환경 변수가 설정되지 않았습니다.");
    }
    
    return jwt.verify(token, secret) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}