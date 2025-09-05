import { NextRequest, NextResponse } from 'next/server';
import { BlogReviewService } from '@/lib/services/blog-review-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, clinicName, clinicAddress, notes } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Blog URL is required' },
        { status: 400 }
      );
    }

    const csvRow = {
      blog_url: url,
      clinic_name: clinicName,
      clinic_address: clinicAddress,
      notes: notes
    };

    await BlogReviewService.processSingleBlogUrl(csvRow);

    return NextResponse.json({
      success: true,
      message: '블로그 포스트가 성공적으로 추가되었습니다.'
    });

  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}