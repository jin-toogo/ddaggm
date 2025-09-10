import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSessionFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    // 현재 로그인된 사용자 확인
    const session = getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);

    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관련 데이터를 먼저 삭제 (외래키 제약조건 때문)
    // 1. 사용자 관심사 삭제
    await prisma.userInterest.deleteMany({
      where: { userId: userId }
    });

    // 2. 사용자 계정 삭제 (Cascade로 관련 데이터 자동 삭제)
    await prisma.user.delete({
      where: { id: userId }
    });


    // 쿠키 삭제를 위한 응답 생성
    const response = NextResponse.json({
      success: true,
      message: "회원탈퇴가 완료되었습니다."
    });

    // 모든 인증 관련 쿠키 강제 삭제
    response.cookies.set('session', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    response.cookies.set('user', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('회원탈퇴 처리 오류:', error);
    return NextResponse.json(
      { error: "회원탈퇴 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}