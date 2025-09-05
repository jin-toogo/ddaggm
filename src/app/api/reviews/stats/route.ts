import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 통계 데이터 병렬로 조회
    const [
      totalPosts,
      totalClinics,
      recentPosts,
      categoryStats
    ] = await Promise.all([
      // 총 검증된 포스트 수
      prisma.blogPost.count({
        where: { 
          isVerified: true,
          isMatched: true 
        }
      }),
      
      // 매칭된 한의원 수
      prisma.blogPost.findMany({
        where: { 
          isMatched: true,
          hospitalId: { not: null }
        },
        select: { hospitalId: true },
        distinct: ['hospitalId']
      }),

      // 최근 7일간 추가된 포스트
      prisma.blogPost.count({
        where: {
          isVerified: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7일 전
          }
        }
      }),

      // 카테고리별 포스트 수
      prisma.blogPost.findMany({
        where: { 
          isVerified: true,
          isMatched: true 
        },
        select: { categories: true }
      })
    ]);

    // 카테고리 통계 처리
    const categoryCount: Record<string, number> = {};
    categoryStats.forEach(post => {
      const categories = post.categories.split(',').filter(Boolean);
      categories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        totalPosts,
        totalClinics: totalClinics.length,
        recentActivity: recentPosts,
        categories: categoryCount
      }
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}