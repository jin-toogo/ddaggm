import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { signToken, User } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      name, 
      profileImage, 
      provider, 
      providerId, 
      privacyAgreed = false,
      marketingAgreed = false,
      region 
    } = await request.json();

    if (!email || !name || !provider || !providerId) {
      return NextResponse.json(
        { error: "필수 매개변수가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 사용자가 이미 존재하는지 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          {
            AND: [
              { provider: provider.toLowerCase() },
              { providerId: String(providerId) },
            ],
          },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 사용자입니다." },
        { status: 409 }
      );
    }

    // 새 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        nickname: name,
        profileImage,
        provider: provider.toLowerCase(),
        providerId: String(providerId),
        privacyAgreed,
        marketingAgreed,
        region,
        agreedAt: privacyAgreed ? new Date() : null,
      },
      include: {
        interests: {
          include: {
            category: true,
          },
        },
      },
    });

    // JWT 토큰 생성
    const sessionUser: User = {
      id: newUser.id.toString(),
      email: newUser.email,
      nickname: newUser.nickname,
      profileImage: newUser.profileImage || undefined,
      provider: newUser.provider as 'naver' | 'kakao',
      region: newUser.region || undefined,
      privacyAgreed: newUser.privacyAgreed,
      marketingAgreed: newUser.marketingAgreed || undefined,
      interests: newUser.interests.map((interest) => ({
        id: interest.id,
        categoryId: interest.categoryId,
        category: {
          ...interest.category,
          description: interest.category.description || undefined,
        },
      })),
    };

    const token = signToken(sessionUser);

    // 세션 쿠키 설정을 위한 응답
    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      token,
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7일
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("사용자 생성 오류:", error);
    return NextResponse.json(
      { error: "사용자 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}