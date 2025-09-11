import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // CRON 헤더 확인 (Vercel Cron 또는 내부 호출 검증)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "medihan-cleanup-secret";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 24시간 이전 시간 계산
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // PENDING 상태이면서 24시간이 지난 사용자들 찾기
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: twentyFourHoursAgo
        }
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true
      }
    });

    if (pendingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "정리할 PENDING 사용자가 없습니다.",
        cleanedCount: 0
      });
    }

    // 트랜잭션으로 관련 데이터 정리
    const result = await prisma.$transaction(async (tx) => {
      // 1. UserInterest 먼저 삭제 (외래 키 제약 조건)
      await tx.userInterest.deleteMany({
        where: {
          userId: {
            in: pendingUsers.map(user => user.id)
          }
        }
      });

      // 2. PENDING 사용자들 삭제
      const deletedUsers = await tx.user.deleteMany({
        where: {
          id: {
            in: pendingUsers.map(user => user.id)
          },
          status: 'PENDING' // 안전장치: PENDING 상태만 삭제
        }
      });

      return {
        deletedCount: deletedUsers.count,
        deletedUsers: pendingUsers
      };
    });

    console.log(`정리 완료: ${result.deletedCount}명의 PENDING 사용자 삭제`, {
      deletedUsers: result.deletedUsers.map(u => ({
        id: u.id,
        email: u.email,
        nickname: u.nickname,
        createdAt: u.createdAt
      }))
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount}명의 미완료 회원가입 데이터를 정리했습니다.`,
      cleanedCount: result.deletedCount,
      cleanedUsers: result.deletedUsers.map(u => ({
        email: u.email,
        nickname: u.nickname,
        createdAt: u.createdAt
      }))
    });

  } catch (error) {
    console.error("PENDING 사용자 정리 오류:", error);
    return NextResponse.json(
      { error: "정리 작업 중 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET 요청으로 현재 PENDING 사용자 수 확인
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "medihan-cleanup-secret";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pendingCount = await prisma.user.count({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: twentyFourHoursAgo
        }
      }
    });

    const totalPendingCount = await prisma.user.count({
      where: {
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      pendingUsersToClean: pendingCount,
      totalPendingUsers: totalPendingCount,
      cutoffTime: twentyFourHoursAgo.toISOString()
    });

  } catch (error) {
    console.error("PENDING 사용자 조회 오류:", error);
    return NextResponse.json(
      { error: "조회 작업 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}