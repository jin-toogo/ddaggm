import { NextRequest, NextResponse } from 'next/server';
import { BlogReviewService } from '@/lib/services/blog-review-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { verified } = body;

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Verified status must be boolean' },
        { status: 400 }
      );
    }

    await BlogReviewService.verifyBlogPost(id, verified);

    return NextResponse.json({
      success: true,
      message: `블로그 포스트가 ${verified ? '검증됨' : '미검증'} 상태로 변경되었습니다.`
    });

  } catch (error) {
    console.error('Blog post verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}