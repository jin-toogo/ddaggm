import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.herbalProduct.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // 이미지 URL을 프록시로 변경
    const productsWithProxy = products.map(product => ({
      ...product,
      image: `/api/proxy/image?url=${encodeURIComponent(product.imageUrl)}`
    }));

    return NextResponse.json(productsWithProxy);
  } catch (error) {
    console.error('한방건기식 제품 로드 에러:', error);
    return NextResponse.json(
      { error: '제품 데이터를 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, category, description, price, brand, url, imageUrl } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: '제품명과 구매 링크는 필수입니다' },
        { status: 400 }
      );
    }

    // 다음 display order 계산
    const maxOrder = await prisma.herbalProduct.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true }
    });

    const nextDisplayOrder = (maxOrder?.displayOrder || 0) + 1;

    const product = await prisma.herbalProduct.create({
      data: {
        name: name.trim(),
        category: category || '기타',
        description: description || `${name.trim()} 제품입니다.`,
        price: price || '가격 문의',
        brand: brand || '온라인',
        url: url,
        imageUrl: imageUrl || '/api/proxy/image?url=https://via.placeholder.com/300x200?text=No+Image',
        displayOrder: nextDisplayOrder,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: '제품이 성공적으로 추가되었습니다',
      product
    });

  } catch (error) {
    console.error('제품 추가 에러:', error);
    return NextResponse.json(
      { error: '제품 추가에 실패했습니다' },
      { status: 500 }
    );
  }
}