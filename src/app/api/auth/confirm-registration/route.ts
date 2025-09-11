import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Phase 2: PENDING 상태의 사용자를 ACTIVE로 변경
    const activatedUser = await prisma.user.update({
      where: { 
        id: parseInt(userId), 
        status: 'PENDING' // PENDING 상태인 경우에만 업데이트
      },
      data: { 
        status: 'ACTIVE',
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImage: true,
        provider: true,
        privacyAgreed: true,
        status: true,
      },
    });

    if (!activatedUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없거나 이미 활성화되었습니다." },
        { status: 404 }
      );
    }

    // 활성화된 사용자 정보로 세션 업데이트
    const sessionUser = {
      id: activatedUser.id.toString(),
      email: activatedUser.email,
      nickname: activatedUser.nickname,
      profileImage: activatedUser.profileImage || undefined,
      provider: activatedUser.provider,
      privacyAgreed: activatedUser.privacyAgreed,
      status: activatedUser.status, // ACTIVE 상태
    };

    const response = NextResponse.json({
      success: true,
      message: "사용자가 성공적으로 활성화되었습니다.",
      user: sessionUser,
    });

    // 쿠키 업데이트
    response.cookies.set("user", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7일
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("사용자 활성화 오류:", error);
    return NextResponse.json(
      { error: "사용자 활성화 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}