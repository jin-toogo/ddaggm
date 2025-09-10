import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 요청 데이터 검증 스키마
const updateInterestsSchema = z.object({
  categoryIds: z.array(z.number().positive()).max(10, '최대 10개까지 선택 가능합니다'),
});

export async function PUT(request: NextRequest) {
  try {
    // 세션 확인
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const validatedData = updateInterestsSchema.parse(body);
    const { categoryIds } = validatedData;

    const userId = parseInt(session.id);

    // 카테고리 존재 확인
    if (categoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          isActive: true,
        },
      });

      if (existingCategories.length !== categoryIds.length) {
        return NextResponse.json(
          { error: '일부 카테고리가 유효하지 않습니다' },
          { status: 400 }
        );
      }
    }

    // 사용자 정보 확인 (온보딩 상태 체크)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { privacyAgreed: true },
    });

    // 기존 관심사 삭제 및 새로운 관심사 추가 (트랜잭션)
    await prisma.$transaction([
      // 기존 관심사 삭제
      prisma.userInterest.deleteMany({
        where: { userId },
      }),
      // 새로운 관심사 추가
      ...(categoryIds.length > 0
        ? [
            prisma.userInterest.createMany({
              data: categoryIds.map(categoryId => ({
                userId,
                categoryId,
              })),
            }),
          ]
        : []),
      // 온보딩 완료 처리 (처음 관심사 설정하는 경우)
      ...(!currentUser?.privacyAgreed
        ? [
            prisma.user.update({
              where: { id: userId },
              data: {
                privacyAgreed: true,
                agreedAt: new Date(),
              },
            }),
          ]
        : []),
    ]);

    // 업데이트된 사용자 관심사 정보 반환
    const updatedUserInterests = await prisma.user.findUnique({
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: '관심사가 성공적으로 업데이트되었습니다',
      interests: updatedUserInterests?.interests || [],
    });

  } catch (error) {
    console.error('Update interests error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '관심사 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 사용자 관심사 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.id) },
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
              displayOrder: 'asc',
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      interests: user.interests,
      totalCount: user.interests.length,
    });

  } catch (error) {
    console.error('Get interests error:', error);
    return NextResponse.json(
      { error: '관심사 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}