import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Prisma 인스턴스를 재사용하도록 수정
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 프로필 업데이트 스키마
const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다")
    .max(20, "닉네임은 20자 이하여야 합니다")
    .optional(),
  region: z.string().nullable().optional(),
  ageGroup: z.string().nullable().optional(),
  gender: z.enum(["m", "f", "u"]).nullable().optional(),
  privacyAgreed: z.boolean().optional(),
  marketingAgreed: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // 사용자 프로필 조회
    const userId = parseInt(session.id);

    // 먼저 원시 쿼리로 확인
    const allUsersRaw = await prisma.$queryRaw`SELECT * FROM users`;

    const rawUser =
      await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        interests: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                description: true,
                displayOrder: true,
              },
            },
          },
          orderBy: {
            category: {
              displayOrder: "asc",
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        provider: user.provider,
        region: user.region,
        ageGroup: user.ageGroup,
        gender: user.gender,
        privacyAgreed: user.privacyAgreed,
        marketingAgreed: user.marketingAgreed,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "프로필 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 세션 확인
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // 요청 데이터 파싱 및 검증
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);
    const {
      nickname,
      region,
      ageGroup,
      gender,
      privacyAgreed,
      marketingAgreed,
    } = validatedData;

    // 닉네임 중복 체크 (변경하는 경우에만)
    if (nickname) {
      const existingUser = await prisma.user.findFirst({
        where: {
          nickname,
          NOT: { id: parseInt(session.id) },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "이미 사용 중인 닉네임입니다" },
          { status: 400 }
        );
      }
    }

    // 프로필 업데이트
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (nickname !== undefined) {
      updateData.nickname = nickname;
    }

    if (region !== undefined) {
      updateData.region = region || null;
    }

    if (ageGroup !== undefined) {
      updateData.ageGroup = ageGroup || null;
    }

    if (gender !== undefined) {
      updateData.gender = gender || null;
    }

    if (privacyAgreed !== undefined) {
      updateData.privacyAgreed = privacyAgreed;
    }

    if (marketingAgreed !== undefined) {
      updateData.marketingAgreed = marketingAgreed;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.id) },
      data: updateData,
      include: {
        interests: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                description: true,
                displayOrder: true,
              },
            },
          },
          orderBy: {
            category: {
              displayOrder: "asc",
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "프로필이 성공적으로 업데이트되었습니다",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        profileImage: updatedUser.profileImage,
        provider: updatedUser.provider,
        region: updatedUser.region,
        ageGroup: updatedUser.ageGroup,
        gender: updatedUser.gender,
        privacyAgreed: updatedUser.privacyAgreed,
        marketingAgreed: updatedUser.marketingAgreed,
        interests: updatedUser.interests,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력 데이터가 올바르지 않습니다", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
