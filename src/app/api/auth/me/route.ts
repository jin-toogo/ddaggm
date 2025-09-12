import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.userId) },
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImage: true,
        provider: true,
        status: true,
        privacyAgreed: true,
        termsAgreed: true,
        marketingAgreed: true,
        region: true,
        ageGroup: true,
        gender: true,
        createdAt: true,
        interests: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!user || user.id.toString() !== payload.userId) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        userId: user.id.toString(),
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        provider: user.provider,
        status: user.status,
        privacyAgreed: user.privacyAgreed,
        termsAgreed: user.termsAgreed,
        marketingAgreed: user.marketingAgreed,
        region: user.region,
        ageGroup: user.ageGroup,
        gender: user.gender,
        createdAt: user.createdAt,
        interests: user.interests,
      },
    });
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}