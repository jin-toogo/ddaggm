import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token이 없습니다" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: "유효하지 않은 access token입니다" },
        { status: 401 }
      );
    }

    // 토큰 버전을 증가시켜 모든 토큰 무효화
    await prisma.user.update({
      where: { id: parseInt(payload.userId) },
      data: { tokenVersion: { increment: 1 } },
    });

    const response = NextResponse.json({
      success: true,
      message: "로그아웃되었습니다",
    });

    // 쿠키 제거
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    console.error("토큰 무효화 오류:", error);
    return NextResponse.json(
      { error: "로그아웃 중 오류가 발생했습니다" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}