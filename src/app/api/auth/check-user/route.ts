import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkDuplicateEmail } from "@/lib/auth-utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { provider, providerId, email } = await request.json();

    if (!provider || !providerId) {
      return NextResponse.json(
        { error: "필수 매개변수가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 찾기
    const user = await prisma.user.findFirst({
      where: {
        provider: provider.toLowerCase(),
        providerId: String(providerId),
      },
      include: {
        interests: {
          include: {
            category: true,
          },
        },
      },
    });

    // 중복 이메일 체크 (이메일이 있는 경우에만)
    let duplicateEmailResult;
    if (email) {
      duplicateEmailResult = await checkDuplicateEmail(email, provider);
    } else {
      duplicateEmailResult = { exists: false, accounts: [] };
    }

    if (user) {
      // 기존 사용자 존재
      return NextResponse.json({
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImage: user.profileImage,
          provider: user.provider,
          region: user.region,
          privacyAgreed: user.privacyAgreed,
          marketingAgreed: user.marketingAgreed,
          interests: user.interests.map((interest) => ({
            id: interest.id,
            categoryId: interest.categoryId,
            category: {
              ...interest.category,
              description: interest.category.description || undefined,
            },
          })),
        },
        duplicateEmail: duplicateEmailResult,
      });
    } else {
      // 신규 사용자
      return NextResponse.json({
        exists: false,
        user: null,
        duplicateEmail: duplicateEmailResult,
      });
    }

  } catch (error) {
    console.error("사용자 확인 오류:", error);
    return NextResponse.json(
      { error: "사용자 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}