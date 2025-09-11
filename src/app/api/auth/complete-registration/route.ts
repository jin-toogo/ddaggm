import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTemporarySession, clearTemporarySession } from "@/lib/temp-session";
import { CompleteRegistrationRequest } from "@/types/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const completeRegistrationSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  ageGroup: z.string().optional(),
  gender: z.enum(["m", "f", "u"]).optional(),
  privacyAgreed: z
    .boolean()
    .refine((val) => val === true, "개인정보처리방침에 동의해주세요"),
  termsAgreed: z
    .boolean()
    .refine((val) => val === true, "이용약관에 동의해주세요"),
  marketingAgreed: z.boolean().optional().default(false),
  categoryIds: z.array(z.number()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    // 1. 임시 세션 검증
    const session = getTemporarySession(request);
    if (!session) {
      return NextResponse.json(
        { error: "유효하지 않은 세션입니다. 다시 로그인해주세요." },
        { status: 401 }
      );
    }

    // 2. 요청 데이터 검증
    const body: CompleteRegistrationRequest = await request.json();
    const validatedData = completeRegistrationSchema.parse(body);

    // 3. 이메일 중복 재검사 (경합 상황 대비)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: session.email },
          { provider: session.provider, providerId: session.providerId },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 가입된 계정입니다. 로그인을 시도해주세요." },
        { status: 409 }
      );
    }

    // 4. Two-Phase Registration: Phase 1 - PENDING 상태로 사용자 생성
    const result = await prisma.$transaction(async (tx) => {
      // Phase 1: PENDING 상태로 사용자 생성
      const newUser = await tx.user.create({
        data: {
          email: session.email,
          nickname: validatedData.nickname.trim(),
          profileImage: session.profileImage || undefined,
          ageGroup: validatedData.ageGroup || session.ageGroup || null,
          gender: validatedData.gender || session.gender || null,
          provider: session.provider,
          providerId: session.providerId,
          privacyAgreed: validatedData.privacyAgreed,
          termsAgreed: validatedData.termsAgreed,
          marketingAgreed: validatedData.marketingAgreed || false,
          status: "PENDING", // 초기 상태는 PENDING
        },
      });

      // 관심사 설정 (있는 경우)
      if (validatedData.categoryIds.length > 0) {
        await tx.userInterest.createMany({
          data: validatedData.categoryIds.map((categoryId) => ({
            userId: newUser.id,
            categoryId,
          })),
        });
      }

      // 생성된 사용자 정보 조회 (관심사는 제외 - 쿠키 크기 문제)
      const userWithoutInterests = await tx.user.findUnique({
        where: { id: newUser.id },
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

      return userWithoutInterests;
    });

    if (!result) {
      throw new Error("사용자 생성에 실패했습니다");
    }

    // 5. 세션 사용자 객체 생성 (쿠키 크기 최소화)
    const sessionUser = {
      id: result.id.toString(),
      email: result.email,
      nickname: result.nickname,
      profileImage: result.profileImage || undefined,
      provider: result.provider,
      privacyAgreed: result.privacyAgreed,
      status: result.status, // PENDING 상태 포함
      // interests는 별도 API로 조회하도록 변경 (쿠키 크기 문제 해결)
    };

    // 6. Phase 2를 위한 응답 설정 (userId 포함)
    const response = NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다",
      user: sessionUser,
      userId: result.id, // Phase 2 활성화를 위한 ID
    });

    // 7. 임시 세션 삭제 및 임시 정식 세션 설정 (PENDING 상태)
    clearTemporarySession(response);
    response.cookies.set("user", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7일
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("완료 등록 오류:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
