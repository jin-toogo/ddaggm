import { NextRequest, NextResponse } from 'next/server';
import { BlogReviewService } from '@/lib/services/blog-review-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hospitalId } = body;

    if (!hospitalId) {
      return NextResponse.json(
        { success: false, error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    await BlogReviewService.matchBlogPostToHospital(id, parseInt(hospitalId));

    return NextResponse.json({
      success: true,
      message: '블로그 포스트가 한의원과 성공적으로 매칭되었습니다.'
    });

  } catch (error) {
    console.error('Blog post matching error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}