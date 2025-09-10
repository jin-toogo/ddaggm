import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { signToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { 
      provider, 
      providerId, 
      email, 
      nickname, 
      ageGroup, 
      gender, 
      profileImageUrl 
    } = await request.json();


    if (!provider || !providerId || !email || !nickname) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 중복 사용자 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { 
            provider: provider.toLowerCase(),
            providerId: String(providerId)
          },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 가입된 사용자입니다." },
        { status: 400 }
      );
    }

    // 새 사용자 생성 (가이드 패턴)
    const user = await prisma.user.create({
      data: {
        email,
        nickname: nickname, // nickname 컬럼으로 저장
        profileImage: profileImageUrl,
        provider: provider.toLowerCase(),
        providerId: String(providerId),
        region: ageGroup, // 임시로 ageGroup을 region에 저장 (스키마에 맞춤)
        privacyAgreed: true, // additional-info에서 입력하면 동의한 것으로 간주
        marketingAgreed: false, // 기본값
      },
      include: {
        interests: {
          include: {
            category: true
          }
        }
      }
    });


    // 가이드 패턴에 맞는 사용자 데이터 구조
    const userData = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      provider: user.provider,
      region: user.region,
      privacyAgreed: user.privacyAgreed,
      marketingAgreed: user.marketingAgreed,
      interests: user.interests.map(interest => ({
        id: interest.id,
        categoryId: interest.categoryId,
        category: {
          ...interest.category,
          description: interest.category.description || undefined
        }
      }))
    };

    // JWT 토큰 생성 및 쿠키 설정
    const token = signToken({
      id: String(user.id),
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage || undefined,
      provider: user.provider as 'naver' | 'kakao',
      region: user.region || undefined,
      privacyAgreed: user.privacyAgreed,
      marketingAgreed: user.marketingAgreed || undefined,
      interests: user.interests.map(interest => ({
        id: interest.id,
        categoryId: interest.categoryId,
        category: {
          id: interest.category.id,
          name: interest.category.name,
          slug: interest.category.slug,
          icon: interest.category.icon,
          description: interest.category.description || undefined
        }
      }))
    });

    // 응답에 쿠키 설정
    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('사용자 등록 오류:', error);
    return NextResponse.json(
      { error: "사용자 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}