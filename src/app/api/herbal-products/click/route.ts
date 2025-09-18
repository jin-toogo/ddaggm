import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '제품 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 클릭 수 증가
    await prisma.herbalProduct.update({
      where: {
        id: parseInt(productId)
      },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('클릭 카운트 업데이트 에러:', error);
    return NextResponse.json(
      { error: '클릭 카운트 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}