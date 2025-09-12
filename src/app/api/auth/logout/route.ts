import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    // JWT 토큰이 있는 경우 무효화
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        // 토큰 버전을 증가시켜 모든 토큰 무효화
        await prisma.user.update({
          where: { id: parseInt(payload.userId) },
          data: { tokenVersion: { increment: 1 } },
        });
      }
    }

    const response = NextResponse.json({ 
      success: true,
      message: "로그아웃되었습니다"
    });

    // JWT 쿠키 삭제
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    
    // 기존 user 쿠키도 삭제 (하위 호환성)
    response.cookies.delete("user");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
