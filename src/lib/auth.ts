import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "@/lib/jwt";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "your-secret-key";

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  provider: "naver" | "kakao";
  region?: string;
  ageGroup?: string;
  gender?: "m" | "f" | "u";
  privacyAgreed: boolean;
  marketingAgreed?: boolean;
  interests?: Array<{
    id: number;
    categoryId: number;
    category: {
      id: number;
      name: string;
      slug: string;
      icon: string;
      description?: string;
    };
  }>;
}

export interface SessionData extends User {
  iat?: number;
  exp?: number;
  userId?: string;
  status?: "ACTIVE" | "PENDING" | "INACTIVE";
}

export function signToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;

    if (!userCookie) {
      return null;
    }

    return JSON.parse(userCookie);
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export function getSessionFromRequest(
  request: NextRequest
): SessionData | null {
  try {
    // JWT access token에서 세션 데이터 확인
    const accessToken = request.cookies.get("access_token")?.value;
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        return {
          id: payload.userId,
          userId: payload.userId,
          email: payload.email,
          provider: payload.provider as "naver" | "kakao",
          status: payload.status,
          privacyAgreed: payload.status === "ACTIVE",
        } as SessionData;
      }
    }

    // 기존 user 쿠키 fallback (하위 호환성)
    const userCookie = request.cookies.get("user")?.value;
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        return userData;
      } catch (error) {
        console.warn("쿠키 파싱 실패:", error);
      }
    }

    return null;
  } catch (error) {
    console.error("세션 확인 실패:", error);
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("user");
}

// 사용자 관심사 업데이트 함수
export async function updateUserInterests(
  userId: number,
  categoryIds: number[]
) {
  try {
    // 기존 관심사 삭제
    await prisma.userInterest.deleteMany({
      where: { userId },
    });

    // 새 관심사 추가
    if (categoryIds.length > 0) {
      await prisma.userInterest.createMany({
        data: categoryIds.map((categoryId) => ({
          userId,
          categoryId,
        })),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Update user interests error:", error);
    return { success: false, error: "Failed to update interests" };
  }
}

// 사용자 프로필 업데이트 함수
export async function updateUserProfile(
  userId: number,
  data: { region?: string; privacyAgreed?: boolean; marketingAgreed?: boolean }
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        agreedAt: data.privacyAgreed ? new Date() : undefined,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Update user profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// 사용자 정보 가져오기 (관심사 포함)
export async function getUserWithInterests(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        interests: {
          include: {
            category: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Get user with interests error:", error);
    return null;
  }
}
