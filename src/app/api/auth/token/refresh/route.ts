import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token이 없습니다" },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "유효하지 않은 refresh token입니다" },
        { status: 401 }
      );
    }

    // 사용자 정보 및 토큰 버전 확인
    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.userId) },
      select: {
        id: true,
        email: true,
        nickname: true,
        provider: true,
        status: true,
        tokenVersion: true,
        privacyAgreed: true,
      },
    });

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return NextResponse.json(
        { error: "토큰이 무효화되었습니다" },
        { status: 401 }
      );
    }

    // 새로운 access token 생성
    const newAccessToken = generateAccessToken({
      userId: user.id.toString(),
      email: user.email,
      provider: user.provider,
      status: user.status,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json({
      success: true,
      message: "토큰이 갱신되었습니다",
    });

    // 새로운 access token을 쿠키에 설정
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60, // 30분
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("토큰 갱신 오류:", error);
    return NextResponse.json(
      { error: "토큰 갱신 중 오류가 발생했습니다" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}